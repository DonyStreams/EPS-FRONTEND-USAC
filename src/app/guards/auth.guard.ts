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
    console.log('[AuthGuard] 🔍 Verificando acceso a ruta:', route.url);
    console.log('[AuthGuard] 🔑 Usuario autenticado en Keycloak:', this.keycloakService.isLoggedIn());
    
    // 1. Verificar autenticación en Keycloak
    if (!this.keycloakService.isLoggedIn()) {
      console.log('[AuthGuard] ❌ Usuario NO autenticado, redirigiendo a login');
      this.router.navigate(['/auth/login']);
      return false;
    }

  //  console.log('[AuthGuard] ✅ Usuario autenticado en Keycloak, verificando roles...');
    
    // 2. Verificar roles requeridos si están definidos en la ruta
    const requiredRoles = route.data['roles'] as string[];
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRequiredRole = this.keycloakService.hasAnyRole(requiredRoles);
      if (!hasRequiredRole) {
        console.warn('[AuthGuard] ❌ Acceso denegado. Roles requeridos:', requiredRoles);
        console.warn('[AuthGuard] 👤 Roles del usuario:', this.keycloakService.getUserRoles());
        this.router.navigate(['/administracion/dashboard']);
        return false;
      }
    }

    // 3. 🛡️ VALIDACIÓN CRÍTICA: Verificar estado activo en BD local
    console.log('[AuthGuard] 🔍 Verificando estado activo en sistema local...');
    
    return this.usuarioService.getCurrentUser().pipe(
      map(user => {
        console.log('[AuthGuard] 📋 Usuario obtenido:', user);
        
        // Si el usuario no existe en BD local, permitir auto-sincronización
        if (!user.id) {
          console.log('[AuthGuard] ⚡ Usuario no sincronizado, permitiendo auto-sincronización');
          return true;
        }

        // Si existe, verificar que esté activo
        if (user.activo === false) {
          console.warn('[AuthGuard] 🚫 ACCESO DENEGADO: Usuario desactivado en el sistema');
          console.warn('[AuthGuard] 👤 Usuario:', user.nombreCompleto);
          
          // Redirigir a página de acceso denegado
          this.router.navigate(['/acceso-denegado'], {
            queryParams: { 
              motivo: 'usuario-desactivado',
              usuario: user.nombreCompleto 
            }
          });
          return false;
        }

       // console.log('[AuthGuard] ✅ Usuario activo en el sistema, acceso permitido');
        return true;
      }),
      catchError(error => {
        console.error('[AuthGuard] ❌ Error al verificar usuario:', error);
        
        // En caso de error, permitir acceso (modo degradado)
        // Esto evita bloquear el sistema si hay problemas de conectividad
        console.warn('[AuthGuard] ⚠️ Modo degradado: Permitiendo acceso por error de verificación');
        return of(true);
      })
    );
  }
}
