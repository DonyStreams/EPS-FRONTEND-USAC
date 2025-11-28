import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Table } from 'primeng/table';
import { HttpClient } from '@angular/common/http';
import { ProgramacionesService } from '../../../service/programaciones.service';
import { environment } from '../../../../environments/environment';

// Interfaces
export interface ProgramacionMantenimiento {
    idProgramacion?: number;
    equipoId: number;
    tipoMantenimientoId: number;
    contratoId: number;
    frecuenciaDias: number;
    fechaUltimoMantenimiento?: Date;
    fechaProximoMantenimiento?: Date;
    diasAlertaPrevia: number;
    activa: boolean;
    observaciones?: string;

    // Objetos anidados para mostrar información relacionada
    equipo?: {
        idEquipo?: number;
        nombre?: string;
        codigoInacif?: string;
        ubicacion?: string;
    };

    tipoMantenimiento?: {
        idTipo?: number;
        nombre?: string;
    };

    contrato?: {
        idContrato?: number;
        descripcion?: string;
        descripcionCompleta?: string;
        fechaInicio?: Date;
        fechaFin?: Date;
        proveedor?: {
            nombre?: string;
        };
    };
}

export interface Equipo {
    idEquipo: number;
    nombre: string;
    codigoInacif: string;
    ubicacion?: string;
}

export interface TipoMantenimiento {
    idTipo: number;
    nombre: string;
}

export interface Contrato {
    idContrato: number;
    descripcion: string;
    descripcionCompleta?: string;
    fechaInicio: Date;
    fechaFin: Date;
    estado: string;
    proveedor?: {
        nombre?: string;
    };
}

@Component({
    selector: 'app-programaciones',
    templateUrl: './programaciones.component.html',
    styleUrls: ['./programaciones.component.scss']
})
export class ProgramacionesComponent implements OnInit {

    // URLs del backend
    private readonly API_URL = environment.apiUrl;

    // Datos principales
    programaciones: ProgramacionMantenimiento[] = [];
    selectedProgramacion: ProgramacionMantenimiento | null = null;
    loading: boolean = false;

    // Estadísticas
    stats = {
        total: 0,
        activas: 0,
        proximas: 0,
        vencidas: 0
    };

    // Modal crear/editar
    displayDialog: boolean = false;
    displayDetailDialog: boolean = false;
    isEditing: boolean = false;
    programacion: ProgramacionMantenimiento = this.initializeProgramacion();

    // Listas para dropdowns
    equipos: Equipo[] = [];
    tiposMantenimiento: TipoMantenimiento[] = [];
    contratosDisponibles: Contrato[] = [];

    constructor(
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private http: HttpClient,
        private programacionesService: ProgramacionesService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.loadProgramaciones();
        this.loadEquipos();
        this.loadTiposMantenimiento();
    }

    /**
     * Inicializa una programación vacía
     */
    initializeProgramacion(): ProgramacionMantenimiento {
        return {
            equipoId: 0,
            tipoMantenimientoId: 0,
            contratoId: 0,
            frecuenciaDias: 30,
            diasAlertaPrevia: 7,
            activa: true,
            fechaProximoMantenimiento: new Date()
        };
    }

