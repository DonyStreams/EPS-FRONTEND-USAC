import { Injectable } from '@angular/core';
import * as Keycloak from 'keycloak-js';

@Injectable({
  providedIn: 'root',
})
export class KeycloakService {
  private keycloakInstance: Keycloak.KeycloakInstance;

  init(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.keycloakInstance = Keycloak({
        url: 'http://localhost:8080',
        realm: 'demo',
        clientId: 'my-angular-client',
      });

      this.keycloakInstance.init({ onLoad: 'login-required' })
        .success(authenticated => {
          console.log('[Keycloak] authenticated', authenticated);
          if (authenticated) {
            console.log('[Keycloak] User roles:', this.getUserRoles());
            console.log('[Keycloak] User info:', this.getUserInfo());
          }
          resolve(authenticated);
        })
        .error(err => {
          console.error('[Keycloak] Init failed', err);
          reject(err);
        });
    });
  }

  getToken(): string | undefined {
    return this.keycloakInstance?.token;
  }

  getUsername(): string | undefined {
    return this.keycloakInstance?.tokenParsed?.['preferred_username'];
  }

  getUserId(): string | undefined {
    return this.keycloakInstance?.tokenParsed?.['sub'];
  }

  getUserEmail(): string | undefined {
    return this.keycloakInstance?.tokenParsed?.['email'];
  }

  getUserFullName(): string | undefined {
    return this.keycloakInstance?.tokenParsed?.['name'];
  }

  // Obtener roles del realm
  getRealmRoles(): string[] {
    return this.keycloakInstance?.tokenParsed?.['realm_access']?.['roles'] || [];
  }

  // Obtener roles del cliente
  getClientRoles(): string[] {
    return this.keycloakInstance?.tokenParsed?.['resource_access']?.['my-angular-client']?.['roles'] || [];
  }

  // Obtener todos los roles del usuario
  getUserRoles(): string[] {
    return [...this.getRealmRoles(), ...this.getClientRoles()];
  }

  // Verificar si tiene un rol específico
  hasRole(role: string): boolean {
    return this.getUserRoles().includes(role);
  }

  // Verificar si tiene algún rol de una lista
  hasAnyRole(roles: string[]): boolean {
    const userRoles = this.getUserRoles();
    return roles.some(role => userRoles.includes(role));
  }

  // Verificar permisos por módulo
  canAccessEquipos(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR', 'TECNICO_EQUIPOS', 'USER']);
  }

  canCreateEquipos(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR']);
  }

  canEditEquipos(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR']);
  }

  canDeleteEquipos(): boolean {
    return this.hasRole('ADMIN');
  }

  canAccessMantenimientos(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR', 'TECNICO']);
  }

  canCreateMantenimientos(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR']);
  }

  canExecuteMantenimientos(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR', 'TECNICO']);
  }

  canManageUsers(): boolean {
    return this.hasRole('ADMIN');
  }

  canViewReports(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR']);
  }

  canExportReports(): boolean {
    return this.hasRole('ADMIN');
  }

  // Información completa del usuario
  getUserInfo() {
    if (!this.isLoggedIn()) return null;
    
    return {
      id: this.getUserId(),
      username: this.getUsername(),
      email: this.getUserEmail(),
      fullName: this.getUserFullName(),
      roles: this.getUserRoles(),
      permissions: {
        equipos: {
          view: this.canAccessEquipos(),
          create: this.canCreateEquipos(),
          edit: this.canEditEquipos(),
          delete: this.canDeleteEquipos()
        },
        mantenimientos: {
          view: this.canAccessMantenimientos(),
          create: this.canCreateMantenimientos(),
          execute: this.canExecuteMantenimientos()
        },
        users: {
          manage: this.canManageUsers()
        },
        reports: {
          view: this.canViewReports(),
          export: this.canExportReports()
        }
      }
    };
  }

  logout(): void {
    this.keycloakInstance.logout();
  }

  isLoggedIn(): boolean {
    return this.keycloakInstance?.authenticated ?? false;
  }

  login(): void {
    this.keycloakInstance?.login();
  }
}
