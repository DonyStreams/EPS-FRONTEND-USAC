import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';

@Injectable({
  providedIn: 'root'
})
export class KeycloakService {
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
    console.log('[Keycloak Real] Inicializando servicio real...');
    
    return (this.keycloakInstance.init({
      checkLoginIframe: false,
      onLoad: 'check-sso'  // Verificar si hay sesión válida
    }) as any).then((authenticated: boolean) => {
      this.initialized = true;
      console.log('[Keycloak Real] Servicio inicializado correctamente');
      console.log('[Keycloak Real] Usuario autenticado:', authenticated);
      
      // Configurar renovación automática de tokens
      if (authenticated) {
        this.setupTokenRefresh();
      }
      
      return authenticated;
    }).catch((error: any) => {
      console.error('[Keycloak Real] Error al inicializar:', error);
      // En caso de error, inicializar de todas formas pero sin autenticación
      this.initialized = true;
      return false;
    });
  }

  // Método para configurar renovación automática de tokens
  private setupTokenRefresh(): void {
    // Renovar token cada 60 segundos si expira en menos de 70 segundos
    setInterval(() => {
      this.updateToken(70).then((refreshed) => {
        if (refreshed) {
          console.log('[Keycloak Real] Token renovado automáticamente');
        }
      }).catch((error) => {
        console.error('[Keycloak Real] Error al renovar token:', error);
      });
    }, 60000); // Cada 60 segundos
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

  // Métodos de compatibilidad adicionales
  canManageEquipos(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR']);
  }

  canCreateEquipos(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR']);
  }

  canEditEquipos(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR']);
  }

  canAccessEquipos(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR', 'TECNICO_EQUIPOS', 'USER']);
  }

  canCreateMantenimientos(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR']);
  }

  canAccessMantenimientos(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR', 'TECNICO']);
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

  // Información completa del usuario para compatibilidad
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
        usuarios: {
          manage: this.canAccessUsuarios()
        }
      }
    };
  }

  // Método de compatibilidad para canDeleteEquipos
  canDeleteEquipos(): boolean {
    return this.hasRole('ADMIN');
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
    if (!this.keycloakInstance) {
      return Promise.resolve(false);
    }
    
    return (this.keycloakInstance.updateToken(minValidity) as any).then((refreshed: boolean) => {
      return refreshed;
    }).catch(() => {
      return false;
    });
  }

  // Método para verificar si el token está próximo a expirar
  isTokenExpired(minValidity: number = 0): boolean {
    return this.keycloakInstance?.isTokenExpired(minValidity) || true;
  }
}
