import { Component, OnInit } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Table } from 'primeng/table';
import { MantenimientoService, Mantenimiento, Equipo, Proveedor, TipoMantenimiento } from 'src/app/service/mantenimiento.service';

@Component({
    selector: 'app-mantenimientos',
    templateUrl: './mantenimientos.component.html',
    providers: [MessageService, ConfirmationService]
})
export class MantenimientosComponent implements OnInit {

    mantenimientoDialog: boolean = false;
    deleteMantenimientoDialog: boolean = false;
    deleteMantenimientosDialog: boolean = false;
    equiposDialog: boolean = false;

    mantenimientos: Mantenimiento[] = [];
    mantenimiento: Mantenimiento = this.getEmptyMantenimiento();
    selectedMantenimientos: Mantenimiento[] = [];
    equiposSeleccionados: Equipo[] = [];

    equiposDisponibles: Equipo[] = [];
    proveedoresDisponibles: Proveedor[] = [];
    tiposDisponibles: TipoMantenimiento[] = [];

    submitted: boolean = false;
    loading: boolean = false;
    loadingEquipos: boolean = false;

    cols: any[] = [];
    frecuenciaOptions: any[] = [];
    rowsPerPageOptions = [5, 10, 20];

    constructor(
        private mantenimientoService: MantenimientoService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) { }

    ngOnInit() {
        this.loadMantenimientos();
        this.loadCatalogos();
        this.initColumns();
        this.initFrecuenciaOptions();
    }

