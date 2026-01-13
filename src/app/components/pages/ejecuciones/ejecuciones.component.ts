import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import { Table } from 'primeng/table';
import { Menu } from 'primeng/menu';
import { EjecucionesService, EjecucionMantenimiento, GuardarEjecucionRequest, CambioEstadoRequest } from '../../../service/ejecuciones.service';
import { ContratosService, Contrato } from '../../../service/contratos.service';
import { EvidenciasService, Evidencia, UploadProgress } from '../../../service/evidencias.service';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-ejecuciones',
    templateUrl: './ejecuciones.component.html',
    styleUrls: ['./ejecuciones.component.scss']
})
export class EjecucionesComponent implements OnInit {
    @ViewChild('dt') dt!: Table;
    @ViewChild('menuAcciones') menuAcciones!: Menu;

    ejecuciones: EjecucionMantenimiento[] = [];
    contratos: Contrato[] = [];
    loading = true;
    showDialog = false;
    accionLoadingId: number | null = null;
    
    // Menú de acciones
    accionesMenuItems: MenuItem[] = [];
    ejecucionSeleccionadaMenu: EjecucionMantenimiento | null = null;
    
    selectedEjecucion: Partial<EjecucionMantenimiento> = {};
    isEditMode = false;
    equiposContrato: any[] = [];
    estadoOptions = [
        { label: 'Programado', value: 'PROGRAMADO' },
        { label: 'En proceso', value: 'EN_PROCESO' },
        { label: 'Completado', value: 'COMPLETADO' },
        { label: 'Cancelado', value: 'CANCELADO' }
    ];
    
    // Dialog de detalle
    showDetalleDialog = false;
    ejecucionDetalle: EjecucionMantenimiento | null = null;
    
    // Dialog de iniciar trabajo
    showIniciarDialog = false;
    iniciarBitacora = '';
    
    // Dialog de completar
    showCompletarDialog = false;
    completarBitacora = '';
    completarObservaciones = '';
    
    // Dialog de cancelar
    showCancelarDialog = false;
    cancelarMotivo = '';
    
    // Evidencias
    showEvidenciasDialog = false;
    evidencias: Evidencia[] = [];
    loadingEvidencias = false;
    uploadProgress = 0;
    uploading = false;
    nuevaDescripcion = '';
    ejecucionEvidenciasId: number | null = null;
    archivosSeleccionados: File[] = [];
    
    // Filtros
    filtroEstado: string = '';
    estadosFiltro = [
        { label: 'Todos los estados', value: '' },
        { label: 'Programado', value: 'PROGRAMADO' },
        { label: 'En proceso', value: 'EN_PROCESO' },
        { label: 'Completado', value: 'COMPLETADO' },
        { label: 'Cancelado', value: 'CANCELADO' }
    ];
    
    cols = [
        { field: 'fechaEjecucion', header: 'Fecha Ejecución' },
        { field: 'proveedorNombre', header: 'Proveedor' },
        { field: 'contratoDescripcion', header: 'Contrato' },
        { field: 'equipoNombre', header: 'Equipo' },
        { field: 'estado', header: 'Estado' },
        { field: 'bitacora', header: 'Bitácora' }
    ];

    // No necesitamos statuses ya que no hay campo estado

