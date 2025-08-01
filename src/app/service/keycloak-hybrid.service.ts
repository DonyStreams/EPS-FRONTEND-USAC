import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';

@Injectable({
  providedIn: 'root',
})
export class KeycloakService {
  private keycloakInstance!: Keycloak.KeycloakInstance;
  private initialized = false;
  
  // Fallback para modo mock si Keycloak falla
  private mockUser = {
    username: 'admin',
    email: 'admin@inacif.gob.gt',
    fullName: 'Administrador Sistema',
    roles: ['ADMIN'],
    authenticated: true
  };
  private isMockMode = false;

  constructor() {
    try {
      this.keycloakInstance = new (Keycloak as any)({
        url: 'http://localhost:8080',
        realm: 'MantenimientosINACIF',
        clientId: 'inacif-frontend'
      });
    } catch (error) {
      console.warn('[Keycloak] No se pudo conectar a Keycloak, usando modo mock');
      this.isMockMode = true;
    }
  }

  init(): Promise<boolean> {
    if (this.isMockMode) {
      return this.initMock();
    }
    
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
        console.error('[Keycloak Real] Error al inicializar, cambiando a modo mock:', error);
        this.isMockMode = true;
        this.initMock().then(resolve).catch(reject);
      });
    });
  }
  
  private initMock(): Promise<boolean> {
    return new Promise((resolve) => {
      console.log('[Keycloak Mock] Inicializando servicio mock');
      setTimeout(() => {
        this.initialized = true;
        console.log('[Keycloak Mock] Servicio inicializado correctamente');
        resolve(true);
      }, 1000);
    });
  }

  getToken(): string | undefined {
    if (this.isMockMode) {
      return 'mock-jwt-token';
    }
    return this.keycloakInstance?.token;
  }

  getUsername(): string | undefined {
    if (this.isMockMode) {
      return this.mockUser.username;
    }
    return this.keycloakInstance?.tokenParsed?.['preferred_username'];
  }

  getUserId(): string | undefined {
    if (this.isMockMode) {
      return 'mock-user-id';
    }
    return this.keycloakInstance?.tokenParsed?.['sub'];
  }

  getUserEmail(): string | undefined {
    if (this.isMockMode) {
      return this.mockUser.email;
    }
    return this.keycloakInstance?.tokenParsed?.['email'];
  }

  getUserFullName(): string | undefined {
    if (this.isMockMode) {
      return this.mockUser.fullName;
    }
    const firstName = this.keycloakInstance?.tokenParsed?.['given_name'] || '';
    const lastName = this.keycloakInstance?.tokenParsed?.['family_name'] || '';
    return `${firstName} ${lastName}`.trim() || this.getUsername();
  }

  // Obtener roles del realm
  getRealmRoles(): string[] {
    if (this.isMockMode) {
      return [];
    }
    return this.keycloakInstance?.tokenParsed?.['realm_access']?.['roles'] || [];
  }

  // Obtener roles del cliente
  getClientRoles(): string[] {
    if (this.isMockMode) {
      return this.mockUser.roles;
    }
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

  // Métodos de permisos específicos para compatibilidad
  canAccessEquipos(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR', 'TECNICO_EQUIPOS', 'USER']);
  }

  canManageEquipos(): boolean {
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

  canAccessParticipantes(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR', 'TECNICO']);
  }

  canManageParticipantes(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR']);
  }

  canAccessUsuarios(): boolean {
    return this.hasRole('ADMIN');
  }

  logout(): void {
    if (this.isMockMode) {
      console.log('[Keycloak Mock] Logout llamado');
      this.mockUser.authenticated = false;
      console.log('[Keycloak Mock] Usuario desautenticado');
    } else {
      console.log('[Keycloak Real] Logout llamado');
      this.keycloakInstance?.logout({
        redirectUri: window.location.origin + '/auth/login'
      });
    }
  }

  isLoggedIn(): boolean {
    let result: boolean;
    
    if (this.isMockMode) {
      result = this.initialized && this.mockUser.authenticated;
    } else {
      result = this.initialized && !!this.keycloakInstance?.authenticated;
    }
    
    console.log('[Keycloak Service] isLoggedIn check:', {
      initialized: this.initialized,
      authenticated: this.isMockMode ? this.mockUser.authenticated : this.keycloakInstance?.authenticated,
      isMockMode: this.isMockMode,
      result: result
    });
    
    return result;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  login(): void {
    if (this.isMockMode) {
      console.log('[Keycloak Mock] Login llamado - autenticando usuario...');
      this.mockUser.authenticated = true;
      console.log('[Keycloak Mock] Usuario autenticado exitosamente');
    } else {
      console.log('[Keycloak Real] Login llamado - redirigiendo a Keycloak...');
      this.keycloakInstance?.login();
    }
  }

  // Método para forzar modo mock (para testing)
  forceMockMode(): void {
    console.log('[Keycloak] Forzando modo mock');
    this.isMockMode = true;
    this.mockUser.authenticated = true;
  }

  // Método para verificar si está en modo mock
  isMock(): boolean {
    return this.isMockMode;
  }
}