    /**
     * Carga todas las programaciones
     */
    loadProgramaciones(): void {
        this.loading = true;

        this.http.get<ProgramacionMantenimiento[]>(`${this.API_URL}/programaciones`).subscribe({
            next: (data) => {
                console.log('📋 Programaciones cargadas:', data);
                // Convertir las fechas del formato backend a Date
                this.programaciones = data.map(prog => ({
                    ...prog,
                    fechaUltimoMantenimiento: this.parseBackendDate(prog.fechaUltimoMantenimiento),
                    fechaProximoMantenimiento: this.parseBackendDate(prog.fechaProximoMantenimiento)
                }));
                this.calculateStats();
                this.loading = false;
            },
            error: (error) => {
                console.error('❌ Error cargando programaciones:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar programaciones'
                });
                this.programaciones = [];
                this.loading = false;
            }
        });
    }

    /**
     * Carga la lista de equipos
     */
    loadEquipos(): void {
        this.http.get<Equipo[]>(`${this.API_URL}/equipos`).subscribe({
            next: (data) => {
                this.equipos = data;
            },
            error: (error) => {
                console.error('Error cargando equipos:', error);
                // Datos de fallback
                this.equipos = [
                    { idEquipo: 1, nombre: 'Microscopio Óptico', codigoInacif: 'MIC-001', ubicacion: 'Laboratorio A' },
                    { idEquipo: 2, nombre: 'Balanza Analítica', codigoInacif: 'BAL-002', ubicacion: 'Laboratorio B' }
                ];
            }
        });
    }

    /**
     * Carga los tipos de mantenimiento
     */
    loadTiposMantenimiento(): void {
        this.http.get<TipoMantenimiento[]>(`${this.API_URL}/tipos-mantenimiento`).subscribe({
            next: (data) => {
                this.tiposMantenimiento = data;
            },
            error: (error) => {
                console.error('Error cargando tipos de mantenimiento:', error);
                // Datos de fallback
                this.tiposMantenimiento = [
                    { idTipo: 1, nombre: 'Preventivo' },
                    { idTipo: 2, nombre: 'Correctivo' },
                    { idTipo: 3, nombre: 'Calibración' }
                ];
            }
        });
    }

    /**
     * Carga todos los contratos disponibles (al inicio)
     */
    loadAllContratos(): void {
        console.log('🔍 Cargando todos los contratos vigentes...');

        this.http.get<any[]>(`${this.API_URL}/contratos/vigentes`).subscribe({
            next: (data) => {
                console.log('✅ Contratos vigentes cargados:', data);
                console.log('📊 Cantidad de contratos:', data.length);

                // Transformar los datos para que tengan la estructura correcta
                this.contratosDisponibles = data.map(contrato => ({
                    idContrato: contrato.idContrato,
                    descripcion: contrato.descripcion,
                    descripcionCompleta: contrato.descripcionCompleta || `${contrato.descripcion} - ${contrato.proveedorNombre}`,
                    fechaInicio: new Date(contrato.fechaInicio),
                    fechaFin: new Date(contrato.fechaFin),
                    estado: contrato.estado,
                    proveedorNombre: contrato.proveedorNombre,
                    proveedor: {
                        nombre: contrato.proveedorNombre
                    }
                }));

                console.log('📝 contratosDisponibles asignado:', this.contratosDisponibles);
                console.log('📊 Cantidad en contratosDisponibles:', this.contratosDisponibles.length);

                // Forzar detección de cambios
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('❌ Error cargando contratos vigentes:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar contratos vigentes'
                });
                this.contratosDisponibles = [];
            }
        });
    }

    /**
     * Carga contratos disponibles para el equipo y tipo seleccionados
     */
    loadContratosDisponibles(): void {
        if (!this.programacion.equipoId || !this.programacion.tipoMantenimientoId) {
            this.contratosDisponibles = [];
            return;
        }

        console.log('🔍 Buscando contratos para equipoId:', this.programacion.equipoId, 'tipoId:', this.programacion.tipoMantenimientoId);

        // Usar el servicio de programaciones que ya corregimos
        this.programacionesService.getContratosDisponibles(
            this.programacion.equipoId,
            this.programacion.tipoMantenimientoId
        ).subscribe({
            next: (data) => {
                this.contratosDisponibles = data.map(contrato => ({
                    ...contrato,
                    descripcionCompleta: `${contrato.descripcion} - ${contrato.proveedor?.nombre || 'Sin proveedor'}`
                }));
                console.log('✅ Contratos vigentes obtenidos:', this.contratosDisponibles);
            },
            error: (error) => {
                console.error('❌ Error cargando contratos vigentes:', error);
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'Error al cargar contratos vigentes. Puede que no haya contratos disponibles.'
                });
                this.contratosDisponibles = [];
            }
        });
    }

    /**
     * Calcula las estadísticas del dashboard
     */
    calculateStats(): void {
        const today = new Date();
        const sevenDaysFromNow = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000));

        this.stats = {
            total: this.programaciones.length,
            activas: this.programaciones.filter(p => p.activa).length,
            proximas: this.programaciones.filter(p =>
                p.activa &&
                p.fechaProximoMantenimiento &&
                p.fechaProximoMantenimiento <= sevenDaysFromNow &&
                p.fechaProximoMantenimiento >= today
            ).length,
            vencidas: this.programaciones.filter(p =>
                p.activa &&
                p.fechaProximoMantenimiento &&
                p.fechaProximoMantenimiento < today
            ).length
        };
    }

    /**
     * Abre el diálogo para crear nueva programación
     */
    openNew(): void {
        this.programacion = this.initializeProgramacion();
        this.isEditing = false;
        this.displayDialog = true;

        // 🚨 CARGAR CONTRATOS CUANDO SE ABRE EL DIÁLOGO
        console.log('🔄 Cargando contratos al abrir diálogo...');
        this.loadAllContratos();
    }

    /**
     * Abre el diálogo para editar programación
     */
    editProgramacion(programacion: ProgramacionMantenimiento): void {
        this.programacion = { ...programacion };
        this.isEditing = true;
        this.displayDialog = true;
        this.loadContratosDisponibles();
    }

    /**
     * Muestra el detalle de una programación
     */
    verDetalle(programacion: ProgramacionMantenimiento): void {
        this.selectedProgramacion = programacion;
        this.displayDetailDialog = true;
    }

    /**
     * Oculta el diálogo
     */
    hideDialog(): void {
        this.displayDialog = false;
        this.programacion = this.initializeProgramacion();
        this.contratosDisponibles = [];
    }

    /**
     * Guarda la programación
     */
    saveProgramacion(): void {
        if (!this.isFormValid()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Por favor complete todos los campos requeridos'
            });
            return;
        }

        // Transformar los datos para el backend (espera objetos anidados, no IDs planos)
        const programacionDTO = {
            equipo: {
                idEquipo: this.programacion.equipoId
            },
            tipoMantenimiento: {
                idTipo: this.programacion.tipoMantenimientoId
            },
            contrato: {
                idContrato: this.programacion.contratoId
            },
            frecuenciaDias: this.programacion.frecuenciaDias,
            diasAlertaPrevia: this.programacion.diasAlertaPrevia,
            fechaUltimoMantenimiento: this.programacion.fechaUltimoMantenimiento,
            fechaProximoMantenimiento: this.programacion.fechaProximoMantenimiento,
            activa: this.programacion.activa,
            observaciones: this.programacion.observaciones
        };

        console.log('💾 Guardando programación:', programacionDTO);

        const url = this.isEditing ?
            `${this.API_URL}/programaciones/${this.programacion.idProgramacion}` :
            `${this.API_URL}/programaciones`;

        const method = this.isEditing ? 'PUT' : 'POST';

        this.http.request(method, url, { body: programacionDTO }).subscribe({
            next: (response) => {
                console.log('✅ Programación guardada exitosamente:', response);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: this.isEditing ? 'Programación actualizada' : 'Programación creada'
                });
                this.hideDialog();
                this.loadProgramaciones();
            },
            error: (error) => {
                console.error('❌ Error guardando programación:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.error || 'Error al guardar la programación'
                });
            }
        });
    }

    /**
     * Valida si el formulario es válido
     */
    isFormValid(): boolean {
        return !!(
            this.programacion.equipoId &&
            this.programacion.tipoMantenimientoId &&
            this.programacion.contratoId &&
            this.programacion.frecuenciaDias &&
            this.programacion.diasAlertaPrevia
        );
    }

    /**
     * Se ejecuta cuando cambia el equipo seleccionado
     */
    onEquipoChange(): void {
        this.programacion.contratoId = 0;
        this.loadContratosDisponibles();
    }

    /**
     * Se ejecuta cuando cambia el tipo de mantenimiento
     */
    onTipoChange(): void {
        this.programacion.contratoId = 0;
        this.loadContratosDisponibles();
    }

    /**
     * Calcula la próxima fecha de mantenimiento
     */
    calcularProximaFecha(): void {
        if (!this.programacion.frecuenciaDias) {
            return;
        }

        // Si hay fecha de último mantenimiento, usarla como base
        // Si no, usar la fecha actual
        const fechaBase = this.programacion.fechaUltimoMantenimiento
            ? new Date(this.programacion.fechaUltimoMantenimiento)
            : new Date();

        // Calcular la próxima fecha sumando la frecuencia
        const fechaProxima = new Date(fechaBase);
        fechaProxima.setDate(fechaProxima.getDate() + this.programacion.frecuenciaDias);

        this.programacion.fechaProximoMantenimiento = fechaProxima;

        console.log('📅 Próxima fecha calculada:', fechaProxima.toLocaleDateString('es-ES'));
    }

    /**
     * Alternar estado activa/inactiva
     */
    toggleActiva(programacion: ProgramacionMantenimiento): void {
        const accion = programacion.activa ? 'pausar' : 'activar';
        const explicacion = programacion.activa 
            ? 'La programación se ocultará del calendario pero no se eliminará. Las ejecuciones existentes permanecerán.' 
            : 'La programación volverá a aparecer en el calendario.';
        
        this.confirmationService.confirm({
            message: `¿Está seguro de ${accion} esta programación? ${explicacion}`,
            header: accion === 'pausar' ? 'Pausar Programación' : 'Activar Programación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (!programacion.idProgramacion) return;
                
                this.http.patch(`${this.API_URL}/programaciones/${programacion.idProgramacion}/toggle`, {})
                    .subscribe({
                        next: () => {
                            programacion.activa = !programacion.activa;
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Éxito',
                                detail: `Programación ${programacion.activa ? 'activada' : 'pausada'} correctamente`
                            });
                            this.calculateStats();
                        },
                        error: (error) => {
                            console.error('Error al cambiar estado:', error);
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'No se pudo cambiar el estado de la programación'
                            });
                        }
                    });
            }
        });
    }

    /**
     * Eliminar programación (con sus ejecuciones asociadas)
     */
    deleteProgramacion(programacion: ProgramacionMantenimiento): void {
        this.confirmationService.confirm({
            message: '⚠️ ¿Está seguro de eliminar esta programación? Se eliminarán también TODAS las ejecuciones asociadas a esta programación. Esta acción no se puede deshacer.',
            header: 'Eliminar Programación',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                if (!programacion.idProgramacion) return;
                
                this.http.delete(`${this.API_URL}/programaciones/${programacion.idProgramacion}`)
                    .subscribe({
                        next: () => {
                            this.programaciones = this.programaciones.filter(p => p.idProgramacion !== programacion.idProgramacion);
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Éxito',
                                detail: 'Programación eliminada correctamente'
                            });
                            this.calculateStats();
                        },
                        error: (error) => {
                            console.error('Error al eliminar programación:', error);
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'No se pudo eliminar la programación'
                            });
                        }
                    });
            }
        });
    }

    /**
     * Crear mantenimiento desde programación
     */
    crearMantenimiento(programacion: ProgramacionMantenimiento): void {
        if (!programacion.idProgramacion) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'La programación seleccionada no tiene un identificador válido'
            });
            return;
        }

        this.confirmationService.confirm({
            message: `¿Crear mantenimiento para ${programacion.equipo?.nombre}?`,
            header: 'Confirmar Creación',
            icon: 'pi pi-question',
            accept: () => {
                this.loading = true;
                this.programacionesService.crearMantenimiento(programacion.idProgramacion!).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: `Se generó el mantenimiento para ${programacion.equipo?.nombre || 'el equipo'}`
                        });
                        this.loadProgramaciones();
                    },
                    error: (error) => {
                        console.error('❌ Error creando mantenimiento:', error);
                        this.loading = false;
                        const detail = error?.error?.message || error?.error || 'No se pudo crear el mantenimiento';
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail
                        });
                    }
                });
            }
        });
    }

    /**
     * Exportar a CSV
     */
    exportCSV(): void {
        try {
            if (!this.programaciones || this.programaciones.length === 0) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'No hay programaciones para exportar'
                });
                return;
            }

            const csvData = this.programaciones.map(prog => ({
                'ID': prog.idProgramacion,
                'Equipo': prog.equipo?.nombre || '',
                'Código Equipo': prog.equipo?.codigoInacif || '',
                'Tipo Mantenimiento': prog.tipoMantenimiento?.nombre || '',
                'Contrato': prog.contrato?.descripcion || '',
                'Proveedor': prog.contrato?.proveedor?.nombre || '',
                'Frecuencia (días)': prog.frecuenciaDias,
                'Último Mantenimiento': prog.fechaUltimoMantenimiento ? new Date(prog.fechaUltimoMantenimiento).toLocaleDateString('es-ES') : '',
                'Próximo Mantenimiento': prog.fechaProximoMantenimiento ? new Date(prog.fechaProximoMantenimiento).toLocaleDateString('es-ES') : '',
                'Días Alerta': prog.diasAlertaPrevia,
                'Estado': prog.activa ? 'Activa' : 'Inactiva',
                'Observaciones': prog.observaciones || ''
            }));

            const headers = Object.keys(csvData[0] || {});
            const csvContent = [
                headers.join(','),
                ...csvData.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
            ].join('\n');

            const fechaHoy = new Date().toLocaleDateString('es-ES').replace(/\//g, '-');
            const nombreArchivo = `programaciones_${fechaHoy}.csv`;

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', nombreArchivo);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: `Programaciones exportadas como ${nombreArchivo}`
            });
        } catch (error) {
            console.error('Error al exportar CSV:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al exportar los datos'
            });
        }
    }

    /**
     * Filtro global de la tabla
     */
    onGlobalFilter(table: Table, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    /**
     * Obtiene la severidad para los tags de tipo de mantenimiento
     */
    getTipoSeverity(tipo: string): string {
        switch (tipo?.toLowerCase()) {
            case 'preventivo':
                return 'success';
            case 'correctivo':
                return 'warning';
            case 'calibración':
                return 'info';
            default:
                return 'secondary';
        }
    }

    /**
     * Obtiene la clase CSS para las fechas
     */
    getDateClass(fecha: Date | undefined): string {
        if (!fecha) return '';

        const today = new Date();
        const fechaObj = new Date(fecha);

        if (fechaObj < today) {
            return 'fecha-vencida';
        } else if (this.isProxima(fecha)) {
            return 'fecha-proxima';
        } else {
            return 'fecha-normal';
        }
    }

    /**
     * Verifica si una fecha está vencida
     */
    isVencida(fecha: Date | undefined): boolean {
        if (!fecha) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(fecha) < today;
    }

    /**
     * Verifica si una fecha está próxima (dentro de 7 días)
     */
    isProxima(fecha: Date | undefined): boolean {
        if (!fecha) return false;
        const today = new Date();
        const sevenDaysFromNow = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000));
        const fechaObj = new Date(fecha);
        return fechaObj >= today && fechaObj <= sevenDaysFromNow;
    }

    /**
     * Parsea fechas del backend que vienen en formato "2025-08-08T00:00:00Z[UTC]"
     */
    private parseBackendDate(dateString: any): Date | null {
        if (!dateString) return null;

        // Si ya es un objeto Date, devolverlo
        if (dateString instanceof Date) return dateString;

        // Convertir a string y limpiar el formato [UTC]
        const cleanDateString = String(dateString).replace(/\[UTC\]$/, '');

        // Intentar parsear la fecha
        const parsedDate = new Date(cleanDateString);

        // Verificar si la fecha es válida
        if (isNaN(parsedDate.getTime())) {
            console.warn('⚠️ Fecha inválida recibida del backend:', dateString);
            return null;
        }

        return parsedDate;
    }
}
