import { NgModule, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import { environment } from '../../../../environments/environment';
import { interval, Subscription } from 'rxjs';

interface Notificacion {
    idNotificacion: number;
    tipoNotificacion: string;
    titulo: string;
    mensaje: string;
    entidadRelacionada: string;
    entidadId: number;
    prioridad: string;
    leida: boolean;
    fechaCreacion: string;
    fechaLectura: string | null;
}

interface Contadores {
    total: number;
    criticas: number;
    alertas: number;
    informativas: number;
}

interface EstadoScheduler {
    habilitado: boolean;
    horaEjecucion: number;
    minutoEjecucion: number;
    horaProgramada: string;
    ultimaEjecucion: string;
    ultimoResultado: string;
    horaActual: string;
}

interface ConfiguracionAlerta {
    idConfiguracion: number;
    nombre: string;
    descripcion: string;
    tipoAlerta: string;
    diasAnticipacion: number;
    activa: boolean;
}

@Component({
    selector: 'app-notificaciones',
    template: `
        <div class="card">
            <h5><i class="pi pi-bell mr-2"></i>Panel de Notificaciones</h5>
            <p>Centro de notificaciones y alertas del sistema de mantenimientos.</p>
            
            <!-- Contadores -->
            <div class="grid">
                <div class="col-12 md:col-3">
                    <div class="card bg-blue-50 cursor-pointer hover:shadow-4" (click)="filtrarPor('todas')">
                        <div class="flex justify-content-between align-items-center">
                            <div>
                                <span class="block text-blue-900 font-medium mb-2">Total No Leídas</span>
                                <div class="text-blue-900 font-bold text-3xl">{{ contadores.total }}</div>
                            </div>
                            <i class="pi pi-bell text-blue-500 text-4xl"></i>
                        </div>
                    </div>
                </div>
                
                <div class="col-12 md:col-3">
                    <div class="card bg-red-50 cursor-pointer hover:shadow-4" (click)="filtrarPor('Alta')">
                        <div class="flex justify-content-between align-items-center">
                            <div>
                                <span class="block text-red-900 font-medium mb-2">Críticas</span>
                                <div class="text-red-900 font-bold text-3xl">{{ contadores.criticas }}</div>
                            </div>
                            <i class="pi pi-times-circle text-red-500 text-4xl"></i>
                        </div>
                    </div>
                </div>

                <div class="col-12 md:col-3">
                    <div class="card bg-orange-50 cursor-pointer hover:shadow-4" (click)="filtrarPor('Media')">
                        <div class="flex justify-content-between align-items-center">
                            <div>
                                <span class="block text-orange-900 font-medium mb-2">Alertas</span>
                                <div class="text-orange-900 font-bold text-3xl">{{ contadores.alertas }}</div>
                            </div>
                            <i class="pi pi-exclamation-triangle text-orange-500 text-4xl"></i>
                        </div>
                    </div>
                </div>
                
                <div class="col-12 md:col-3">
                    <div class="card bg-green-50 cursor-pointer hover:shadow-4" (click)="filtrarPor('Baja')">
                        <div class="flex justify-content-between align-items-center">
                            <div>
                                <span class="block text-green-900 font-medium mb-2">Informativas</span>
                                <div class="text-green-900 font-bold text-3xl">{{ contadores.informativas }}</div>
                            </div>
                            <i class="pi pi-info-circle text-green-500 text-4xl"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Toolbar -->
            <p-toolbar styleClass="mb-4 mt-4">
                <ng-template pTemplate="left">
                    <button pButton label="Marcar todas como leídas" icon="pi pi-check" 
                            class="p-button-success mr-2" (click)="marcarTodasLeidas()"
                            [disabled]="contadores.total === 0"></button>
                    <button pButton label="Eliminar todas" icon="pi pi-trash" 
                            class="p-button-danger mr-2" (click)="eliminarTodas()"
                            [disabled]="notificaciones.length === 0"
                            pTooltip="Elimina todas las notificaciones"></button>
                    <button pButton label="Ejecutar Verificación" icon="pi pi-sync" 
                            class="p-button-info mr-2" (click)="ejecutarVerificacion()"
                            [loading]="ejecutandoVerificacion"
                            pTooltip="Busca mantenimientos y contratos próximos a vencer"></button>
                    <button pButton label="Configuración" icon="pi pi-cog" 
                            class="p-button-secondary" (click)="mostrarConfiguracion = true"></button>
                </ng-template>
                <ng-template pTemplate="right">
                    <span class="p-input-icon-left">
                        <i class="pi pi-search"></i>
                        <input pInputText type="text" [(ngModel)]="filtroGlobal" 
                               placeholder="Buscar..." class="p-inputtext-sm"
                               (input)="filtrarNotificaciones()">
                    </span>
                </ng-template>
            </p-toolbar>

            <!-- Estado del Scheduler -->
            <div class="card surface-100 mb-4" *ngIf="estadoScheduler">
                <div class="flex align-items-center justify-content-between flex-wrap gap-3">
                    <div class="flex align-items-center gap-2">
                        <i class="pi pi-clock text-2xl" [ngClass]="estadoScheduler.habilitado ? 'text-green-500' : 'text-gray-400'"></i>
                        <div>
                            <span class="font-bold">Scheduler Automático:</span>
                            <p-tag [value]="estadoScheduler.habilitado ? 'Activo' : 'Inactivo'" 
                                   [severity]="estadoScheduler.habilitado ? 'success' : 'danger'" 
                                   class="ml-2"></p-tag>
                        </div>
                    </div>
                    <div class="flex align-items-center gap-4 text-sm">
                        <span><i class="pi pi-calendar mr-1"></i> Hora programada: <strong>{{ estadoScheduler.horaProgramada }}</strong></span>
                        <span><i class="pi pi-history mr-1"></i> Última ejecución: <strong>{{ estadoScheduler.ultimaEjecucion }}</strong></span>
                        <span *ngIf="estadoScheduler.ultimoResultado"><i class="pi pi-info-circle mr-1"></i> {{ estadoScheduler.ultimoResultado }}</span>
                    </div>
                </div>
            </div>

            <!-- Lista de Notificaciones como Cards -->
            <div class="grid" *ngIf="!cargando && notificacionesFiltradas.length > 0">
                <div class="col-12" *ngFor="let notif of notificacionesFiltradas">
                    <div class="card mb-2 p-3 border-left-3" 
                         [ngClass]="{
                             'border-red-500 surface-0': notif.prioridad === 'Alta' && !notif.leida,
                             'border-yellow-500 surface-0': notif.prioridad === 'Media' && !notif.leida,
                             'border-blue-500 surface-0': notif.prioridad === 'Baja' && !notif.leida,
                             'border-gray-300 surface-100': notif.leida
                         }">
                        <div class="flex align-items-start justify-content-between">
                            <!-- Contenido principal -->
                            <div class="flex align-items-start gap-3 flex-1">
                                <div class="flex-shrink-0">
                                    <i class="pi text-2xl" [ngClass]="{
                                        'pi-envelope text-primary': !notif.leida,
                                        'pi-envelope-open text-gray-400': notif.leida
                                    }"></i>
                                </div>
                                <div class="flex-1">
                                    <div class="flex align-items-center gap-2 mb-2">
                                        <p-tag [value]="getTipoLabel(notif.tipoNotificacion)" 
                                               [severity]="getTipoSeverity(notif.tipoNotificacion)"
                                               [icon]="getTipoIcon(notif.tipoNotificacion)" 
                                               styleClass="text-xs"></p-tag>
                                        <p-tag [value]="notif.prioridad" 
                                               [severity]="getPrioridadSeverity(notif.prioridad)"
                                               styleClass="text-xs"></p-tag>
                                        <span class="text-xs text-gray-500">
                                            <i class="pi pi-clock mr-1"></i>
                                            {{ formatearFecha(notif.fechaCreacion) }}
                                        </span>
                                    </div>
                                    <h5 class="m-0 mb-2" [ngClass]="{'font-bold': !notif.leida, 'text-gray-600': notif.leida}">
                                        {{ notif.titulo }}
                                    </h5>
                                    <p class="m-0 text-sm" [ngClass]="{'text-gray-700': !notif.leida, 'text-gray-500': notif.leida}">
                                        {{ notif.mensaje }}
                                    </p>
                                </div>
                            </div>
                            
                            <!-- Menú contextual de 3 puntitos -->
                            <div class="flex-shrink-0">
                                <button pButton type="button" icon="pi pi-ellipsis-v" 
                                        class="p-button-rounded p-button-text p-button-plain"
                                        (click)="menu.toggle($event)"></button>
                                <p-menu #menu [popup]="true" [model]="getMenuItems(notif)" appendTo="body"></p-menu>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Estado vacío -->
            <div *ngIf="!cargando && notificacionesFiltradas.length === 0" class="card">
                <div class="text-center p-6">
                    <i class="pi pi-inbox text-6xl text-gray-300 mb-4"></i>
                    <h4 class="text-gray-500 m-0">No hay notificaciones{{ filtroActivo ? ' con el filtro actual' : '' }}</h4>
                    <p class="text-gray-400 mt-2">Las alertas de mantenimientos y contratos aparecerán aquí</p>
                </div>
            </div>

            <!-- Loading -->
            <div *ngIf="cargando" class="card">
                <div class="text-center p-6">
                    <p-progressSpinner [style]="{width: '50px', height: '50px'}"></p-progressSpinner>
                    <p class="text-gray-500 mt-3">Cargando notificaciones...</p>
                </div>
            </div>
        </div>

        <!-- Diálogo de Detalle -->
        <p-dialog header="Detalle de Notificación" [(visible)]="mostrarDetalle" [modal]="true" 
                  [style]="{width: '500px'}" [closable]="true">
            <div *ngIf="notificacionSeleccionada" class="p-fluid">
                <div class="field">
                    <label class="font-bold">Tipo:</label>
                    <p-tag [value]="getTipoLabel(notificacionSeleccionada.tipoNotificacion)" 
                           [severity]="getTipoSeverity(notificacionSeleccionada.tipoNotificacion)"></p-tag>
                </div>
                <div class="field">
                    <label class="font-bold">Título:</label>
                    <p>{{ notificacionSeleccionada.titulo }}</p>
                </div>
                <div class="field">
                    <label class="font-bold">Mensaje:</label>
                    <p class="white-space-pre-line">{{ notificacionSeleccionada.mensaje }}</p>
                </div>
                <div class="field">
                    <label class="font-bold">Prioridad:</label>
                    <p-tag [value]="notificacionSeleccionada.prioridad" 
                           [severity]="getPrioridadSeverity(notificacionSeleccionada.prioridad)"></p-tag>
                </div>
                <div class="field">
                    <label class="font-bold">Fecha de creación:</label>
                    <p>{{ formatearFecha(notificacionSeleccionada.fechaCreacion) }}</p>
                </div>
                <div class="field" *ngIf="notificacionSeleccionada.fechaLectura">
                    <label class="font-bold">Fecha de lectura:</label>
                    <p>{{ formatearFecha(notificacionSeleccionada.fechaLectura) }}</p>
                </div>
            </div>
            <ng-template pTemplate="footer">
                <button pButton label="Cerrar" icon="pi pi-times" class="p-button-text" 
                        (click)="mostrarDetalle = false"></button>
                <button pButton label="Marcar como leída" icon="pi pi-check" 
                        (click)="marcarLeida(notificacionSeleccionada!); mostrarDetalle = false"
                        *ngIf="notificacionSeleccionada && !notificacionSeleccionada.leida"></button>
            </ng-template>
        </p-dialog>

        <!-- Diálogo de Configuración -->
        <p-dialog header="Configuración del Scheduler" [(visible)]="mostrarConfiguracion" [modal]="true" 
                  [style]="{width: '600px'}" [closable]="true">
            <div class="p-fluid" *ngIf="estadoScheduler">
                <div class="field">
                    <label class="font-bold">Scheduler Automático</label>
                    <div class="flex align-items-center gap-2 mt-2">
                        <p-inputSwitch [(ngModel)]="schedulerHabilitado" 
                                       (onChange)="toggleScheduler()"></p-inputSwitch>
                        <span>{{ schedulerHabilitado ? 'Habilitado' : 'Deshabilitado' }}</span>
                    </div>
                    <small class="text-gray-500">El scheduler verifica automáticamente mantenimientos y contratos próximos a vencer.</small>
                </div>
                
                <div class="field mt-4">
                    <label class="font-bold">Hora de Ejecución Diaria</label>
                    <div class="flex align-items-center gap-2 mt-2">
                        <p-inputNumber [(ngModel)]="horaEjecucion" [min]="0" [max]="23" 
                                       [showButtons]="true" buttonLayout="horizontal"
                                       incrementButtonIcon="pi pi-plus" decrementButtonIcon="pi pi-minus"
                                       suffix=" hrs" [style]="{width: '150px'}"></p-inputNumber>
                        <span>:</span>
                        <p-inputNumber [(ngModel)]="minutoEjecucion" [min]="0" [max]="59" 
                                       [showButtons]="true" buttonLayout="horizontal"
                                       incrementButtonIcon="pi pi-plus" decrementButtonIcon="pi pi-minus"
                                       suffix=" min" [style]="{width: '150px'}"></p-inputNumber>
                        <button pButton label="Guardar" icon="pi pi-save" class="p-button-success"
                                (click)="guardarHorario()"></button>
                    </div>
                    <small class="text-gray-500">El scheduler se ejecutará diariamente a esta hora.</small>
                </div>

                <div class="field mt-4">
                    <label class="font-bold">Configuración de Alertas</label>
                    <p-table [value]="configuraciones" styleClass="p-datatable-sm mt-2">
                        <ng-template pTemplate="header">
                            <tr>
                                <th>Tipo de Alerta</th>
                                <th>Días de Anticipación</th>
                                <th>Estado</th>
                            </tr>
                        </ng-template>
                        <ng-template pTemplate="body" let-config>
                            <tr>
                                <td>
                                    <span class="font-medium">{{ config.nombre }}</span>
                                    <br><small class="text-gray-500">{{ config.descripcion }}</small>
                                </td>
                                <td>
                                    <span *ngIf="!config.tipoAlerta.includes('vencido')" class="font-medium">
                                        {{ config.diasAnticipacion }} días
                                    </span>
                                    <span *ngIf="config.tipoAlerta.includes('vencido')" class="text-gray-500">
                                        <i class="pi pi-info-circle mr-1"></i>No aplica
                                    </span>
                                </td>
                                <td>
                                    <p-inputSwitch [(ngModel)]="config.activa"
                                                   (onChange)="actualizarConfiguracion(config)"></p-inputSwitch>
                                </td>
                            </tr>
                        </ng-template>
                    </p-table>
                </div>
            </div>
            <ng-template pTemplate="footer">
                <button pButton label="Cerrar" icon="pi pi-times" class="p-button-text" 
                        (click)="mostrarConfiguracion = false"></button>
            </ng-template>
        </p-dialog>

        <p-toast></p-toast>
        <p-confirmDialog></p-confirmDialog>
    `,
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
        private confirmationService: ConfirmationService
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
        
        items.push({
            separator: true
        });
        
        items.push({
            label: 'Eliminar',
            icon: 'pi pi-trash',
            styleClass: 'text-red-500',
            command: () => this.eliminar(notif)
        });
        
        return items;
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

@NgModule({
    declarations: [NotificacionesComponent],
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        ToastModule,
        ToolbarModule,
        BadgeModule,
        TagModule,
        DialogModule,
        InputSwitchModule,
        InputNumberModule,
        ConfirmDialogModule,
        TooltipModule,
        InputTextModule,
        MenuModule,
        ProgressSpinnerModule,
        RouterModule.forChild([{ path: '', component: NotificacionesComponent }])
    ]
})
export class NotificacionesModule { }
