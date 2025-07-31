import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { KeycloakService } from '../service/keycloak.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private keycloakService: KeycloakService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    console.log('[AuthGuard] Verificando acceso a ruta:', route.url);
    console.log('[AuthGuard] Usuario autenticado:', this.keycloakService.isLoggedIn());
    
    if (!this.keycloakService.isLoggedIn()) {
      console.log('[AuthGuard] Usuario NO autenticado, redirigiendo a login');
      // Redirigir a la página de login local
      this.router.navigate(['/auth/login']);
      return false;
    }

    console.log('[AuthGuard] Usuario autenticado, verificando roles...');
    
    // Verificar roles requeridos si están definidos en la ruta
    const requiredRoles = route.data['roles'] as string[];
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRequiredRole = this.keycloakService.hasAnyRole(requiredRoles);
      if (!hasRequiredRole) {
        console.warn('[AuthGuard] Acceso denegado. Roles requeridos:', requiredRoles);
        console.warn('[AuthGuard] Roles del usuario:', this.keycloakService.getUserRoles());
        
        // Redirigir a página de acceso denegado o home
        this.router.navigate(['/dashboard']); // o wherever you want to redirect
        return false;
      }
    }

    console.log('[AuthGuard] Acceso permitido');
    return true;
  }
}