    /**
     * Cargar todos los mantenimientos
     */
    loadMantenimientos() {
        this.loading = true;
        console.log('[Mantenimientos] Iniciando carga de mantenimientos...');
        
        this.mantenimientoService.getMantenimientos().subscribe({
            next: (data) => {
                console.log('[Mantenimientos] Datos recibidos:', data);
                console.log('[Mantenimientos] Primer mantenimiento:', data[0]);
                if (data[0]) {
                    console.log('[Mantenimientos] Estructura del objeto:', Object.keys(data[0]));
                    console.log('[Mantenimientos] fechaInicio:', data[0].fechaInicio, typeof data[0].fechaInicio);
                    console.log('[Mantenimientos] fechaFin:', data[0].fechaFin, typeof data[0].fechaFin);
                    console.log('[Mantenimientos] equipos:', data[0].equipos);
                    console.log('[Mantenimientos] equiposCompletos:', data[0].equiposCompletos);
                }
                this.mantenimientos = data;
                this.loading = false;
            },
            error: (error) => {
                console.error('[Mantenimientos] Error al cargar:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: `No se pudieron cargar los mantenimientos: ${error.message || error.error?.message || 'Error desconocido'}`
                });
                this.loading = false;
            }
        });
    }

    /**
     * Cargar catálogos necesarios
     */
    loadCatalogos() {
        console.log('[Mantenimientos] Cargando catálogos...');
        
        // Cargar equipos
        this.mantenimientoService.getEquiposDisponibles().subscribe({
            next: (equipos) => {
                console.log('[Mantenimientos] Equipos cargados:', equipos);
                this.equiposDisponibles = equipos;
            },
            error: (error) => {
                console.error('[Mantenimientos] Error cargando equipos:', error);
            }
        });

        // Cargar proveedores
        this.mantenimientoService.getProveedoresDisponibles().subscribe({
            next: (proveedores) => {
                console.log('[Mantenimientos] Proveedores cargados:', proveedores);
                this.proveedoresDisponibles = proveedores;
            },
            error: (error) => {
                console.error('[Mantenimientos] Error cargando proveedores:', error);
            }
        });

        // Cargar tipos de mantenimiento
        this.mantenimientoService.getTiposDisponibles().subscribe({
            next: (tipos) => {
                console.log('[Mantenimientos] Tipos cargados:', tipos);
                this.tiposDisponibles = tipos;
            },
            error: (error) => {
                console.error('[Mantenimientos] Error cargando tipos:', error);
            }
        });
    }

    /**
     * Inicializar columnas de la tabla
     */
    initColumns() {
        this.cols = [
            { field: 'descripcion', header: 'Descripción' },
            { field: 'proveedor.nombre', header: 'Proveedor' },
            { field: 'fechaInicio', header: 'Fecha Inicio' },
            { field: 'fechaFin', header: 'Fecha Fin' },
            { field: 'frecuencia', header: 'Frecuencia' },
            { field: 'equipos', header: 'Equipos' },
            { field: 'estado', header: 'Estado' }
        ];
    }

    /**
     * Inicializar opciones de frecuencia
     */
    initFrecuenciaOptions() {
        this.frecuenciaOptions = [
            { label: 'Mensual', value: 'mensual' },
            { label: 'Bimestral', value: 'bimestral' },
            { label: 'Trimestral', value: 'trimestral' },
            { label: 'Semestral', value: 'semestral' },
            { label: 'Anual', value: 'anual' },
            { label: 'A demanda', value: 'a_demanda' }
        ];
    }

    /**
     * Abrir diálogo para nuevo mantenimiento
     */
    openNew() {
        this.mantenimiento = this.getEmptyMantenimiento();
        this.submitted = false;
        this.mantenimientoDialog = true;
    }

    /**
     * Eliminar mantenimientos seleccionados
     */
    deleteSelectedMantenimientos() {
        this.deleteMantenimientosDialog = true;
    }

    /**
     * Editar mantenimiento
     */
    editMantenimiento(mantenimiento: Mantenimiento) {
        this.mantenimiento = { ...mantenimiento };
        
        // Si el mantenimiento tiene equipos completos del backend, extraer solo los IDs
        if (this.mantenimiento.equiposCompletos && this.mantenimiento.equiposCompletos.length > 0) {
            this.mantenimiento.equipos = this.mantenimiento.equiposCompletos.map(equipo => equipo.idEquipo);
        } else if (!this.mantenimiento.equipos) {
            this.mantenimiento.equipos = [];
        }
        
        this.mantenimientoDialog = true;
    }

    /**
     * Eliminar mantenimiento
     */
    deleteMantenimiento(mantenimiento: Mantenimiento) {
        this.deleteMantenimientoDialog = true;
        this.mantenimiento = { ...mantenimiento };
    }

    /**
     * Confirmar eliminación de mantenimientos seleccionados
     */
    confirmDeleteSelected() {
        this.deleteMantenimientosDialog = false;
        
        const deletePromises = this.selectedMantenimientos.map(mantenimiento => 
            this.mantenimientoService.deleteMantenimiento(mantenimiento.idContrato!).toPromise()
        );

        Promise.all(deletePromises).then(() => {
            this.mantenimientos = this.mantenimientos.filter(val => 
                !this.selectedMantenimientos.includes(val)
            );
            this.selectedMantenimientos = [];
            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Mantenimientos eliminados'
            });
        }).catch((error) => {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al eliminar mantenimientos'
            });
        });
    }

    /**
     * Confirmar eliminación de mantenimiento
     */
    confirmDelete() {
        this.deleteMantenimientoDialog = false;
        
        this.mantenimientoService.deleteMantenimiento(this.mantenimiento.idContrato!).subscribe({
            next: () => {
                this.mantenimientos = this.mantenimientos.filter(val => 
                    val.idContrato !== this.mantenimiento.idContrato
                );
                this.mantenimiento = this.getEmptyMantenimiento();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Mantenimiento eliminado'
                });
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo eliminar el mantenimiento. Puede tener ejecuciones asociadas.'
                });
            }
        });
    }

    /**
     * Ocultar diálogo
     */
    hideDialog() {
        this.mantenimientoDialog = false;
        this.mantenimiento = this.getEmptyMantenimiento();
        this.submitted = false;
    }

    /**
     * Guardar mantenimiento
     */
    saveMantenimiento() {
        this.submitted = true;

        if (this.isValidMantenimiento()) {
            // Preparar el payload para el backend - NO incluir equipos en la creación inicial
            const payload = {
                descripcion: this.mantenimiento.descripcion,
                fechaInicio: this.mantenimiento.fechaInicio,
                fechaFin: this.mantenimiento.fechaFin,
                frecuencia: this.mantenimiento.frecuencia,
                estado: this.mantenimiento.estado,
                proveedor: this.mantenimiento.proveedor
                // NO incluir equipos aquí - se manejarán por separado
            };

            console.log('[Mantenimiento] Payload a enviar:', payload);

            if (this.mantenimiento.idContrato) {
                // Actualizar existente
                this.mantenimientoService.updateMantenimiento(
                    this.mantenimiento.idContrato, 
                    payload
                ).subscribe({
                    next: (updatedMantenimiento) => {
                        // Actualizar en la lista
                        const index = this.findIndexById(this.mantenimiento.idContrato!);
                        if (index !== -1) {
                            this.mantenimientos[index] = updatedMantenimiento;
                        }
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Mantenimiento actualizado'
                        });
                        this.hideDialog();
                    },
                    error: (error) => {
                        console.error('[Mantenimiento] Error al actualizar:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al actualizar mantenimiento'
                        });
                    }
                });
            } else {
                // Crear nuevo
                this.mantenimientoService.createMantenimiento(payload).subscribe({
                    next: (newMantenimiento) => {
                        console.log('[Mantenimiento] Respuesta del backend al crear:', newMantenimiento);
                        console.log('[Mantenimiento] Estructura respuesta:', Object.keys(newMantenimiento));
                        console.log('[Mantenimiento] fechaInicio respuesta:', newMantenimiento.fechaInicio);
                        console.log('[Mantenimiento] fechaFin respuesta:', newMantenimiento.fechaFin);
                        console.log('[Mantenimiento] equipos respuesta:', newMantenimiento.equipos);
                        
                        this.mantenimientos.push(newMantenimiento);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Mantenimiento creado exitosamente'
                        });
                        this.hideDialog();
                        
                        // Recargar la lista para obtener datos completos del backend
                        console.log('[Mantenimiento] Recargando lista...');
                        this.loadMantenimientos();
                    },
                    error: (error) => {
                        console.error('[Mantenimiento] Error al crear:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al crear mantenimiento. Verifique los datos.'
                        });
                    }
                });
            }
        }
    }

    /**
     * Validar mantenimiento
     */
    isValidMantenimiento(): boolean {
        return this.mantenimiento.descripcion && 
               this.mantenimiento.descripcion.trim() !== '' &&
               this.mantenimiento.fechaInicio != null &&
               this.mantenimiento.fechaFin != null &&
               this.mantenimiento.frecuencia && 
               this.mantenimiento.frecuencia.trim() !== '' &&
               this.mantenimiento.proveedor != null;
    }

    /**
     * Encontrar índice por ID
     */
    findIndexById(id: number): number {
        return this.mantenimientos.findIndex(mantenimiento => mantenimiento.idContrato === id);
    }

    /**
     * Obtener mantenimiento vacío
     */
    getEmptyMantenimiento(): Mantenimiento {
        return {
            descripcion: '',
            fechaInicio: new Date(),
            fechaFin: new Date(),
            frecuencia: '',
            estado: true,
            equipos: [] // Array de IDs de equipos seleccionados
        };
    }

    /**
     * Filtro global para la tabla
     */
    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    /**
     * Formatear fecha para mostrar
     */
    formatDate(date: Date | string | null | undefined): string {
        if (!date) return 'Sin fecha';
        
        console.log('[formatDate] Input:', date, 'Tipo:', typeof date);
        
        let d: Date;
        
        if (typeof date === 'string') {
            // Limpiar la cadena de espacios en blanco y sufijos problemáticos
            let cleanDate = date.trim();
            
            // Remover el sufijo [UTC] que puede venir del backend
            if (cleanDate.endsWith('[UTC]')) {
                cleanDate = cleanDate.replace('[UTC]', '');
                console.log('[formatDate] Removido [UTC], nueva fecha:', cleanDate);
            }
            
            // Manejar diferentes formatos de string de fecha
            if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
                // Formato YYYY-MM-DD
                d = new Date(cleanDate + 'T00:00:00');
            } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(cleanDate)) {
                // Formato ISO completo (con o sin Z)
                d = new Date(cleanDate);
            } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(cleanDate)) {
                // Formato DD/MM/YYYY
                const parts = cleanDate.split('/');
                d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            } else if (/^\d{2}-\d{2}-\d{4}$/.test(cleanDate)) {
                // Formato DD-MM-YYYY
                const parts = cleanDate.split('-');
                d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(cleanDate)) {
                // Formato D/M/YYYY o DD/M/YYYY
                const parts = cleanDate.split('/');
                d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            } else if (/^\d{4}\/\d{2}\/\d{2}$/.test(cleanDate)) {
                // Formato YYYY/MM/DD
                const parts = cleanDate.split('/');
                d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            } else if (/^\[object Date\]$/.test(cleanDate)) {
                // Si es un objeto Date serializado mal
                console.warn('[formatDate] Fecha serializada incorrectamente:', cleanDate);
                return 'Error de formato';
            } else {
                // Intentar parsearlo directamente
                d = new Date(cleanDate);
            }
        } else if (date instanceof Date) {
            d = date;
        } else if (typeof date === 'number') {
            // Si es un timestamp
            d = new Date(date);
        } else if (date && typeof date === 'object') {
            // Si es un objeto con propiedades de fecha
            console.warn('[formatDate] Objeto fecha no estándar:', date);
            if ((date as any).time) {
                d = new Date((date as any).time);
            } else if ((date as any).year && (date as any).month && (date as any).day) {
                d = new Date((date as any).year, (date as any).month - 1, (date as any).day);
            } else {
                return 'Formato no reconocido';
            }
        } else {
            console.warn('[formatDate] Tipo de fecha no reconocido:', typeof date, date);
            return 'Tipo inválido';
        }
        
        console.log('[formatDate] Fecha parseada:', d, 'Valid:', !isNaN(d.getTime()));
        
        if (isNaN(d.getTime())) {
            console.warn('[formatDate] Fecha inválida después del parseo:', date);
            return 'Error al procesar';
        }
        
        return d.toLocaleDateString('es-GT', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    /**
     * Obtener texto de estado
     */
    getEstadoText(estado: boolean): string {
        return estado ? 'Activo' : 'Inactivo';
    }

    /**
     * Obtener severidad para el estado
     */
    getEstadoSeverity(estado: boolean): string {
        return estado ? 'success' : 'danger';
    }

    /**
     * Obtener nombres de equipos asociados al mantenimiento
     */
    getEquiposNames(mantenimiento: Mantenimiento): string {
        if (mantenimiento.equiposCompletos && mantenimiento.equiposCompletos.length > 0) {
            // Si tiene equipos completos del backend, usar esos nombres
            return mantenimiento.equiposCompletos.map(equipo => equipo.nombre).join(', ');
        } else if (mantenimiento.equipos && mantenimiento.equipos.length > 0) {
            // Si solo tiene IDs, buscar los nombres en equiposDisponibles
            const nombres = mantenimiento.equipos.map(idEquipo => {
                const equipo = this.equiposDisponibles.find(e => e.idEquipo === idEquipo);
                return equipo ? equipo.nombre : `ID: ${idEquipo}`;
            });
            return nombres.join(', ');
        } else if ((mantenimiento as any).contratoEquipos && (mantenimiento as any).contratoEquipos.length > 0) {
            // Si viene como contratoEquipos
            return (mantenimiento as any).contratoEquipos.map((ce: any) => 
                ce.equipo?.nombre || ce.nombre || 'Equipo sin nombre'
            ).join(', ');
        } else if ((mantenimiento as any).equiposAsociados && (mantenimiento as any).equiposAsociados.length > 0) {
            // Si viene como equiposAsociados
            return (mantenimiento as any).equiposAsociados.map((ea: any) => 
                ea.nombre || ea.equipo?.nombre || 'Equipo sin nombre'
            ).join(', ');
        } else if ((mantenimiento as any).listaEquipos && (mantenimiento as any).listaEquipos.length > 0) {
            // Si viene como listaEquipos
            return (mantenimiento as any).listaEquipos.map((le: any) => 
                le.nombre || le.equipo?.nombre || 'Equipo sin nombre'
            ).join(', ');
        }
        return '';
    }

    /**
     * Verificar si el mantenimiento tiene equipos
     */
    hasEquipos(mantenimiento: Mantenimiento): boolean {
        // TEMPORAL: Como el backend no está enviando equipos por la configuración LAZY,
        // vamos a mostrar siempre un botón que permita buscar/ver equipos
        // TODO: Cuando el backend se configure con EAGER o endpoint específico, usar la lógica original
        return true; // Siempre mostrar el botón de equipos para que el usuario pueda ver/agregar
    }

    /**
     * Obtener el número de equipos asociados
     */
    getEquiposCount(mantenimiento: Mantenimiento): number {
        if (mantenimiento.equiposCompletos && mantenimiento.equiposCompletos.length > 0) {
            return mantenimiento.equiposCompletos.length;
        } else if (mantenimiento.equipos && mantenimiento.equipos.length > 0) {
            return mantenimiento.equipos.length;
        } else if ((mantenimiento as any).contratoEquipos && (mantenimiento as any).contratoEquipos.length > 0) {
            return (mantenimiento as any).contratoEquipos.length;
        } else if ((mantenimiento as any).equiposAsociados && (mantenimiento as any).equiposAsociados.length > 0) {
            return (mantenimiento as any).equiposAsociados.length;
        } else if ((mantenimiento as any).listaEquipos && (mantenimiento as any).listaEquipos.length > 0) {
            return (mantenimiento as any).listaEquipos.length;
        }
        // Retornar 0 pero mostrar como "Ver" en lugar de "0 equipos"
        return 0;
    }

    /**
     * Obtener texto para el botón de equipos - SIEMPRE "Ver equipos"
     */
    getEquiposButtonText(mantenimiento: Mantenimiento): string {
        return 'Ver equipos';
    }

    /**
     * Ver equipos asociados al mantenimiento
     */
    verEquipos(mantenimiento: Mantenimiento) {
        console.log('[verEquipos] Iniciando para contrato:', mantenimiento.idContrato, mantenimiento.descripcion);
        
        // Guardar referencia del mantenimiento actual para el modal
        this.mantenimiento = { ...mantenimiento };
        
        // Abrir el modal inmediatamente
        this.equiposDialog = true;
        
        // Intentar usar equipos ya cargados primero
        if (mantenimiento.equiposCompletos && mantenimiento.equiposCompletos.length > 0) {
            // Si ya tiene los equipos completos del backend
            console.log('[verEquipos] Usando equiposCompletos:', mantenimiento.equiposCompletos);
            this.equiposSeleccionados = [...mantenimiento.equiposCompletos];
        } else if (mantenimiento.equipos && mantenimiento.equipos.length > 0) {
            // Si solo tiene IDs, buscar los objetos completos
            console.log('[verEquipos] Buscando equipos por IDs:', mantenimiento.equipos);
            this.equiposSeleccionados = mantenimiento.equipos.map(idEquipo => {
                return this.equiposDisponibles.find(e => e.idEquipo === idEquipo);
            }).filter(equipo => equipo !== undefined) as Equipo[];
        } else {
            // No hay equipos en el objeto - consultar al backend directamente
            console.log('[verEquipos] Consultando equipos al backend para contrato:', mantenimiento.idContrato);
            this.equiposSeleccionados = []; // Limpiar primero
            this.loadingEquipos = true; // Activar loading
            
            if (mantenimiento.idContrato) {
                this.mantenimientoService.getEquiposByContrato(mantenimiento.idContrato).subscribe({
                    next: (equipos) => {
                        console.log('[verEquipos] Equipos recibidos del backend:', equipos);
                        this.equiposSeleccionados = equipos;
                        this.loadingEquipos = false;
                        
                        // Actualizar también el objeto mantenimiento para futuras consultas
                        this.mantenimiento.equiposCompletos = equipos;
                    },
                    error: (error) => {
                        console.error('[verEquipos] Error al cargar equipos:', error);
                        this.equiposSeleccionados = [];
                        this.loadingEquipos = false;
                        
                        // Mostrar mensaje informativo
                        this.messageService.add({
                            severity: 'info',
                            summary: 'Información',
                            detail: 'No se pudieron cargar los equipos asociados o no hay equipos para este contrato.'
                        });
                    }
                });
            } else {
                console.warn('[verEquipos] No hay ID de contrato para consultar equipos');
                this.equiposSeleccionados = [];
                this.loadingEquipos = false;
            }
        }
        
        console.log('[verEquipos] Modal abierto, equipos iniciales:', this.equiposSeleccionados);
    }

    /**
     * Exportar mantenimientos
     */
    exportMantenimientos() {
        // Implementar funcionalidad de exportación
        this.messageService.add({
            severity: 'info',
            summary: 'Exportación',
            detail: 'Funcionalidad de exportación pendiente de implementar'
        });
    }
}
