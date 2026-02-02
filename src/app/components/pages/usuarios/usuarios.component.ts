import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UsuarioMantenimientoService, UsuarioMantenimiento, EstadisticasUsuarios } from '../../../service/usuario-mantenimiento.service';
import { KeycloakService } from '../../../service/keycloak.service';

@Component({
    selector: 'app-usuarios',
    templateUrl: './usuarios.component.html',
    providers: [ConfirmationService, MessageService]
})
export class UsuariosComponent implements OnInit {
    usuarios: UsuarioMantenimiento[] = [];
    loading = false;
    searchValue = '';

    // Estadísticas para dashboard
    stats: EstadisticasUsuarios = { total: 0, activos: 0, inactivos: 0 };

    constructor(
        private usuarioService: UsuarioMantenimientoService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private keycloakService: KeycloakService
    ) {
        // Constructor simplificado - sin formularios
    }

    ngOnInit(): void {
        this.loadUsuarios();
        this.loadStats();
        this.checkCurrentUser(); // Verificar auto-sincronización al cargar
    }

    loadUsuarios(): void {
        this.loading = true;
        this.usuarioService.getAll().subscribe({
            next: (data) => {
                this.usuarios = data;
                this.loading = false;
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar usuarios: ' + (error.message || 'Error desconocido')
                });
                this.loading = false;
                this.usuarios = []; // Asegurar que esté vacío en caso de error
            }
        });
    }

    loadStats(): void {
        this.usuarioService.getStats().subscribe({
            next: (data) => {
                this.stats = data;
            },
            error: () => {}
        });
    }

    showCreateDialog(): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Información',
            detail: 'Los usuarios se gestionan desde Keycloak. Use la función de sincronización.'
        });
    }

    toggleEstado(usuario: UsuarioMantenimiento): void {
        this.confirmationService.confirm({
            message: `¿Está seguro de ${usuario.activo ? 'desactivar' : 'activar'} este usuario?`,
            header: 'Confirmar cambio de estado',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.usuarioService.toggleEstado(usuario.id!).subscribe({
                    next: (response) => {
                        const accion = usuario.activo ? 'desactivado' : 'activado';
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: `Usuario ${accion} correctamente`
                        });
                        this.loadUsuarios();
                        this.loadStats();
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al cambiar estado del usuario: ' + (error.error?.error || error.message)
                        });
                    }
                });
            }
        });
    }

    /**
     * 🛡️ NOTA DE SEGURIDAD: 
     * No se permite eliminación física de usuarios para preservar:
     * - Integridad referencial con mantenimientos y tickets
     * - Trazabilidad y auditoría del sistema
     * - Historial de actividades
     * 
     * Los usuarios solo pueden ser activados/desactivados.
     * Para eliminación completa, gestionar desde Keycloak directamente.
     */

    formatDate(dateString: any): string {
        if (!dateString) return '-';
        
        try {
            let date: Date;
            
            if (typeof dateString === 'number') {
                // Timestamp de Keycloak
                date = new Date(dateString);
            } else if (typeof dateString === 'string') {
                const cleanDateString = dateString.replace(/\[UTC\]$/, '');
                date = new Date(cleanDateString);
            } else if (dateString instanceof Date) {
                date = dateString;
            } else {
                return '-';
            }
            
            if (isNaN(date.getTime())) {
                return '-';
            }
            
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            
            return `${day}/${month}/${year} ${hours}:${minutes}`;
        } catch (error) {
            return '-';
        }
    }
    refreshData(): void {
        this.loadUsuarios();
        this.loadStats();
        this.messageService.add({
            severity: 'info',
            summary: 'Actualizado',
            detail: 'Datos actualizados desde el servidor'
        });
    }

    /**
     * Abre la consola de administración de Keycloak en una nueva pestaña
     */
    openKeycloakConsole(): void {
        const keycloakUrl = 'http://172.16.1.192:8080/auth/admin/master/console/#/realms/MantenimientosINACIF/users';
        window.open(keycloakUrl, '_blank');
        
        this.messageService.add({
            severity: 'info',
            summary: 'Keycloak',
            detail: 'Abriendo consola de administración en nueva pestaña'
        });
    }

    // ===== MÉTODOS DE AUTO-SINCRONIZACIÓN =====

    /**
     * Verifica si el usuario actual está sincronizado
     */
    checkCurrentUser(): void {
        // Primero verificar si el usuario está autenticado
        if (!this.keycloakService.isLoggedIn()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'No autenticado',
                detail: 'Debe iniciar sesión para acceder a las funciones del sistema'
            });
            return;
        }

        // Verificar si el token es válido
        if (this.keycloakService.isTokenExpired()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Sesión expirada',
                detail: 'Su sesión ha expirado. Por favor, recargue la página.'
            });
            return;
        }

        this.usuarioService.getCurrentUser().subscribe({
            next: (user) => {
                if (!user.id) {
                    // Usuario no sincronizado - mostrar opción de auto-sync
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Usuario no sincronizado',
                        detail: 'Haga clic en "Auto-sincronizar" para activar todas las funciones'
                    });
                }
            },
            error: (error) => {
                if (error.status === 401) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error de autenticación',
                        detail: 'Token JWT inválido o expirado. Recargue la página.'
                    });
                }
            }
        });
    }

    /**
     * Auto-sincroniza al usuario actual desde Keycloak
     */
    autoSyncCurrentUser(): void {
        // Verificar autenticación antes de intentar sincronizar
        if (!this.keycloakService.isLoggedIn()) {
            this.messageService.add({
                severity: 'error',
                summary: 'No autenticado',
                detail: 'Debe iniciar sesión primero'
            });
            return;
        }

        if (this.keycloakService.isTokenExpired()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Sesión expirada',
                detail: 'Su sesión ha expirado. Recargue la página.'
            });
            return;
        }

        this.loading = true;
        this.usuarioService.autoSyncCurrentUser().subscribe({
            next: (usuario) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Auto-sincronización exitosa',
                    detail: `Usuario ${usuario.nombreCompleto} sincronizado automáticamente`
                });
                this.loadUsuarios();
                this.loadStats();
                this.loading = false;
            },
            error: (error) => {
                let errorMessage = 'Error al auto-sincronizar usuario';
                
                if (error.status === 401) {
                    errorMessage = 'Token JWT inválido. Recargue la página.';
                } else if (error.status === 403) {
                    errorMessage = 'No tiene permisos para esta operación';
                }
                
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: errorMessage
                });
                this.loading = false;
            }
        });
    }

    /**
     * Obtiene información del usuario actual
     */
    getCurrentUserInfo(): void {
        if (!this.keycloakService.isLoggedIn()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'No autenticado',
                detail: 'Debe iniciar sesión para ver información del usuario'
            });
            return;
        }

        this.usuarioService.getCurrentUser().subscribe({
            next: (user) => {
                // Crear información detallada
                const userInfo = {
                    nombre: user.nombreCompleto || this.keycloakService.getUsername(),
                    email: user.correo || this.keycloakService.getUserEmail(),
                    estado: user.activo ? '✅ Activo' : '❌ Inactivo',
                    sincronizado: user.id ? '✅ Sí' : '⚠️ No',
                    keycloakId: user.keycloakId
                };
                
                // Mostrar en un toast más informativo
                this.messageService.add({
                    severity: user.activo ? 'success' : 'warn',
                    summary: '👤 Mi Información',
                    detail: `${userInfo.nombre} | ${userInfo.estado} | Sync: ${userInfo.sincronizado}`,
                    life: 5000
                });
            },
            error: (error) => {
                
                if (error.status === 403 && error.error?.codigo === 'USUARIO_DESACTIVADO') {
                    this.messageService.add({
                        severity: 'error',
                        summary: '🚫 Usuario Desactivado',
                        detail: `Su cuenta (${error.error.usuario}) ha sido desactivada por el administrador.`
                    });
                } else if (error.status === 401) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error de autenticación',
                        detail: 'Token JWT inválido. Recargue la página.'
                    });
                } else {
                    // Mostrar al menos la información de Keycloak
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Usuario de Keycloak',
                        detail: `${this.keycloakService.getUsername()} - No sincronizado en BD local`
                    });
                }
            }
        });
    }
}
