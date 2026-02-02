import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { KeycloakService } from '../service/keycloak.service';
import { UsuarioMantenimientoService } from '../service/usuario-mantenimiento.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private keycloakService: KeycloakService, 
    private router: Router,
    private usuarioService: UsuarioMantenimientoService
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | boolean {
    // 1. Verificar autenticación en Keycloak
    if (!this.keycloakService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    
    // 2. Verificar roles requeridos si están definidos en la ruta
    const requiredRoles = route.data['roles'] as string[];
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRequiredRole = this.keycloakService.hasAnyRole(requiredRoles);
      if (!hasRequiredRole) {
        this.router.navigate(['/administracion/dashboard']);
        return false;
      }
    }

    // 3. 🛡️ VALIDACIÓN CRÍTICA: Verificar estado activo en BD local
    return this.usuarioService.getCurrentUser().pipe(
      map(user => {
        // Si el usuario no existe en BD local, permitir auto-sincronización
        if (!user.id) {
          return true;
        }

        // Si existe, verificar que esté activo
        if (user.activo === false) {
          // Redirigir a página de acceso denegado
          this.router.navigate(['/acceso-denegado'], {
            queryParams: { 
              motivo: 'usuario-desactivado',
              usuario: user.nombreCompleto 
            }
          });
          return false;
        }

        return true;
      }),
      catchError(error => {
        // En caso de error, permitir acceso (modo degradado)
        // Esto evita bloquear el sistema si hay problemas de conectividad
        return of(true);
      })
    );
  }
}
