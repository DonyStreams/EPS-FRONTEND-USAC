import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProgramacionesService, ProgramacionMantenimiento } from '../../../service/programaciones.service';
import { AlertasService, AlertaMantenimiento } from '../../../service/alertas.service';
import { EquiposService } from '../../../service/equipos.service';
import { Equipo } from '../../../api/equipos';
import { TiposMantenimientoService, TipoMantenimiento } from '../../../service/tipos-mantenimiento.service';

@Component({
    selector: 'app-programaciones',
    templateUrl: './programaciones.component.html',
    providers: [ConfirmationService, MessageService]
})
export class ProgramacionesComponent implements OnInit {
    programaciones: ProgramacionMantenimiento[] = [];
    alertas: AlertaMantenimiento[] = [];
    programacionForm: FormGroup;
    equipos: Equipo[] = [];
    tiposMantenimiento: TipoMantenimiento[] = [];
    
    displayDialog = false;
    isEditing = false;
    selectedProgramacion: ProgramacionMantenimiento | null = null;
    loading = true;  // Cambiar a true inicialmente
    
    // Estadísticas del dashboard
    totalProgramaciones = 0;
    totalAlertas = 0;
    totalVencidas = 0;
    
    maxDate = new Date();
    
    constructor(
        private fb: FormBuilder,
        private programacionesService: ProgramacionesService,
        private alertasService: AlertasService,
        private equiposService: EquiposService,
        private tiposService: TiposMantenimientoService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.programacionForm = this.fb.group({
            id_equipo: ['', Validators.required],
            id_tipo_mantenimiento: ['', Validators.required],
            frecuencia_dias: ['', [Validators.required, Validators.min(1)]],
            fecha_ultimo_mantenimiento: [''],
            dias_alerta_previa: [7, [Validators.required, Validators.min(0)]],
            observaciones: [''],
            activa: [true]
        });
    }

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.loading = true;
        
        console.log('[Programaciones] Iniciando carga de datos...');
        
        let callsCompleted = 0;
        const totalCalls = 4;
        
        const checkAllCompleted = () => {
            callsCompleted++;
            if (callsCompleted >= totalCalls) {
                this.loading = false;
                console.log('[Programaciones] Todas las llamadas completadas. Arrays finales:');
                console.log('- Programaciones:', this.programaciones.length, this.programaciones);
                console.log('- Alertas:', this.alertas.length, this.alertas);
                console.log('- Equipos:', this.equipos.length);
                console.log('- Tipos:', this.tiposMantenimiento.length);
            }
        };
        
