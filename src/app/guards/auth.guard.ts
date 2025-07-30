import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { KeycloakService } from '../service/keycloak.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private keycloakService: KeycloakService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.keycloakService.isLoggedIn()) {
      this.keycloakService.login();
      return false;
    }

    // Verificar roles requeridos si están definidos en la ruta
    const requiredRoles = route.data['roles'] as string[];
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRequiredRole = this.keycloakService.hasAnyRole(requiredRoles);
      if (!hasRequiredRole) {
        console.warn('Acceso denegado. Roles requeridos:', requiredRoles);
        console.warn('Roles del usuario:', this.keycloakService.getUserRoles());
        
        // Redirigir a página de acceso denegado o home
        this.router.navigate(['/dashboard']); // o wherever you want to redirect
        return false;
      }
    }

    return true;
  }
}
