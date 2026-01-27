import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { KeycloakService } from '../service/keycloak.service';
import { MessageService } from 'primeng/api';

@Injectable()
export class KeycloakInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private failedAttempts = 0;
  private readonly MAX_FAILED_ATTEMPTS = 2;
  private sessionExpiredMessageShown = false;

  constructor(
    private keycloakService: KeycloakService,
    private router: Router,
    private messageService: MessageService
  ) {
    // Escuchar cuando la sesión expira desde el servicio Keycloak
    this.keycloakService.onSessionExpired.subscribe((expired) => {
      if (expired && !this.sessionExpiredMessageShown) {
        this.showSessionExpiredMessage();
      }
    });
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.keycloakService.getToken();

    // console.log('🔑 Interceptor - URL:', req.url);
    // console.log('🔑 Interceptor - Token disponible:', !!token);
    // console.log('🔑 Interceptor - Usuario logueado:', this.keycloakService.isLoggedIn());
    
    if (token) {
      // console.log('🔑 Interceptor - Agregando token Bearer al header');
      // console.log('🔑 Interceptor - Token length:', token.length);
      // console.log('🔑 Interceptor - Token preview:', token.substring(0, 50) + '...');
      
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return next.handle(cloned).pipe(
        catchError((error: HttpErrorResponse) => {
          console.warn('🔴 Error HTTP:', error.status, error.url);
          
          // Token expirado - intentar renovar o redirigir
          if (error.status === 401) {
            this.failedAttempts++;
            console.warn(`🔴 401 detectado (intento ${this.failedAttempts}/${this.MAX_FAILED_ATTEMPTS})`);
            
            // Si ya fallamos varias veces, forzar redirect
            if (this.failedAttempts >= this.MAX_FAILED_ATTEMPTS) {
              console.error('❌ Múltiples 401, sesión definitivamente expirada');
              this.failedAttempts = 0;
              this.isRefreshing = false;
              this.redirectToLogin();
              return throwError(error);
            }
            
            if (this.isRefreshing) {
              // Ya estamos intentando renovar, esperar
              console.warn('⏳ Ya hay renovación en progreso...');
              return throwError(error);
            }
            
            console.warn('🔄 Token expirado (401), intentando renovar...');
            return this.handleTokenExpired(req, next);
          }
          
          // Reset counter en otras peticiones exitosas
          this.failedAttempts = 0;
          
          if (error.status === 403 && error.error?.codigo === 'USUARIO_DESACTIVADO') {
            console.warn('🚫 Usuario desactivado detectado, redirigiendo...');
            this.router.navigate(['/acceso-denegado'], {
              queryParams: { 
                motivo: 'usuario-desactivado',
                usuario: error.error.usuario
              }
            });
          }
          return throwError(error);
        })
      );
    } else {
      // No hay token - verificar si debería haber sesión activa
      console.warn('❌ Interceptor - No hay token disponible');
      
      // Si Keycloak dice que está autenticado pero no hay token, la sesión expiró
      if (this.keycloakService.isLoggedIn()) {
        console.warn('⚠️ Keycloak dice autenticado pero no hay token - sesión corrupta');
        this.redirectToLogin();
        return throwError({ status: 401, message: 'Sesión expirada - token no disponible' });
      }
      
      // Manejar 401 cuando se envía sin token
      return next.handle(req).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            console.warn('🔴 401 sin token - sesión expirada, redirigiendo...');
            this.redirectToLogin();
          }
          return throwError(error);
        })
      );
    }
  }

  /**
   * Maneja la renovación del token cuando expira
   */
  private handleTokenExpired(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.isRefreshing = true;

    // Verificar primero si el usuario está logueado
    if (!this.keycloakService.isLoggedIn()) {
      console.warn('❌ Usuario no está logueado, redirigiendo al login...');
      this.isRefreshing = false;
      this.failedAttempts = 0;
      this.redirectToLogin();
      return throwError({ status: 401, message: 'Sesión expirada' });
    }

    return from(this.keycloakService.updateToken(30)).pipe(
      switchMap((refreshed: boolean) => {
        this.isRefreshing = false;
        
        const newToken = this.keycloakService.getToken();
        
        // Verificar que realmente tenemos un token válido
        if (!newToken) {
          console.warn('❌ No hay token después de renovar, redirigiendo al login...');
          this.failedAttempts = 0;
          this.redirectToLogin();
          return throwError({ status: 401, message: 'No se pudo obtener token' });
        }
        
        // Reset de intentos fallidos ya que renovamos exitosamente
        this.failedAttempts = 0;
        
        if (refreshed) {
          console.log('✅ Token renovado exitosamente');
        } else {
          console.log('ℹ️ Token aún válido');
        }
        
        // Reintentar la petición con el token
        const cloned = req.clone({
          setHeaders: {
            Authorization: `Bearer ${newToken}`
          }
        });
        return next.handle(cloned);
      }),
      catchError((error) => {
        this.isRefreshing = false;
        this.failedAttempts = 0;
        console.error('❌ Error al renovar token:', error);
        this.redirectToLogin();
        return throwError(error);
      })
    );
  }

  /**
   * Muestra el mensaje de sesión expirada (solo una vez)
   */
  private showSessionExpiredMessage(): void {
    if (this.sessionExpiredMessageShown) return;
    
    this.sessionExpiredMessageShown = true;
    this.messageService.add({
      severity: 'warn',
      summary: 'Sesión expirada',
      detail: 'Tu sesión ha expirado. Serás redirigido al inicio de sesión.',
      life: 4000,
      sticky: true
    });
  }

  /**
   * Muestra mensaje y redirige al login
   */
  private redirectToLogin(): void {
    this.showSessionExpiredMessage();
    
    // Esperar un momento para que el usuario vea el mensaje
    setTimeout(() => {
      this.keycloakService.login();
    }, 2000);
  }
}
