import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import { interval, Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { 
    Notificacion, 
    Contadores, 
    EstadoScheduler, 
    ConfiguracionAlerta 
} from './notificaciones.model';
import { KeycloakService } from '../../../service/keycloak.service';

@Component({
    selector: 'app-notificaciones',
    templateUrl: './notificaciones.component.html',
    providers: [MessageService, ConfirmationService]
})
export class NotificacionesComponent implements OnInit, OnDestroy {
    private apiUrl = environment.apiUrl;
    
    notificaciones: Notificacion[] = [];
    notificacionesFiltradas: Notificacion[] = [];
    notificacionSeleccionada: Notificacion | null = null;
    
    contadores: Contadores = { total: 0, criticas: 0, alertas: 0, informativas: 0 };
    estadoScheduler: EstadoScheduler | null = null;
    configuraciones: ConfiguracionAlerta[] = [];
    
    cargando = false;
    ejecutandoVerificacion = false;
    mostrarDetalle = false;
    mostrarConfiguracion = false;
    
    filtroGlobal = '';
    filtroActivo = '';
    
    schedulerHabilitado = true;
    horaEjecucion = 8;
    minutoEjecucion = 0;
    
    private refreshSubscription: Subscription | null = null;

    constructor(
        private http: HttpClient,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        public keycloakService: KeycloakService
    ) {}

    ngOnInit(): void {
        this.cargarDatos();
        // Refrescar cada 60 segundos
        this.refreshSubscription = interval(60000).subscribe(() => {
            this.cargarContadores();
        });
    }

    ngOnDestroy(): void {
        if (this.refreshSubscription) {
            this.refreshSubscription.unsubscribe();
        }
    }

    cargarDatos(): void {
        this.cargarNotificaciones();
        this.cargarContadores();
        this.cargarEstadoScheduler();
        this.cargarConfiguraciones();
    }

    cargarNotificaciones(): void {
        this.cargando = true;
        console.log('🔄 Cargando notificaciones desde:', `${this.apiUrl}/notificaciones`);
        this.http.get<Notificacion[]>(`${this.apiUrl}/notificaciones`).subscribe({
            next: (data) => {
                console.log('📋 Notificaciones recibidas:', data);
                console.log('📊 Total notificaciones:', data?.length || 0);
                if (data && data.length > 0) {
                    console.log('📌 Primera notificación:', data[0]);
                }
                this.notificaciones = data || [];
                this.filtrarNotificaciones();
                this.cargando = false;
            },
            error: (err) => {
                console.error('❌ Error al cargar notificaciones', err);
                this.cargando = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudieron cargar las notificaciones'
                });
            }
        });
    }

    cargarContadores(): void {
        this.http.get<Contadores>(`${this.apiUrl}/notificaciones/contadores`).subscribe({
            next: (data) => {
                console.log('📊 Contadores recibidos:', data);
                this.contadores = data;
            },
            error: (err) => console.error('❌ Error al cargar contadores', err)
        });
    }

    cargarEstadoScheduler(): void {
        this.http.get<EstadoScheduler>(`${this.apiUrl}/notificaciones/scheduler/estado`).subscribe({
            next: (data) => {
                this.estadoScheduler = data;
                this.schedulerHabilitado = data.habilitado;
                this.horaEjecucion = data.horaEjecucion;
                this.minutoEjecucion = data.minutoEjecucion;
            },
            error: (err) => console.error('Error al cargar estado del scheduler', err)
        });
    }

    cargarConfiguraciones(): void {
        this.http.get<ConfiguracionAlerta[]>(`${this.apiUrl}/notificaciones/configuracion`).subscribe({
            next: (data) => this.configuraciones = data,
            error: (err) => console.error('Error al cargar configuraciones', err)
        });
    }

    filtrarNotificaciones(): void {
        let filtradas = [...this.notificaciones];
        
        // Filtro por prioridad
        if (this.filtroActivo && this.filtroActivo !== 'todas') {
            filtradas = filtradas.filter(n => n.prioridad === this.filtroActivo);
        }
        
        // Filtro global
        if (this.filtroGlobal) {
            const termino = this.filtroGlobal.toLowerCase();
            filtradas = filtradas.filter(n => 
                n.titulo.toLowerCase().includes(termino) ||
                n.mensaje.toLowerCase().includes(termino) ||
                n.tipoNotificacion.toLowerCase().includes(termino)
            );
        }
        
        this.notificacionesFiltradas = filtradas;
    }

    filtrarPor(prioridad: string): void {
        this.filtroActivo = prioridad === 'todas' ? '' : prioridad;
        this.filtrarNotificaciones();
    }

    marcarLeida(notif: Notificacion): void {
        this.http.put<Notificacion>(`${this.apiUrl}/notificaciones/${notif.idNotificacion}/leer`, {}).subscribe({
            next: () => {
                notif.leida = true;
                this.cargarContadores();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Notificación marcada como leída'
                });
            },
            error: (err) => {
                console.error('Error al marcar como leída', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo marcar la notificación'
                });
            }
        });
    }

    marcarTodasLeidas(): void {
        this.confirmationService.confirm({
            message: '¿Está seguro de marcar todas las notificaciones como leídas?',
            header: 'Confirmar',
            icon: 'pi pi-question-circle',
            accept: () => {
                this.http.put(`${this.apiUrl}/notificaciones/leer-todas`, {}).subscribe({
                    next: () => {
                        this.cargarDatos();
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Todas las notificaciones marcadas como leídas'
                        });
                    },
                    error: (err) => {
                        console.error('Error al marcar todas como leídas', err);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'No se pudieron marcar las notificaciones'
                        });
                    }
                });
            }
        });
    }

    eliminarTodas(): void {
        this.confirmationService.confirm({
            message: '¿Está seguro de ELIMINAR todas las notificaciones? Esta acción no se puede deshacer.',
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.http.delete(`${this.apiUrl}/notificaciones/todas`).subscribe({
                    next: (res: any) => {
                        this.cargarDatos();
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: `Se eliminaron ${res.cantidad || 'todas las'} notificaciones`
                        });
                    },
                    error: (err) => {
                        console.error('Error al eliminar todas las notificaciones', err);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'No se pudieron eliminar las notificaciones'
                        });
                    }
                });
            }
        });
    }

    eliminar(notif: Notificacion): void {
        this.confirmationService.confirm({
            message: '¿Está seguro de eliminar esta notificación?',
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.http.delete(`${this.apiUrl}/notificaciones/${notif.idNotificacion}`).subscribe({
                    next: () => {
                        this.notificaciones = this.notificaciones.filter(n => n.idNotificacion !== notif.idNotificacion);
                        this.filtrarNotificaciones();
                        this.cargarContadores();
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Notificación eliminada'
                        });
                    },
                    error: (err) => {
                        console.error('Error al eliminar', err);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'No se pudo eliminar la notificación'
                        });
                    }
                });
            }
        });
    }

    getMenuItems(notif: Notificacion): MenuItem[] {
        const items: MenuItem[] = [
            {
                label: 'Ver detalle',
                icon: 'pi pi-eye',
                command: () => this.verDetalle(notif)
            }
        ];
        
        if (!notif.leida) {
            items.push({
                label: 'Marcar como leída',
                icon: 'pi pi-check',
                command: () => this.marcarLeida(notif)
            });
        }
        
        if (this.puedeEliminarNotificaciones()) {
            items.push({
                separator: true
            });
            
            items.push({
                label: 'Eliminar',
                icon: 'pi pi-trash',
                styleClass: 'text-red-500',
                command: () => this.eliminar(notif)
            });
        }
        
        return items;
    }

    puedeConfigurarNotificaciones(): boolean {
        return this.keycloakService.hasAnyRole(['ADMIN', 'SUPERVISOR']);
    }

    puedeEjecutarVerificacion(): boolean {
        return this.keycloakService.hasAnyRole(['ADMIN', 'SUPERVISOR']);
    }

    puedeEliminarNotificaciones(): boolean {
        return this.keycloakService.hasRole('ADMIN');
    }

    verDetalle(notif: Notificacion): void {
        console.log('📋 Detalle notificación:', notif);
        console.log('📅 Fecha creación raw:', notif.fechaCreacion, 'tipo:', typeof notif.fechaCreacion);
        this.notificacionSeleccionada = notif;
        this.mostrarDetalle = true;
    }

    formatearFecha(fecha: any): string {
        if (!fecha) return 'No disponible';
        
        console.log('Fecha raw:', fecha, 'tipo:', typeof fecha);
        
        let date: Date;
        
        // Si es un número (timestamp en milisegundos)
        if (typeof fecha === 'number') {
            date = new Date(fecha);
        } 
        // Si es un string
        else if (typeof fecha === 'string') {
            // Remover sufijo de zona horaria como [UTC] que viene de Java
            let fechaLimpia = fecha.replace(/\[.*\]$/, '');
            
            // Intentar parsear diferentes formatos
            date = new Date(fechaLimpia);
            
            // Si falla, intentar parsear como timestamp string
            if (isNaN(date.getTime()) && /^\d+$/.test(fecha)) {
                date = new Date(parseInt(fecha, 10));
            }
        }
        // Si es un objeto con propiedades de fecha (como viene de Jackson)
        else if (typeof fecha === 'object' && fecha !== null) {
            // Puede venir como {year, month, day, hour, minute, second}
            if (fecha.year !== undefined) {
                date = new Date(fecha.year, fecha.month - 1, fecha.day, 
                               fecha.hour || 0, fecha.minute || 0, fecha.second || 0);
            } else {
                date = new Date(fecha);
            }
        } else {
            return 'Formato desconocido';
        }
        
        if (isNaN(date.getTime())) {
            console.error('Fecha inválida:', fecha);
            return 'Sin fecha';
        }
        
        return date.toLocaleString('es-GT', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    ejecutarVerificacion(): void {
        if (!this.puedeEjecutarVerificacion()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Sin permiso',
                detail: 'No tiene permisos para ejecutar verificaciones.'
            });
            return;
        }

        this.ejecutandoVerificacion = true;
        console.log('🔄 Ejecutando verificación manual...');
        this.http.post<any>(`${this.apiUrl}/notificaciones/scheduler/ejecutar`, {}).subscribe({
            next: (resultado) => {
                console.log('✅ Resultado verificación:', resultado);
                this.ejecutandoVerificacion = false;
                this.cargarDatos();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Verificación completada',
                    detail: `Se crearon ${resultado.totalAlertas} alertas (${resultado.alertasMantenimiento} mant., ${resultado.alertasContrato} contratos)`
                });
            },
            error: (err) => {
                this.ejecutandoVerificacion = false;
                console.error('❌ Error al ejecutar verificación', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo ejecutar la verificación'
                });
            }
        });
    }

    toggleScheduler(): void {
        if (!this.puedeConfigurarNotificaciones()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Sin permiso',
                detail: 'No tiene permisos para configurar el scheduler.'
            });
            return;
        }

        this.http.put(`${this.apiUrl}/notificaciones/scheduler/habilitar/${this.schedulerHabilitado}`, {}).subscribe({
            next: () => {
                this.cargarEstadoScheduler();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: `Scheduler ${this.schedulerHabilitado ? 'habilitado' : 'deshabilitado'}`
                });
            },
            error: (err) => {
                console.error('Error al cambiar estado del scheduler', err);
                this.schedulerHabilitado = !this.schedulerHabilitado;
            }
        });
    }

    guardarHorario(): void {
        if (!this.puedeConfigurarNotificaciones()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Sin permiso',
                detail: 'No tiene permisos para configurar el horario.'
            });
            return;
        }

        this.http.put(`${this.apiUrl}/notificaciones/scheduler/horario`, {
            hora: this.horaEjecucion,
            minuto: this.minutoEjecucion
        }).subscribe({
            next: () => {
                this.cargarEstadoScheduler();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: `Horario actualizado a ${this.horaEjecucion}:${this.minutoEjecucion.toString().padStart(2, '0')}`
                });
            },
            error: (err) => {
                console.error('Error al guardar horario', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo guardar el horario'
                });
            }
        });
    }

    actualizarConfiguracion(config: ConfiguracionAlerta): void {
        if (!this.puedeConfigurarNotificaciones()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Sin permiso',
                detail: 'No tiene permisos para modificar configuraciones.'
            });
            return;
        }

        this.http.put(`${this.apiUrl}/notificaciones/configuracion/${config.idConfiguracion}`, config).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Configuración actualizada'
                });
            },
            error: (err) => {
                console.error('Error al actualizar configuración', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo actualizar la configuración'
                });
            }
        });
    }

    // Helpers para tags
    getTipoLabel(tipo: string): string {
        const labels: { [key: string]: string } = {
            'mantenimiento_proximo': 'Mantenimiento',
            'contrato_proximo_30': 'Contrato (30d)',
            'contrato_proximo_15': 'Contrato (15d)',
            'contrato_proximo_7': 'Contrato Urgente',
            'ticket_critico': 'Ticket Crítico',
            'equipo_critico': 'Equipo Crítico'
        };
        return labels[tipo] || tipo;
    }

    getTipoSeverity(tipo: string): string {
        if (tipo.includes('critico') || tipo.includes('_7')) return 'danger';
        if (tipo.includes('mantenimiento') || tipo.includes('_15')) return 'warning';
        return 'info';
    }

    getTipoIcon(tipo: string): string {
        if (tipo.includes('mantenimiento')) return 'pi pi-wrench';
        if (tipo.includes('contrato')) return 'pi pi-file';
        if (tipo.includes('ticket')) return 'pi pi-ticket';
        if (tipo.includes('equipo')) return 'pi pi-desktop';
        return 'pi pi-bell';
    }

    getPrioridadSeverity(prioridad: string): string {
        switch (prioridad) {
            case 'Alta': return 'danger';
            case 'Media': return 'warning';
            case 'Baja': return 'success';
            default: return 'info';
        }
    }
}
