import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KeycloakService {
  private keycloakInstance!: Keycloak.KeycloakInstance;
  private initialized: boolean = false;
  
  // Observable para notificar cuando la sesión expira
  private sessionExpired$ = new BehaviorSubject<boolean>(false);
  public onSessionExpired = this.sessionExpired$.asObservable();

  constructor() {
    this.keycloakInstance = new (Keycloak as any)({
      url: 'http://172.16.1.192:8080/auth',
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
    // Renovar token cada 5 minutos si expira en menos de 10 minutos
    setInterval(() => {
      if (this.isLoggedIn() && !this.isTokenExpired(600)) { // 10 minutos
        this.updateToken(300).then((refreshed) => {
          if (refreshed) {
            console.log('[Keycloak Real] Token renovado automáticamente');
          }
        }).catch((error) => {
          console.error('[Keycloak Real] Error al renovar token:', error);
        });
      }
    }, 300000); // Cada 5 minutos

    // Renovar token cuando la pestaña vuelve a estar activa
    // Solo mostrar mensaje de sesión expirada si realmente ya no está autenticado
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.keycloakInstance?.authenticated) {
        console.log('[Keycloak] Pestaña activa, verificando token...');
        this.updateToken(60).then((refreshed) => {
          if (refreshed) {
            console.log('[Keycloak] Token renovado al activar pestaña');
          } else {
            console.log('[Keycloak] Token aún válido');
          }
        }).catch((error) => {
          // Solo notificar si realmente la sesión expiró
          if (!this.isLoggedIn() || this.isTokenExpired()) {
            console.error('[Keycloak] Sesión expirada, redirigiendo a login:', error);
            this.sessionExpired$.next(true);
            setTimeout(() => {
              this.login();
            }, 2500);
          } else {
            // Si no está expirada, solo loguear el error
            console.error('[Keycloak] Error al renovar token (pero sesión sigue activa):', error);
          }
        });
      }
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

  // =====================================================
  // PERMISOS DE EQUIPOS
  // =====================================================
  canAccessEquipos(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR', 'TECNICO', 'TECNICO_EQUIPOS', 'USER']);
  }

  canCreateEquipos(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR', 'TECNICO_EQUIPOS']);
  }

  canEditEquipos(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR', 'TECNICO_EQUIPOS']);
  }

  canDeleteEquipos(): boolean {
    return this.hasRole('ADMIN');
  }

  canManageEquipos(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR', 'TECNICO_EQUIPOS']);
  }

  // =====================================================
  // PERMISOS DE CATEGORÍAS
  // =====================================================
  canAccessCategorias(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR', 'TECNICO', 'TECNICO_EQUIPOS', 'USER']);
  }

  canCreateCategorias(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR']);
  }

  canEditCategorias(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR']);
  }

  canDeleteCategorias(): boolean {
    return this.hasRole('ADMIN');
  }

  // =====================================================
  // PERMISOS DE MANTENIMIENTOS Y PROGRAMACIONES
  // =====================================================
  canAccessMantenimientos(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR', 'TECNICO', 'USER']);
  }

  canCreateMantenimientos(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR']);
  }

  canEditMantenimientos(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR']);
  }

  canDeleteMantenimientos(): boolean {
    return this.hasRole('ADMIN');
  }

  canExecuteMantenimientos(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR', 'TECNICO']);
  }

  canApproveMantenimientos(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR']);
  }

  // =====================================================
  // PERMISOS DE EJECUCIONES
  // =====================================================
  canAccessEjecuciones(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR', 'TECNICO', 'USER']);
  }

  canCreateEjecuciones(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR', 'TECNICO']);
  }

  canEditEjecuciones(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR', 'TECNICO']);
  }

  canApproveEjecuciones(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR']);
  }

  // =====================================================
  // PERMISOS DE TICKETS
  // =====================================================
  canAccessTickets(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR', 'TECNICO', 'TECNICO_EQUIPOS', 'USER']);
  }

  canCreateTickets(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR', 'TECNICO', 'TECNICO_EQUIPOS', 'USER']);
  }

  canEditTickets(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR', 'TECNICO', 'TECNICO_EQUIPOS']);
  }

  canDeleteTickets(): boolean {
    return this.hasRole('ADMIN');
  }

  canResolveTickets(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR', 'TECNICO']);
  }

  canCloseTickets(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR']);
  }

  canAssignTickets(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR']);
  }

  // =====================================================
  // PERMISOS DE CONTRATOS
  // =====================================================
  canAccessContratos(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR', 'TECNICO', 'USER']);
  }

  canCreateContratos(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR']);
  }

  canEditContratos(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR']);
  }

  canDeleteContratos(): boolean {
    return this.hasRole('ADMIN');
  }

  // =====================================================
  // PERMISOS DE PROVEEDORES
  // =====================================================
  canAccessProveedores(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR', 'TECNICO', 'USER']);
  }

  canCreateProveedores(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR']);
  }

  canEditProveedores(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR']);
  }

  canDeleteProveedores(): boolean {
    return this.hasRole('ADMIN');
  }

  // =====================================================
  // PERMISOS DE ÁREAS
  // =====================================================
  canAccessAreas(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR', 'TECNICO', 'TECNICO_EQUIPOS', 'USER']);
  }

  canCreateAreas(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR']);
  }

  canEditAreas(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR']);
  }

  canDeleteAreas(): boolean {
    return this.hasRole('ADMIN');
  }

  // =====================================================
  // PERMISOS DE USUARIOS
  // =====================================================
  canAccessUsuarios(): boolean {
    return this.hasRole('ADMIN');
  }

  canManageUsuarios(): boolean {
    return this.hasRole('ADMIN');
  }

  // =====================================================
  // PERMISOS DE REPORTES
  // =====================================================
  canAccessReportes(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR']);
  }

  canExportReportes(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR']);
  }

  // =====================================================
  // PERMISOS DE NOTIFICACIONES
  // =====================================================
  canAccessNotificaciones(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR', 'TECNICO', 'TECNICO_EQUIPOS', 'USER']);
  }

  canConfigureNotificaciones(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR']);
  }

  // =====================================================
  // PERMISOS DE PARTICIPANTES (Legacy)
  // =====================================================
  canAccessParticipantes(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR', 'TECNICO']);
  }

  canManageParticipantes(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR']);
  }

  // =====================================================
  // HELPERS GENERALES
  // =====================================================
  
  /**
   * Verifica si el usuario es administrador
   */
  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  /**
   * Verifica si el usuario es supervisor
   */
  isSupervisor(): boolean {
    return this.hasRole('SUPERVISOR');
  }

  /**
   * Verifica si el usuario es técnico de mantenimiento
   */
  isTecnico(): boolean {
    return this.hasRole('TECNICO');
  }

  /**
   * Verifica si el usuario es técnico de equipos
   */
  isTecnicoEquipos(): boolean {
    return this.hasRole('TECNICO_EQUIPOS');
  }

  /**
   * Verifica si el usuario es solo lectura
   */
  isReadOnly(): boolean {
    return this.hasRole('USER') && !this.hasAnyRole(['ADMIN', 'SUPERVISOR', 'TECNICO', 'TECNICO_EQUIPOS']);
  }

  /**
   * Obtiene el rol principal del usuario (el de mayor jerarquía)
   */
  getPrimaryRole(): string {
    if (this.hasRole('ADMIN')) return 'ADMIN';
    if (this.hasRole('SUPERVISOR')) return 'SUPERVISOR';
    if (this.hasRole('TECNICO')) return 'TECNICO';
    if (this.hasRole('TECNICO_EQUIPOS')) return 'TECNICO_EQUIPOS';
    if (this.hasRole('USER')) return 'USER';
    return 'UNKNOWN';
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
      primaryRole: this.getPrimaryRole(),
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
          edit: this.canEditMantenimientos(),
          execute: this.canExecuteMantenimientos(),
          approve: this.canApproveMantenimientos()
        },
        tickets: {
          view: this.canAccessTickets(),
          create: this.canCreateTickets(),
          edit: this.canEditTickets(),
          resolve: this.canResolveTickets(),
          close: this.canCloseTickets()
        },
        contratos: {
          view: this.canAccessContratos(),
          create: this.canCreateContratos(),
          edit: this.canEditContratos(),
          delete: this.canDeleteContratos()
        },
        usuarios: {
          manage: this.canAccessUsuarios()
        },
        reportes: {
          view: this.canAccessReportes(),
          export: this.canExportReportes()
        }
      }
    };
  }

  logout(): void {
    console.log('[Keycloak Real] Logout llamado');
    this.keycloakInstance?.logout({
      redirectUri: window.location.origin + '/auth/login'
    });
  }

  isLoggedIn(): boolean {
    const hasToken = !!this.keycloakInstance?.token;
    const result = this.initialized && !!this.keycloakInstance?.authenticated && hasToken;
    console.log('[Keycloak Real] isLoggedIn check:', {
      initialized: this.initialized,
      authenticated: this.keycloakInstance?.authenticated,
      hasToken: hasToken,
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
    if (!this.keycloakInstance || !this.isLoggedIn()) {
      return true; // Sin instancia o no logueado = token expirado
    }
    return this.keycloakInstance.isTokenExpired(minValidity);
  }
}
