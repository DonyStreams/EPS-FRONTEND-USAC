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

@Injectable()
export class KeycloakInterceptor implements HttpInterceptor {
  private isRefreshing = false;

  constructor(
    private keycloakService: KeycloakService,
    private router: Router
  ) {}

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
          // Token expirado - intentar renovar
          if (error.status === 401 && !this.isRefreshing) {
            console.warn('🔄 Token expirado, intentando renovar...');
            return this.handleTokenExpired(req, next);
          }
          
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
      console.log('❌ Interceptor - No hay token disponible, enviando request sin autorización');
    }

    return next.handle(req);
  }

  /**
   * Maneja la renovación del token cuando expira
   */
  private handleTokenExpired(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.isRefreshing = true;

    return from(this.keycloakService.updateToken(30)).pipe(
      switchMap((refreshed: boolean) => {
        this.isRefreshing = false;
        
        if (refreshed) {
          console.log('✅ Token renovado exitosamente');
          // Reintentar la petición con el nuevo token
          const newToken = this.keycloakService.getToken();
          const cloned = req.clone({
            setHeaders: {
              Authorization: `Bearer ${newToken}`
            }
          });
          return next.handle(cloned);
        } else {
          // Token no se pudo renovar, pero aún es válido
          console.log('ℹ️ Token aún válido, reintentando...');
          return next.handle(req);
        }
      }),
      catchError((error) => {
        this.isRefreshing = false;
        console.error('❌ No se pudo renovar el token, redirigiendo a login...');
        // Sesión expirada completamente, ir a login
        this.keycloakService.login();
        return throwError(error);
      })
    );
  }
}