    constructor(
        private ejecucionesService: EjecucionesService,
        private contratosService: ContratosService,
        private evidenciasService: EvidenciasService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadEjecuciones();
        this.loadContratos();
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
                        contratoDescripcion: ejecucion.contratoDescripcion,
                        equipoNombre: ejecucion.equipoNombre,
                        bitacora: ejecucion.bitacora
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

    openNew() {
        console.log('openNew() called'); // Debug
        // Validar que contratos estén cargados antes de abrir el diálogo
        if (!this.contratos || this.contratos.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'No hay contratos disponibles. No se puede crear una nueva ejecución.'
            });
            return;
        }
        this.selectedEjecucion = {
            fechaEjecucion: new Date(),
            fechaInicioTrabajo: null,
            fechaCierre: null,
            estado: 'PROGRAMADO',
            bitacora: '',
            idContrato: undefined,
            idEquipo: undefined
        };
        this.isEditMode = false;
        this.showDialog = true;
        console.log('Dialog should be visible:', this.showDialog); // Debug
        this.equiposContrato = [];
        console.log('Contratos disponibles:', this.contratos);
    }

    editEjecucion(ejecucion: EjecucionMantenimiento) {
        this.selectedEjecucion = {
            ...ejecucion,
            fechaEjecucion: this.parseToDate(ejecucion.fechaEjecucion),
            fechaInicioTrabajo: this.parseToDate(ejecucion.fechaInicioTrabajo),
            fechaCierre: this.parseToDate(ejecucion.fechaCierre)
        };
        this.isEditMode = true;
        this.showDialog = true;
        this.onContratoChange();
    }

    deleteEjecucion(ejecucion: EjecucionMantenimiento) {
        const estaFinalizada = ejecucion.estado === 'COMPLETADO' || ejecucion.estado === 'CANCELADO';
        const mensaje = estaFinalizada 
            ? '⚠️ Esta ejecución ya está finalizada. ¿Está seguro de que desea eliminarla? Se eliminarán también todas sus evidencias.'
            : '¿Está seguro de que desea eliminar esta ejecución de mantenimiento? Se eliminarán también todas sus evidencias.';
        
        this.confirmationService.confirm({
            message: mensaje,
            header: estaFinalizada ? 'Eliminar Ejecución Finalizada' : 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
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

    cambiarEstadoRapido(ejecucion: EjecucionMantenimiento, nuevoEstado: 'PROGRAMADO' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO') {
        if (!ejecucion.idEjecucion) {
            return;
        }
        const payload: CambioEstadoRequest = {
            estado: nuevoEstado,
            fechaReferencia: new Date()
        };

        if (nuevoEstado === 'EN_PROCESO') {
            payload.fechaInicio = payload.fechaReferencia;
        }
        if (nuevoEstado === 'COMPLETADO') {
            payload.fechaInicio = this.parseToDate(ejecucion.fechaInicioTrabajo) ?? new Date();
        }

        this.accionLoadingId = ejecucion.idEjecucion;
        this.ejecucionesService.actualizarEstado(ejecucion.idEjecucion, payload).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Estado actualizado',
                    detail: `La ejecución pasó a ${this.getEstadoLabel(nuevoEstado)}`
                });
                this.loadEjecuciones();
            },
            error: (error) => {
                console.error('Error al actualizar estado:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo actualizar el estado'
                });
            },
            complete: () => {
                this.accionLoadingId = null;
            }
        });
    }

    saveEjecucion() {
        if (this.selectedEjecucion.idContrato && this.selectedEjecucion.idEquipo && this.selectedEjecucion.fechaEjecucion) {
            const payload: GuardarEjecucionRequest = {
                idContrato: this.selectedEjecucion.idContrato,
                idEquipo: this.selectedEjecucion.idEquipo,
                idProgramacion: this.selectedEjecucion.idProgramacion,
                usuarioResponsableId: this.selectedEjecucion.usuarioResponsableId,
                fechaEjecucion: this.parseToDate(this.selectedEjecucion.fechaEjecucion) ?? undefined,
                fechaInicioTrabajo: this.parseToDate(this.selectedEjecucion.fechaInicioTrabajo),
                fechaCierre: this.parseToDate(this.selectedEjecucion.fechaCierre),
                estado: this.selectedEjecucion.estado,
                bitacora: this.selectedEjecucion.bitacora
            };

            if (this.isEditMode && this.selectedEjecucion.idEjecucion) {
                this.ejecucionesService.update(this.selectedEjecucion.idEjecucion, payload).subscribe({
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
                this.ejecucionesService.create(payload).subscribe({
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

    parseToDate(date: any): Date | null {
        if (!date) {
            return null;
        }
        if (date instanceof Date) {
            return date;
        }
        const parsed = new Date(date);
        return isNaN(parsed.getTime()) ? null : parsed;
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

    /**
     * Obtiene los equipos asociados al contrato seleccionado
     */
    getEquiposDelContrato(): any[] {
        // Ya no se usa en el template, solo para lógica interna si se requiere
        return this.equiposContrato;
    }

    /**
     * Se ejecuta cuando cambia el contrato seleccionado
     */
    onContratoChange() {
        const equipoAnterior = this.selectedEjecucion.idEquipo;
        // Limpiar equipo seleccionado cuando cambia el contrato
        this.selectedEjecucion.idEquipo = undefined;
        if (!this.selectedEjecucion.idContrato) {
            this.equiposContrato = [];
            return;
        }
        const contrato = this.contratos.find(c => c.idContrato === this.selectedEjecucion.idContrato);
        if (!contrato || !contrato.equipos) {
            this.equiposContrato = [];
            return;
        }
        this.equiposContrato = contrato.equipos.map((contratoEquipo: any) => ({
            idEquipo: contratoEquipo.equipo?.idEquipo || contratoEquipo.idEquipo,
            nombre: contratoEquipo.equipo?.nombre || contratoEquipo.nombre,
            codigoInacif: contratoEquipo.equipo?.codigoInacif || contratoEquipo.codigoInacif,
            ubicacion: contratoEquipo.equipo?.ubicacion || contratoEquipo.ubicacion
        }));
        if (equipoAnterior && this.equiposContrato.some(eq => eq.idEquipo === equipoAnterior)) {
            this.selectedEjecucion.idEquipo = equipoAnterior;
        }
        console.log('Equipos del contrato:', this.equiposContrato);
    }

    // ==================== DETALLE ====================
    
    verDetalle(ejecucion: EjecucionMantenimiento) {
        this.ejecucionDetalle = ejecucion;
        this.showDetalleDialog = true;
    }
    
    hideDetalleDialog() {
        this.showDetalleDialog = false;
        this.ejecucionDetalle = null;
    }
    
    verEvidenciasDesdeDetalle() {
        if (this.ejecucionDetalle) {
            const ejecucion = this.ejecucionDetalle;
            this.hideDetalleDialog();
            this.openEvidencias(ejecucion);
        }
    }
    
    // ==================== INICIAR TRABAJO ====================
    
    abrirIniciarDialog(ejecucion: EjecucionMantenimiento) {
        this.selectedEjecucion = ejecucion;
        this.iniciarBitacora = ejecucion.bitacora || '';
        this.showIniciarDialog = true;
    }
    
    confirmarIniciar() {
        if (!this.selectedEjecucion.idEjecucion) return;
        
        const payload: CambioEstadoRequest = {
            estado: 'EN_PROCESO',
            fechaReferencia: new Date(),
            fechaInicio: new Date(),
            bitacora: this.iniciarBitacora
        };
        
        this.accionLoadingId = this.selectedEjecucion.idEjecucion;
        this.ejecucionesService.actualizarEstado(this.selectedEjecucion.idEjecucion, payload).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Trabajo iniciado',
                    detail: 'El mantenimiento está ahora en proceso'
                });
                this.hideIniciarDialog();
                this.loadEjecuciones();
            },
            error: (error) => {
                console.error('Error al iniciar trabajo:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo iniciar el trabajo'
                });
            },
            complete: () => {
                this.accionLoadingId = null;
            }
        });
    }
    
    hideIniciarDialog() {
        this.showIniciarDialog = false;
        this.iniciarBitacora = '';
    }
    
    // ==================== COMPLETAR ====================
    
    abrirCompletarDialog(ejecucion: EjecucionMantenimiento) {
        this.selectedEjecucion = ejecucion;
        this.completarBitacora = ejecucion.bitacora || '';
        this.completarObservaciones = '';
        this.showCompletarDialog = true;
    }
    
    confirmarCompletar() {
        if (!this.selectedEjecucion.idEjecucion) return;
        
        let bitacoraFinal = this.completarBitacora;
        if (this.completarObservaciones) {
            bitacoraFinal += `\n\n--- CIERRE (${new Date().toLocaleDateString('es-GT')}) ---\n${this.completarObservaciones}`;
        }
        
        const payload: CambioEstadoRequest = {
            estado: 'COMPLETADO',
            fechaReferencia: new Date(),
            fechaInicio: this.parseToDate(this.selectedEjecucion.fechaInicioTrabajo) ?? new Date(),
            bitacora: bitacoraFinal
        };
        
        this.accionLoadingId = this.selectedEjecucion.idEjecucion;
        this.ejecucionesService.actualizarEstado(this.selectedEjecucion.idEjecucion, payload).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Mantenimiento completado',
                    detail: 'El mantenimiento ha sido finalizado exitosamente'
                });
                this.hideCompletarDialog();
                this.loadEjecuciones();
            },
            error: (error) => {
                console.error('Error al completar:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo completar el mantenimiento'
                });
            },
            complete: () => {
                this.accionLoadingId = null;
            }
        });
    }
    
    hideCompletarDialog() {
        this.showCompletarDialog = false;
        this.completarBitacora = '';
        this.completarObservaciones = '';
    }
    
    // ==================== CANCELAR ====================
    
    abrirCancelarDialog(ejecucion: EjecucionMantenimiento) {
        this.selectedEjecucion = ejecucion;
        this.cancelarMotivo = '';
        this.showCancelarDialog = true;
    }
    
    confirmarCancelar() {
        if (!this.selectedEjecucion.idEjecucion || !this.cancelarMotivo.trim()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Motivo requerido',
                detail: 'Debe indicar el motivo de cancelación'
            });
            return;
        }
        
        let bitacoraFinal = this.selectedEjecucion.bitacora || '';
        bitacoraFinal += `\n\n--- CANCELADO (${new Date().toLocaleDateString('es-GT')}) ---\nMotivo: ${this.cancelarMotivo}`;
        
        const payload: CambioEstadoRequest = {
            estado: 'CANCELADO',
            fechaReferencia: new Date(),
            bitacora: bitacoraFinal
        };
        
        this.accionLoadingId = this.selectedEjecucion.idEjecucion;
        this.ejecucionesService.actualizarEstado(this.selectedEjecucion.idEjecucion, payload).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'info',
                    summary: 'Mantenimiento cancelado',
                    detail: 'El mantenimiento ha sido cancelado'
                });
                this.hideCancelarDialog();
                this.loadEjecuciones();
            },
            error: (error) => {
                console.error('Error al cancelar:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo cancelar el mantenimiento'
                });
            },
            complete: () => {
                this.accionLoadingId = null;
            }
        });
    }
    
    hideCancelarDialog() {
        this.showCancelarDialog = false;
        this.cancelarMotivo = '';
    }
    
    // ==================== FILTROS ====================
    
    onFiltroEstadoChange() {
        if (this.filtroEstado) {
            this.dt.filter(this.filtroEstado, 'estado', 'equals');
        } else {
            this.dt.filter('', 'estado', 'contains');
        }
    }
    
    get ejecucionesFiltradas(): EjecucionMantenimiento[] {
        if (!this.filtroEstado) return this.ejecuciones;
        return this.ejecuciones.filter(e => e.estado === this.filtroEstado);
    }
    
    // Contadores por estado para las tarjetas
    get countProgramados(): number {
        return this.ejecuciones.filter(e => e.estado === 'PROGRAMADO').length;
    }
    
    get countEnProceso(): number {
        return this.ejecuciones.filter(e => e.estado === 'EN_PROCESO').length;
    }
    
    get countCompletados(): number {
        return this.ejecuciones.filter(e => e.estado === 'COMPLETADO').length;
    }
    
    get countCancelados(): number {
        return this.ejecuciones.filter(e => e.estado === 'CANCELADO').length;
    }
    
    get countVencidas(): number {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        return this.ejecuciones.filter(e => {
            if (e.estado !== 'PROGRAMADO') return false;
            const fecha = this.parseToDate(e.fechaEjecucion);
            return fecha && fecha < hoy;
        }).length;
    }
    
    setFiltroEstado(estado: string) {
        this.filtroEstado = estado;
        this.onFiltroEstadoChange();
    }
    
    // ==================== UTILIDADES ====================

    getEstadoLabel(estado?: string): string {
        switch (estado) {
            case 'EN_PROCESO':
                return 'En proceso';
            case 'COMPLETADO':
                return 'Completado';
            case 'CANCELADO':
                return 'Cancelado';
            case 'PROGRAMADO':
            default:
                return 'Programado';
        }
    }

    getEstadoSeverity(estado?: string): 'info' | 'success' | 'warning' | 'danger' | 'secondary' {
        switch (estado) {
            case 'EN_PROCESO':
                return 'info';
            case 'COMPLETADO':
                return 'success';
            case 'CANCELADO':
                return 'danger';
            case 'PROGRAMADO':
                return 'warning';
            default:
                return 'secondary';
        }
    }

    getTipoSeverity(tipo?: string): 'info' | 'success' | 'warning' | 'danger' | 'secondary' {
        if (!tipo) return 'secondary';
        const tipoLower = tipo.toLowerCase();
        if (tipoLower.includes('preventivo')) return 'success';
        if (tipoLower.includes('correctivo')) return 'danger';
        if (tipoLower.includes('calibraci')) return 'info';
        return 'secondary';
    }
    
    /**
     * Verifica si una ejecución está vencida (fecha pasada y aún PROGRAMADO)
     */
    isVencida(ejecucion: EjecucionMantenimiento): boolean {
        if (ejecucion.estado !== 'PROGRAMADO') return false;
        const fecha = this.parseToDate(ejecucion.fechaEjecucion);
        if (!fecha) return false;
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        return fecha < hoy;
    }
    
    /**
     * Verifica si una ejecución viene de una programación automática
     */
    tieneProgramacion(ejecucion: EjecucionMantenimiento): boolean {
        return !!ejecucion.idProgramacion;
    }

    puedeIniciar(ejecucion: EjecucionMantenimiento): boolean {
        return ejecucion.estado === 'PROGRAMADO';
    }

    puedeCompletar(ejecucion: EjecucionMantenimiento): boolean {
        return ejecucion.estado === 'EN_PROCESO';
    }

    estaCompletadoOCancelado(ejecucion: EjecucionMantenimiento): boolean {
        return ejecucion.estado === 'COMPLETADO' || ejecucion.estado === 'CANCELADO';
    }

    // ==================== MENÚ DE ACCIONES ====================
    
    openAccionesMenu(event: Event, ejecucion: EjecucionMantenimiento): void {
        this.ejecucionSeleccionadaMenu = ejecucion;
        
        this.accionesMenuItems = [
            {
                label: 'Ver Detalle',
                icon: 'pi pi-eye',
                command: () => this.verDetalle(ejecucion)
            },
            {
                label: 'Evidencias',
                icon: 'pi pi-paperclip',
                command: () => this.openEvidencias(ejecucion)
            },
            { separator: true },
            {
                label: 'Iniciar Trabajo',
                icon: 'pi pi-play',
                visible: this.puedeIniciar(ejecucion),
                command: () => this.abrirIniciarDialog(ejecucion)
            },
            {
                label: 'Completar',
                icon: 'pi pi-check',
                visible: this.puedeCompletar(ejecucion),
                command: () => this.abrirCompletarDialog(ejecucion)
            },
            {
                label: 'Cancelar',
                icon: 'pi pi-times',
                visible: !this.estaCompletadoOCancelado(ejecucion),
                command: () => this.abrirCancelarDialog(ejecucion)
            },
            { separator: true },
            {
                label: 'Editar',
                icon: 'pi pi-pencil',
                command: () => this.editEjecucion(ejecucion)
            },
            {
                label: 'Eliminar',
                icon: 'pi pi-trash',
                styleClass: 'text-red-500',
                command: () => this.deleteEjecucion(ejecucion)
            }
        ];

        this.menuAcciones.toggle(event);
    }

    // ==================== EVIDENCIAS ====================

    openEvidencias(ejecucion: EjecucionMantenimiento) {
        if (!ejecucion.idEjecucion) return;
        this.ejecucionEvidenciasId = ejecucion.idEjecucion;
        this.selectedEjecucion = ejecucion;
        this.showEvidenciasDialog = true;
        this.loadEvidencias();
    }

    loadEvidencias() {
        if (!this.ejecucionEvidenciasId) return;
        this.loadingEvidencias = true;
        this.evidenciasService.getByEjecucion(this.ejecucionEvidenciasId).subscribe({
            next: (data) => {
                this.evidencias = data;
                this.loadingEvidencias = false;
            },
            error: (error) => {
                console.error('Error al cargar evidencias:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudieron cargar las evidencias'
                });
                this.loadingEvidencias = false;
            }
        });
    }

    onNativeFileSelect(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.archivosSeleccionados = Array.from(input.files);
            this.messageService.add({
                severity: 'info',
                summary: 'Archivos seleccionados',
                detail: `${this.archivosSeleccionados.length} archivo(s) listo(s) para subir`
            });
        }
    }

    subirArchivosSeleccionados() {
        if (this.archivosSeleccionados.length === 0 || !this.ejecucionEvidenciasId) return;
        this.uploadFilesSequentially(this.archivosSeleccionados, 0);
    }

    onFileSelect(event: any) {
        const files: FileList = event.files;
        if (!files || files.length === 0 || !this.ejecucionEvidenciasId) return;

        // Convertir FileList a Array para poder procesarlo
        const fileArray = Array.from(files);
        this.uploadFilesSequentially(fileArray, 0);
    }

    uploadFilesSequentially(files: File[], index: number) {
        if (index >= files.length) {
            // Todos los archivos subidos
            this.uploading = false;
            this.uploadProgress = 0;
            this.nuevaDescripcion = '';
            this.archivosSeleccionados = [];
            this.loadEvidencias();
            return;
        }

        const file = files[index];
        this.uploading = true;
        this.uploadProgress = 0;

        this.evidenciasService.upload(this.ejecucionEvidenciasId!, file, this.nuevaDescripcion).subscribe({
            next: (progress: UploadProgress) => {
                if (progress.status === 'progress') {
                    // Calcular progreso total considerando todos los archivos
                    const baseProgress = (index / files.length) * 100;
                    const fileProgress = ((progress.progress || 0) / files.length);
                    this.uploadProgress = Math.round(baseProgress + fileProgress);
                } else if (progress.status === 'complete') {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: `Archivo "${file.name}" subido correctamente`
                    });
                    // Subir siguiente archivo
                    this.uploadFilesSequentially(files, index + 1);
                }
            },
            error: (error) => {
                console.error('Error al subir archivo:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: `No se pudo subir "${file.name}"`
                });
                // Continuar con el siguiente archivo aunque falle uno
                this.uploadFilesSequentially(files, index + 1);
            }
        });
    }

    uploadFile(file: File) {
        if (!this.ejecucionEvidenciasId) return;
        
        this.uploading = true;
        this.uploadProgress = 0;

        this.evidenciasService.upload(this.ejecucionEvidenciasId, file, this.nuevaDescripcion).subscribe({
            next: (progress: UploadProgress) => {
                if (progress.status === 'progress') {
                    this.uploadProgress = progress.progress || 0;
                } else if (progress.status === 'complete') {
                    this.uploading = false;
                    this.uploadProgress = 0;
                    this.nuevaDescripcion = '';
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Evidencia subida correctamente'
                    });
                    this.loadEvidencias();
                }
            },
            error: (error) => {
                console.error('Error al subir archivo:', error);
                this.uploading = false;
                this.uploadProgress = 0;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo subir el archivo'
                });
            }
        });
    }

    deleteEvidencia(evidencia: Evidencia) {
        if (!this.ejecucionEvidenciasId || !evidencia.id) return;

        this.confirmationService.confirm({
            message: `¿Está seguro de eliminar "${evidencia.nombreOriginal}"?`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.evidenciasService.delete(this.ejecucionEvidenciasId!, evidencia.id!).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Evidencia eliminada'
                        });
                        this.loadEvidencias();
                    },
                    error: (error) => {
                        console.error('Error al eliminar evidencia:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'No se pudo eliminar la evidencia'
                        });
                    }
                });
            }
        });
    }

    downloadEvidencia(evidencia: Evidencia) {
        if (!this.ejecucionEvidenciasId || !evidencia.nombreArchivo) return;
        
        console.log('📥 Descargando evidencia:', evidencia.nombreArchivo);
        
        this.evidenciasService.descargarArchivo(this.ejecucionEvidenciasId, evidencia.nombreArchivo).subscribe({
            next: (blob: Blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = evidencia.nombreOriginal || 'archivo';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                
                this.messageService.add({
                    severity: 'success',
                    summary: 'Descarga exitosa',
                    detail: `Archivo ${evidencia.nombreOriginal} descargado`
                });
            },
            error: (error) => {
                console.error('Error al descargar:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo descargar el archivo'
                });
            }
        });
    }

    viewEvidencia(evidencia: Evidencia) {
        // Para ver imágenes, abrimos en nueva pestaña
        if (this.ejecucionEvidenciasId && evidencia.nombreArchivo) {
            const url = `${environment.apiUrl}/ejecuciones-mantenimiento/${this.ejecucionEvidenciasId}/evidencias/download/${evidencia.nombreArchivo}`;
            window.open(url, '_blank');
        }
    }

    getFileIcon(evidencia: Evidencia): string {
        return this.evidenciasService.getFileIcon(evidencia);
    }

    formatFileSize(bytes?: number): string {
        return this.evidenciasService.formatFileSize(bytes);
    }

    isImage(evidencia: Evidencia): boolean {
        return this.evidenciasService.isImage(evidencia);
    }

    hideEvidenciasDialog() {
        this.showEvidenciasDialog = false;
        this.evidencias = [];
        this.ejecucionEvidenciasId = null;
        this.nuevaDescripcion = '';
        this.archivosSeleccionados = [];
        this.uploading = false;
        this.uploadProgress = 0;
    }
}