        // Cargar programaciones
        this.programacionesService.getAll().subscribe({
            next: (data) => {
                console.log('[Programaciones] Datos recibidos:', data);
                console.log('[Programaciones] Estructura del primer registro:', data[0]);
                console.log('[Programaciones] Propiedades disponibles:', Object.keys(data[0] || {}));
                this.programaciones = data;
                this.totalProgramaciones = data.length;
                checkAllCompleted();
            },
            error: (error) => {
                console.error('[Programaciones] Error al cargar programaciones:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar programaciones: ' + (error.error?.message || error.message)
                });
                checkAllCompleted();
            }
        });

        // Cargar alertas
        this.alertasService.getDashboard().subscribe({
            next: (dashboard) => {
                console.log('[Alertas] Dashboard recibido:', dashboard);
                console.log('[Alertas] Estructura de alertas:', dashboard.alertas[0]);
                console.log('[Alertas] Propiedades de alertas:', Object.keys(dashboard.alertas[0] || {}));
                this.totalVencidas = dashboard.total_vencidas;
                this.totalAlertas = dashboard.total_alertas;
                this.alertas = [...dashboard.vencidas, ...dashboard.alertas];
                checkAllCompleted();
            },
            error: (error) => {
                console.error('[Alertas] Error al cargar alertas:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar alertas: ' + (error.error?.message || error.message)
                });
                checkAllCompleted();
            }
        });

        // Cargar equipos
        this.equiposService.getEquipos({}).subscribe({
            next: (equipos) => {
                console.log('[Equipos] Equipos recibidos:', equipos);
                this.equipos = equipos;
                checkAllCompleted();
            },
            error: (error) => {
                console.error('[Equipos] Error al cargar equipos:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar equipos'
                });
                checkAllCompleted();
            }
        });

        // Cargar tipos de mantenimiento
        this.tiposService.getActivos().subscribe({
            next: (tipos) => {
                console.log('[Tipos] Tipos recibidos:', tipos);
                this.tiposMantenimiento = tipos;
                checkAllCompleted();
            },
            error: (error) => {
                console.error('[Tipos] Error al cargar tipos:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar tipos de mantenimiento'
                });
                checkAllCompleted();
            }
        });
    }

    showCreateDialog() {
        this.isEditing = false;
        this.selectedProgramacion = null;
        this.programacionForm.reset();
        this.programacionForm.patchValue({
            activa: true,
            dias_alerta_previa: 7
        });
        this.displayDialog = true;
    }

    editProgramacion(id: number) {
        this.programacionesService.getById(id).subscribe({
            next: (programacion) => {
                this.isEditing = true;
                this.selectedProgramacion = programacion;
                this.programacionForm.patchValue({
                    id_equipo: programacion.equipo?.idEquipo,
                    id_tipo_mantenimiento: programacion.tipoMantenimiento?.idTipo,
                    frecuencia_dias: programacion.frecuenciaDias,
                    fecha_ultimo_mantenimiento: programacion.fechaUltimoMantenimiento,
                    dias_alerta_previa: programacion.diasAlertaPrevia,
                    observaciones: programacion.observaciones,
                    activa: programacion.activa
                });
                this.displayDialog = true;
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar programación'
                });
            }
        });
    }

    saveProgramacion() {
        if (this.programacionForm.valid) {
            const formData = this.programacionForm.value;
            
            if (this.isEditing && this.selectedProgramacion) {
                this.programacionesService.update(this.selectedProgramacion.idProgramacion!, formData).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Programación actualizada correctamente'
                        });
                        this.hideDialog();
                        this.loadData();
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al actualizar programación'
                        });
                    }
                });
            } else {
                this.programacionesService.create(formData).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Programación creada correctamente'
                        });
                        this.hideDialog();
                        this.loadData();
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al crear programación'
                        });
                    }
                });
            }
        }
    }

    deleteProgramacion(programacion: ProgramacionMantenimiento) {
        this.confirmationService.confirm({
            message: '¿Está seguro de que desea eliminar esta programación?',
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.programacionesService.delete(programacion.idProgramacion!).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Programación eliminada correctamente'
                        });
                        this.loadData();
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al eliminar programación'
                        });
                    }
                });
            }
        });
    }

    calcularProximaFecha(programacion: ProgramacionMantenimiento) {
        // Lógica para calcular la próxima fecha basada en la frecuencia
        if (programacion.fechaUltimoMantenimiento && programacion.frecuenciaDias) {
            const ultimaFecha = new Date(programacion.fechaUltimoMantenimiento);
            const proximaFecha = new Date(ultimaFecha);
            proximaFecha.setDate(ultimaFecha.getDate() + programacion.frecuenciaDias);
            
            // Actualizar la programación con la nueva fecha
            const updatedProgramacion = {
                ...programacion,
                fechaProximoMantenimiento: proximaFecha
            };
            
            this.programacionesService.update(programacion.idProgramacion!, updatedProgramacion).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Fecha próxima calculada correctamente'
                    });
                    this.loadData();
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al calcular fecha próxima'
                    });
                }
            });
        }
    }

    hideDialog() {
        this.displayDialog = false;
        this.isEditing = false;
        this.selectedProgramacion = null;
        this.programacionForm.reset();
    }

    getSeverity(estado: string): string {
        switch (estado) {
            case 'NORMAL':
                return 'success';
            case 'ALERTA':
                return 'warning';
            case 'VENCIDO':
                return 'danger';
            default:
                return 'info';
        }
    }

    getAbsoluteValue(value: number | undefined): number {
        return Math.abs(value || 0);
    }

    // Función helper para convertir fechas
    formatDate(dateString: string | Date | null | undefined): Date | null {
        if (!dateString) return null;
        
        if (dateString instanceof Date) return dateString;
        
        // Convertir string a Date, removiendo el [UTC] si existe
        const cleanDateString = dateString.toString().replace(/\[UTC\]$/, '');
        const date = new Date(cleanDateString);
        
        return isNaN(date.getTime()) ? null : date;
    }
}
