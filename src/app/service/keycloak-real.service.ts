import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';

@Injectable({
  providedIn: 'root'
})
export class KeycloakRealService {
  private keycloakInstance!: Keycloak.KeycloakInstance;
  private initialized: boolean = false;

  constructor() {
    this.keycloakInstance = new (Keycloak as any)({
      url: 'http://localhost:8080',
      realm: 'MantenimientosINACIF',
      clientId: 'inacif-frontend'
    });
  }

  init(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      console.log('[Keycloak Real] Inicializando servicio real...');
      
      this.keycloakInstance.init({
        onLoad: 'check-sso',
        checkLoginIframe: false
      }).success((authenticated) => {
        this.initialized = true;
        console.log('[Keycloak Real] Servicio inicializado correctamente');
        console.log('[Keycloak Real] Usuario autenticado:', authenticated);
        resolve(authenticated);
      }).error((error) => {
        console.error('[Keycloak Real] Error al inicializar:', error);
        reject(error);
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
    const firstName = this.keycloakInstance?.tokenParsed?.['given_name'] || '';
    const lastName = this.keycloakInstance?.tokenParsed?.['family_name'] || '';
    return `${firstName} ${lastName}`.trim() || this.getUsername();
  }

  // Obtener roles del realm
  getRealmRoles(): string[] {
    return this.keycloakInstance?.tokenParsed?.['realm_access']?.['roles'] || [];
  }

  // Obtener roles del cliente
  getClientRoles(): string[] {
    const clientAccess = this.keycloakInstance?.tokenParsed?.['resource_access'];
    return clientAccess?.['inacif-frontend']?.['roles'] || [];
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

  // Verificar permisos específicos
  hasPermission(module: string, action: string): boolean {
    const userRoles = this.getUserRoles();
    
    // Lógica de permisos basada en roles
    switch (module) {
      case 'equipos':
        switch (action) {
          case 'read':
            return userRoles.some(role => ['ADMIN', 'SUPERVISOR', 'TECNICO_EQUIPOS', 'USER'].includes(role));
          case 'create':
          case 'update':
            return userRoles.some(role => ['ADMIN', 'SUPERVISOR'].includes(role));
          case 'delete':
            return userRoles.includes('ADMIN');
          default:
            return false;
        }
      case 'mantenimientos':
        switch (action) {
          case 'read':
            return userRoles.some(role => ['ADMIN', 'SUPERVISOR', 'TECNICO'].includes(role));
          case 'create':
            return userRoles.some(role => ['ADMIN', 'SUPERVISOR'].includes(role));
          case 'execute':
            return userRoles.some(role => ['ADMIN', 'SUPERVISOR', 'TECNICO'].includes(role));
          default:
            return false;
        }
      case 'administracion':
        switch (action) {
          case 'users':
          case 'reports':
          case 'export':
            return userRoles.includes('ADMIN');
          case 'view-reports':
            return userRoles.some(role => ['ADMIN', 'SUPERVISOR'].includes(role));
          default:
            return false;
        }
      default:
        return false;
    }
  }

  logout(): void {
    console.log('[Keycloak Real] Logout llamado');
    this.keycloakInstance?.logout({
      redirectUri: window.location.origin + '/auth/login'
    });
  }

  isLoggedIn(): boolean {
    const result = this.initialized && !!this.keycloakInstance?.authenticated;
    console.log('[Keycloak Real] isLoggedIn check:', {
      initialized: this.initialized,
      authenticated: this.keycloakInstance?.authenticated,
      result: result
    });
    return result;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  login(): void {
    console.log('[Keycloak Real] Login llamado - redirigiendo a Keycloak...');
    this.keycloakInstance?.login();
  }

  // Método para obtener el token actualizado
  updateToken(minValidity: number = 5): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.keycloakInstance) {
        resolve(false);
        return;
      }
      
      this.keycloakInstance.updateToken(minValidity).success((refreshed) => {
        resolve(refreshed);
      }).error(() => {
        resolve(false);
      });
    });
  }

  // Método para verificar si el token está próximo a expirar
  isTokenExpired(minValidity: number = 0): boolean {
    return this.keycloakInstance?.isTokenExpired(minValidity) || true;
  }
}
