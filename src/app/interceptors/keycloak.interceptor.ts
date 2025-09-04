import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { KeycloakService } from '../service/keycloak.service';

@Injectable()
export class KeycloakInterceptor implements HttpInterceptor {
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
}
