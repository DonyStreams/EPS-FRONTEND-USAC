import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Table } from 'primeng/table';
import { EjecucionesService, EjecucionMantenimiento } from '../../../service/ejecuciones.service';
import { ContratosService, Contrato } from '../../../service/contratos.service';
import { ProveedoresService, Proveedor } from '../../../service/proveedores.service';

@Component({
    selector: 'app-ejecuciones',
    templateUrl: './ejecuciones.component.html',
    styleUrls: ['./ejecuciones.component.scss']
})
export class EjecucionesComponent implements OnInit {
    @ViewChild('dt') dt!: Table;

    ejecuciones: EjecucionMantenimiento[] = [];
    contratos: Contrato[] = [];
    proveedores: Proveedor[] = [];
    loading = true;
    showDialog = false;
    
    selectedEjecucion: Partial<EjecucionMantenimiento> = {};
    isEditMode = false;
    
    cols = [
        { field: 'fechaInicio', header: 'Fecha Inicio' },
        { field: 'fechaFin', header: 'Fecha Fin' },
        { field: 'contrato.proveedor.nombre', header: 'Proveedor' },
        { field: 'equipo.nombre', header: 'Equipo' },
        { field: 'tipoMantenimiento.nombre', header: 'Tipo Mantenimiento' },
        { field: 'costo', header: 'Costo' },
        { field: 'observaciones', header: 'Observaciones' }
    ];

    statuses = [
        { label: 'Pendiente', value: 'PENDIENTE' },
        { label: 'En Progreso', value: 'EN_PROGRESO' },
        { label: 'Completado', value: 'COMPLETADO' },
        { label: 'Cancelado', value: 'CANCELADO' }
    ];

    constructor(
        private ejecucionesService: EjecucionesService,
        private contratosService: ContratosService,
        private proveedoresService: ProveedoresService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadEjecuciones();
        this.loadContratos();
        this.loadProveedores();
    }

    loadEjecuciones() {
        this.loading = true;
        this.ejecucionesService.getAll().subscribe({
            next: (data) => {
                this.ejecuciones = data;
                this.loading = false;
                console.log('Ejecuciones cargadas:', this.ejecuciones);
                
                // Debug de cada ejecución
                this.ejecuciones.forEach((ejecucion, index) => {
                    console.log(`Ejecución ${index + 1}:`, {
                        id: ejecucion.idEjecucion,
                        fechaEjecucion: ejecucion.fechaEjecucion,
                        fechaInicio: ejecucion.fechaInicio,
                        fechaFin: ejecucion.fechaFin,
                        contrato: ejecucion.contrato,
                        equipo: ejecucion.equipo,
                        estado: ejecucion.estado,
                        costo: ejecucion.costo
                    });
                });
            },
            error: (error) => {
                console.error('Error al cargar ejecuciones:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar las ejecuciones de mantenimiento'
                });
                this.loading = false;
            }
        });
    }

    loadContratos() {
        this.contratosService.getActivos().subscribe({
            next: (data) => {
                this.contratos = data;
                console.log('Contratos cargados:', this.contratos);
            },
            error: (error) => {
                console.error('Error al cargar contratos:', error);
                // En caso de error, usar un array vacío para que no falle la interfaz
                this.contratos = [];
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'No se pudieron cargar los contratos. Algunas funciones pueden estar limitadas.'
                });
            }
        });
    }

    loadProveedores() {
        this.proveedoresService.getActivos().subscribe({
            next: (data) => {
                this.proveedores = data;
                console.log('Proveedores cargados:', this.proveedores);
            },
            error: (error) => {
                console.error('Error al cargar proveedores:', error);
                // En caso de error, usar un array vacío
                this.proveedores = [];
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'No se pudieron cargar los proveedores. Algunas funciones pueden estar limitadas.'
                });
            }
        });
    }

    openNew() {
        this.selectedEjecucion = {};
        this.isEditMode = false;
        this.showDialog = true;
    }

    editEjecucion(ejecucion: EjecucionMantenimiento) {
        this.selectedEjecucion = { ...ejecucion };
        this.isEditMode = true;
        this.showDialog = true;
    }

    deleteEjecucion(ejecucion: EjecucionMantenimiento) {
        this.confirmationService.confirm({
            message: '¿Está seguro de que desea eliminar esta ejecución de mantenimiento?',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (ejecucion.idEjecucion) {
                    this.ejecucionesService.delete(ejecucion.idEjecucion).subscribe({
                        next: () => {
                            this.ejecuciones = this.ejecuciones.filter(e => e.idEjecucion !== ejecucion.idEjecucion);
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Éxito',
                                detail: 'Ejecución eliminada exitosamente'
                            });
                        },
                        error: (error) => {
                            console.error('Error al eliminar ejecución:', error);
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Error al eliminar la ejecución'
                            });
                        }
                    });
                }
            }
        });
    }

    saveEjecucion() {
        if (this.selectedEjecucion.idContrato && (this.selectedEjecucion.fechaEjecucion || this.selectedEjecucion.fechaInicio)) {
            if (this.isEditMode && this.selectedEjecucion.idEjecucion) {
                this.ejecucionesService.update(this.selectedEjecucion.idEjecucion, this.selectedEjecucion).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Ejecución actualizada exitosamente'
                        });
                        this.hideDialog();
                        this.loadEjecuciones();
                    },
                    error: (error) => {
                        console.error('Error al actualizar ejecución:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al actualizar la ejecución'
                        });
                    }
                });
            } else {
                this.ejecucionesService.create(this.selectedEjecucion).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Ejecución creada exitosamente'
                        });
                        this.hideDialog();
                        this.loadEjecuciones();
                    },
                    error: (error) => {
                        console.error('Error al crear ejecución:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al crear la ejecución'
                        });
                    }
                });
            }
        } else {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Por favor complete los campos requeridos'
            });
        }
    }

    hideDialog() {
        this.showDialog = false;
        this.selectedEjecucion = {};
        this.isEditMode = false;
    }

    applyFilterGlobal(event: any, stringVal: string) {
        this.dt.filterGlobal((event.target as HTMLInputElement).value, stringVal);
    }

    formatDate(date: any): string {
        if (!date) return '';
        
        try {
            let d: Date;
            if (typeof date === 'string') {
                // Limpiar el formato UTC específico del backend
                let cleanDate = date.replace('Z[UTC]', 'Z');
                d = new Date(cleanDate);
            } else if (date instanceof Date) {
                d = date;
            } else if (typeof date === 'number') {
                d = new Date(date);
            } else {
                return '';
            }
            
            // Verificar si la fecha es válida
            if (isNaN(d.getTime())) {
                console.warn('Fecha inválida:', date);
                return '';
            }
            
            return d.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch (error) {
            console.error('Error al formatear fecha:', date, error);
            return '';
        }
    }

    formatCurrency(value: number): string {
        if (!value) return 'Q 0.00';
        return new Intl.NumberFormat('es-GT', {
            style: 'currency',
            currency: 'GTQ'
        }).format(value);
    }

    getContratoDescripcion(idContrato: number | undefined): string {
        if (!idContrato) return '';
        const contrato = this.contratos.find(c => c.idContrato === idContrato);
        return contrato?.descripcion || '';
    }
}
