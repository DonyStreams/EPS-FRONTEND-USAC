import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import { Table } from 'primeng/table';
import { Menu } from 'primeng/menu';
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
    proveedorNombre?: string;
    fechaInicio: Date;
    fechaFin: Date;
    estado?: string;
    proveedor?: {
        nombre?: string;
    };
    // Propiedades para edición
    esContratoActual?: boolean;
    noVigente?: boolean;
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
        vencidasFecha: 0,
        contratosVencidos: 0
    };

    // Modal crear/editar
    displayDialog: boolean = false;
    displayDetailDialog: boolean = false;
    displayReprogramarDialog: boolean = false;
    isEditing: boolean = false;
    programacion: ProgramacionMantenimiento = this.initializeProgramacion();
    
    // Variables para reprogramar
    reprogramarData: {
        programacion: ProgramacionMantenimiento | null;
        nuevaFecha: Date | null;
        motivo: string;
    } = {
        programacion: null,
        nuevaFecha: null,
        motivo: ''
    };

    // Listas para dropdowns
    equipos: Equipo[] = [];
    tiposMantenimiento: TipoMantenimiento[] = [];
    contratosDisponibles: Contrato[] = [];
    
    // Menú de acciones
    @ViewChild('menuAcciones') menuAcciones!: Menu;
    @ViewChild('dt') tabla!: Table;
    accionesMenuItems: MenuItem[] = [];
    programacionSeleccionadaMenu: ProgramacionMantenimiento | null = null;

    // Filtro por equipo y tipo desde queryParams
    filtroEquipoId: number | null = null;
    filtroEquipoNombre: string | null = null;
    filtroTipoMantenimientoId: number | null = null;
    filtroTipoMantenimientoNombre: string | null = null;
    filtroProgramacionId: number | null = null;

    // Opciones de frecuencia para dropdown
    frecuenciaOpciones = [
        { label: 'Único (sin frecuencia)', value: 0 },
        { label: 'Semanal (7 días)', value: 7 },
        { label: 'Quincenal (15 días)', value: 15 },
        { label: 'Mensual (30 días)', value: 30 },
        { label: 'Bimestral (60 días)', value: 60 },
        { label: 'Trimestral (90 días)', value: 90 },
        { label: 'Cuatrimestral (120 días)', value: 120 },
        { label: 'Semestral (180 días)', value: 180 },
        { label: 'Anual (365 días)', value: 365 },
        { label: 'Personalizado...', value: -1 }
    ];
    esUnico: boolean = false;
    frecuenciaPersonalizada: boolean = false;

    constructor(
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private http: HttpClient,
        private programacionesService: ProgramacionesService,
        private cdr: ChangeDetectorRef,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit() {
        // Verificar si hay filtro por equipo y tipo en los queryParams
        this.route.queryParams.subscribe(params => {
            if (params['equipoId']) {
                this.filtroEquipoId = +params['equipoId'];
                this.filtroEquipoNombre = params['equipoNombre'] || null;
                console.log('🔍 Filtro por equipo:', this.filtroEquipoId, this.filtroEquipoNombre);
            } else {
                this.filtroEquipoId = null;
                this.filtroEquipoNombre = null;
            }
            if (params['tipoMantenimiento']) {
                this.filtroTipoMantenimientoId = +params['tipoMantenimiento'];
                // Buscar el nombre del tipo si está en la lista
                const tipo = this.tiposMantenimiento.find(t => t.idTipo === this.filtroTipoMantenimientoId);
                this.filtroTipoMantenimientoNombre = tipo ? tipo.nombre : null;
                console.log('🔍 Filtro por tipo:', this.filtroTipoMantenimientoId, this.filtroTipoMantenimientoNombre);
            } else {
                this.filtroTipoMantenimientoId = null;
                this.filtroTipoMantenimientoNombre = null;
            }
            if (params['idProgramacion']) {
                this.filtroProgramacionId = +params['idProgramacion'];
                console.log('🔍 Filtro por programación ID:', this.filtroProgramacionId);
            } else {
                this.filtroProgramacionId = null;
            }
            // Si viene desde el calendario con nuevaProgramacion=true
            if (params['nuevaProgramacion'] === 'true') {
                console.log('📅 Nueva programación desde calendario');
                // Esperar a que se carguen los datos antes de abrir el diálogo
                setTimeout(() => {
                    this.openNewFromCalendar(params['fechaProximoMantenimiento']);
                }, 500);
            }
        });
        
        this.loadProgramaciones();
        this.loadEquipos();
        this.loadTiposMantenimiento();
    }

    /**
     * Abre el diálogo de nueva programación con fecha pre-llenada desde el calendario
     */
    openNewFromCalendar(fechaStr?: string): void {
        this.programacion = this.initializeProgramacion();
        this.isEditing = false;
        this.frecuenciaPersonalizada = false;
        this.esUnico = true;
        
        // Pre-llenar la fecha si viene del calendario
        if (fechaStr) {
            // Parsear fecha en zona local (YYYY-MM-DD)
            const [year, month, day] = fechaStr.split('-').map(Number);
            const fecha = new Date(year, month - 1, day, 12, 0, 0); // Usar mediodía para evitar problemas de zona horaria
            this.programacion.fechaProximoMantenimiento = fecha;
            console.log('📅 Fecha pre-llenada:', fecha, 'desde string:', fechaStr);
        }
        
        this.displayDialog = true;
        this.loadAllContratos();
        
        // Limpiar los queryParams de la URL
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {},
            replaceUrl: true
        });
        
        this.messageService.add({
            severity: 'info',
            summary: 'Nueva Programación',
            detail: fechaStr 
                ? `Fecha seleccionada: ${new Date(Number(fechaStr.split('-')[0]), Number(fechaStr.split('-')[1]) - 1, Number(fechaStr.split('-')[2])).toLocaleDateString('es-GT')}` 
                : 'Complete los datos de la programación',
            life: 3000
        });
    }

    /**
     * Limpia el filtro por equipo
     */
    limpiarFiltroEquipo(): void {
        this.filtroEquipoId = null;
        this.filtroEquipoNombre = null;
        this.filtroTipoMantenimientoId = null;
        this.filtroTipoMantenimientoNombre = null;
        this.filtroProgramacionId = null;
        // Actualizar la URL sin el queryParam
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {}
        });
        // Recargar todas las programaciones
        this.loadProgramaciones();
    }

    /**
     * Obtiene las programaciones filtradas
     */
    get programacionesFiltradas(): ProgramacionMantenimiento[] {
        let filtradas = this.programaciones;
        if (this.filtroProgramacionId) {
            // Si hay filtro por ID, mostrar solo esa programación
            filtradas = filtradas.filter(p => p.idProgramacion === this.filtroProgramacionId);
        } else {
            // Si no hay filtro por ID, aplicar filtros normales
            if (this.filtroEquipoId) {
                filtradas = filtradas.filter(p => 
                    p.equipoId === this.filtroEquipoId || p.equipo?.idEquipo === this.filtroEquipoId
                );
            }
            if (this.filtroTipoMantenimientoId) {
                filtradas = filtradas.filter(p => 
                    p.tipoMantenimientoId === this.filtroTipoMantenimientoId || p.tipoMantenimiento?.idTipo === this.filtroTipoMantenimientoId
                );
            }
        }
        return filtradas;
    }

    /**
     * Inicializa una programación vacía
     */
    initializeProgramacion(): ProgramacionMantenimiento {
        return {
            equipoId: 0,
            tipoMantenimientoId: 0,
            contratoId: 0,
            frecuenciaDias: 0,  // Por defecto: único (sin frecuencia)
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

        this.http.get<any[]>(`${this.API_URL}/programaciones`).subscribe({
            next: (data) => {
                console.log('📋 Programaciones cargadas (raw):', data);
                
                // Convertir las fechas del formato backend a Date y asegurar estructura
                this.programaciones = data.map(prog => ({
                    idProgramacion: prog.idProgramacion,
                    equipoId: prog.equipo?.idEquipo || prog.equipoId,
                    tipoMantenimientoId: prog.tipoMantenimiento?.idTipo || prog.tipoMantenimientoId,
                    contratoId: prog.contrato?.idContrato || prog.contratoId,
                    frecuenciaDias: prog.frecuenciaDias,
                    diasAlertaPrevia: prog.diasAlertaPrevia,
                    activa: prog.activa,
                    observaciones: prog.observaciones,
                    fechaUltimoMantenimiento: this.parseBackendDate(prog.fechaUltimoMantenimiento),
                    fechaProximoMantenimiento: this.parseBackendDate(prog.fechaProximoMantenimiento),
                    // Mantener objetos anidados para mostrar en tabla y detalle
                    equipo: prog.equipo || {
                        idEquipo: prog.equipoId,
                        nombre: prog.equipoNombre,
                        codigoInacif: prog.equipoCodigo,
                        ubicacion: prog.equipoUbicacion
                    },
                    tipoMantenimiento: prog.tipoMantenimiento || {
                        idTipo: prog.tipoMantenimientoId,
                        nombre: prog.tipoMantenimientoNombre
                    },
                    contrato: prog.contrato || {
                        idContrato: prog.contratoId,
                        descripcion: prog.contratoDescripcion,
                        proveedor: {
                            nombre: prog.proveedorNombre
                        }
                    }
                }));
                
                console.log('📋 Programaciones procesadas:', this.programaciones);
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
     * Carga los tipos de mantenimiento activos
     */
    loadTiposMantenimiento(): void {
        this.http.get<TipoMantenimiento[]>(`${this.API_URL}/tipos-mantenimiento/activos`).subscribe({
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
                this.contratosDisponibles = data.map(contrato => {
                    const nombreProveedor = contrato.proveedorNombre || contrato.proveedor?.nombre || 'Sin proveedor';
                    return {
                        idContrato: contrato.idContrato,
                        descripcion: contrato.descripcion,
                        descripcionCompleta: contrato.descripcionCompleta || `${contrato.descripcion} - ${nombreProveedor}`,
                        fechaInicio: new Date(contrato.fechaInicio),
                        fechaFin: new Date(contrato.fechaFin),
                        estado: contrato.estado,
                        proveedorNombre: nombreProveedor,
                        proveedor: {
                            nombre: nombreProveedor
                        }
                    };
                });

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
            console.log('⚠️ No hay equipoId o tipoMantenimientoId, cargando todos los contratos...');
            this.loadAllContratos();
            return;
        }

        console.log('🔍 Buscando contratos para equipoId:', this.programacion.equipoId, 'tipoId:', this.programacion.tipoMantenimientoId);

        // Guardar el contratoId actual para asegurarse de que esté en la lista
        const contratoIdActual = this.programacion.contratoId;

        // Usar el servicio de programaciones que ya corregimos
        this.programacionesService.getContratosDisponibles(
            this.programacion.equipoId,
            this.programacion.tipoMantenimientoId
        ).subscribe({
            next: (data) => {
                // Mapear datos de forma consistente, manejando ambas estructuras posibles
                this.contratosDisponibles = data.map((contrato: any) => {
                    const nombreProveedor = contrato.proveedorNombre || contrato.proveedor?.nombre || 'Sin proveedor';
                    return {
                        ...contrato,
                        descripcionCompleta: `${contrato.descripcion} - ${nombreProveedor}`,
                        proveedorNombre: nombreProveedor,
                        proveedor: {
                            nombre: nombreProveedor
                        }
                    };
                });
                console.log('✅ Contratos vigentes obtenidos:', this.contratosDisponibles);
                
                // Si el contrato actual no está en la lista, cargarlo
                if (contratoIdActual && !this.contratosDisponibles.find(c => c.idContrato === contratoIdActual)) {
                    console.log('⚠️ Contrato actual no está en la lista, cargando todos...');
                    this.loadAllContratos();
                }
            },
            error: (error) => {
                console.error('❌ Error cargando contratos vigentes:', error);
                // Si falla, cargar todos los contratos como fallback
                this.loadAllContratos();
            }
        });
    }

    /**
     * Calcula las estadísticas del dashboard
     */
    calculateStats(): void {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sevenDaysFromNow = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000));

        this.stats = {
            total: this.programaciones.length,
            activas: this.programaciones.filter(p => p.activa).length,
            proximas: this.programaciones.filter(p =>
                p.activa &&
                p.fechaProximoMantenimiento &&
                new Date(p.fechaProximoMantenimiento) <= sevenDaysFromNow &&
                new Date(p.fechaProximoMantenimiento) >= today
            ).length,
            vencidasFecha: this.programaciones.filter(p =>
                p.activa &&
                p.fechaProximoMantenimiento &&
                new Date(p.fechaProximoMantenimiento) < today
            ).length,
            contratosVencidos: this.programaciones.filter(p => 
                p.activa && this.isContratoVencido(p)
            ).length
        };
    }

    /**
     * Abre el diálogo para crear nueva programación
     */
    openNew(): void {
        this.programacion = this.initializeProgramacion();
        this.isEditing = false;
        this.frecuenciaPersonalizada = false;
        this.esUnico = true;  // Por defecto: único (sin frecuencia)
        this.displayDialog = true;

        // 🚨 CARGAR CONTRATOS CUANDO SE ABRE EL DIÁLOGO
        console.log('🔄 Cargando contratos al abrir diálogo...');
        this.loadAllContratos();
    }

    /**
     * Abre el diálogo para editar programación
     */
    editProgramacion(programacion: ProgramacionMantenimiento): void {
        console.log('📝 Editando programación:', programacion);
        
        // Extraer los IDs de los objetos anidados para los dropdowns
        this.programacion = {
            ...programacion,
            equipoId: programacion.equipo?.idEquipo || programacion.equipoId || 0,
            tipoMantenimientoId: programacion.tipoMantenimiento?.idTipo || programacion.tipoMantenimientoId || 0,
            contratoId: programacion.contrato?.idContrato || programacion.contratoId || 0,
            // Usar !== undefined para permitir 0 (programación única)
            frecuenciaDias: programacion.frecuenciaDias !== undefined && programacion.frecuenciaDias !== null 
                ? programacion.frecuenciaDias : 30,
            diasAlertaPrevia: programacion.diasAlertaPrevia || 7,
            activa: programacion.activa !== undefined ? programacion.activa : true,
            observaciones: programacion.observaciones || '',
            fechaUltimoMantenimiento: this.parseBackendDate(programacion.fechaUltimoMantenimiento),
            fechaProximoMantenimiento: this.parseBackendDate(programacion.fechaProximoMantenimiento)
        };
        
        console.log('📋 Programación preparada para edición:', this.programacion);
        
        // Detectar si la frecuencia es única (0) o personalizada (no está en las opciones predefinidas)
        const frecuenciasPredefinidas = [0, 7, 15, 30, 60, 90, 120, 180, 365];
        this.esUnico = this.programacion.frecuenciaDias === 0;
        this.frecuenciaPersonalizada = !this.esUnico && !frecuenciasPredefinidas.includes(this.programacion.frecuenciaDias);
        
        this.isEditing = true;
        this.displayDialog = true;
        
        // Cargar contratos incluyendo el contrato actual (aunque no esté vigente)
        this.loadContratosParaEdicion(programacion);
    }

    /**
     * Carga contratos para edición, incluyendo el contrato actual aunque no esté vigente
     */
    loadContratosParaEdicion(programacion: ProgramacionMantenimiento): void {
        const contratoActual = programacion.contrato;
        const contratoIdActual = contratoActual?.idContrato || programacion.contratoId;
        
        console.log('🔍 Cargando contratos para edición. Contrato actual:', contratoIdActual);

        // Primero cargar contratos vigentes
        this.programacionesService.getContratosDisponibles(
            this.programacion.equipoId,
            this.programacion.tipoMantenimientoId
        ).subscribe({
            next: (data) => {
                this.contratosDisponibles = data.map((contrato: any) => {
                    const nombreProveedor = contrato.proveedorNombre || contrato.proveedor?.nombre || 'Sin proveedor';
                    return {
                        ...contrato,
                        descripcionCompleta: `${contrato.descripcion} - ${nombreProveedor}`,
                        proveedorNombre: nombreProveedor,
                        proveedor: {
                            nombre: nombreProveedor
                        },
                        esContratoActual: false,
                        noVigente: false
                    };
                });
                
                // Verificar si el contrato actual está en la lista
                const contratoEnLista = this.contratosDisponibles.find(c => c.idContrato === contratoIdActual);
                
                if (!contratoEnLista && contratoActual) {
                    // El contrato actual NO está vigente, añadirlo a la lista marcado como no vigente
                    console.log('⚠️ Contrato actual no vigente, añadiéndolo a la lista');
                    
                    const nombreProveedorActual = (contratoActual as any).proveedorNombre || contratoActual.proveedor?.nombre || 'Sin proveedor';
                    const contratoNoVigente: any = {
                        idContrato: contratoActual.idContrato,
                        descripcion: contratoActual.descripcion || 'Contrato anterior',
                        descripcionCompleta: `⚠️ ${contratoActual.descripcion || 'Contrato anterior'} - ${nombreProveedorActual} (NO VIGENTE)`,
                        proveedorNombre: nombreProveedorActual,
                        fechaInicio: contratoActual.fechaInicio,
                        fechaFin: contratoActual.fechaFin,
                        proveedor: {
                            nombre: nombreProveedorActual
                        },
                        esContratoActual: true,
                        noVigente: true
                    };
                    
                    // Añadir al inicio de la lista
                    this.contratosDisponibles.unshift(contratoNoVigente);
                    
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Contrato no vigente',
                        detail: 'El contrato asignado ya no está vigente. Considere seleccionar uno nuevo.',
                        life: 5000
                    });
                } else if (contratoEnLista) {
                    // Marcar el contrato actual
                    contratoEnLista.esContratoActual = true;
                }
                
                console.log('✅ Contratos disponibles para edición:', this.contratosDisponibles);
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('❌ Error cargando contratos:', error);
                // Si falla, al menos mostrar el contrato actual
                if (contratoActual) {
                    this.contratosDisponibles = [{
                        idContrato: contratoActual.idContrato,
                        descripcion: contratoActual.descripcion || 'Contrato actual',
                        descripcionCompleta: `${contratoActual.descripcion || 'Contrato actual'} - ${contratoActual.proveedor?.nombre || 'Sin proveedor'}`,
                        proveedorNombre: contratoActual.proveedor?.nombre || 'Sin proveedor',
                        fechaInicio: contratoActual.fechaInicio,
                        fechaFin: contratoActual.fechaFin,
                        proveedor: contratoActual.proveedor,
                        esContratoActual: true,
                        noVigente: true
                    } as any];
                } else {
                    this.loadAllContratos();
                }
            }
        });
    }

    /**
     * Muestra el detalle de una programación
     */
    verDetalle(programacion: ProgramacionMantenimiento): void {
        console.log('👁️ Ver detalle de programación:', programacion);
        this.selectedProgramacion = {
            ...programacion,
            fechaUltimoMantenimiento: this.parseBackendDate(programacion.fechaUltimoMantenimiento),
            fechaProximoMantenimiento: this.parseBackendDate(programacion.fechaProximoMantenimiento)
        };
        this.displayDetailDialog = true;
    }

    /**
     * Oculta el diálogo
     */
    hideDialog(): void {
        this.displayDialog = false;
        this.programacion = this.initializeProgramacion();
        this.contratosDisponibles = [];
        this.esUnico = false;
        this.frecuenciaPersonalizada = false;
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
            (this.programacion.frecuenciaDias !== undefined && this.programacion.frecuenciaDias !== null && this.programacion.frecuenciaDias >= 0) &&
            this.programacion.diasAlertaPrevia
        );
    }

    /**
     * Se ejecuta cuando cambia el equipo seleccionado
     */
    onEquipoChange(): void {
        // Solo limpiar el contrato si estamos creando una nueva programación
        // En modo edición, el usuario debe decidir si cambiar el contrato
        if (!this.isEditing) {
            this.programacion.contratoId = 0;
        }
        this.loadContratosDisponibles();
    }

    /**
     * Se ejecuta cuando cambia el tipo de mantenimiento
     */
    onTipoChange(): void {
        // Solo limpiar el contrato si estamos creando una nueva programación
        // En modo edición, el usuario debe decidir si cambiar el contrato
        if (!this.isEditing) {
            this.programacion.contratoId = 0;
        }
        this.loadContratosDisponibles();
    }

    /**
     * Calcula la próxima fecha de mantenimiento
     */
    calcularProximaFecha(): void {
        // Si es único (frecuencia 0), no recalcular la fecha - el usuario la define manualmente
        if (this.esUnico || this.programacion.frecuenciaDias === 0) {
            console.log('📅 Programación única - fecha definida manualmente');
            return;
        }

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
     * Maneja el cambio de frecuencia desde el dropdown
     */
    onFrecuenciaChange(event: any): void {
        const valor = event.value;
        
        if (valor === 0) {
            // Seleccionó "Único (sin frecuencia)"
            this.esUnico = true;
            this.frecuenciaPersonalizada = false;
            this.programacion.frecuenciaDias = 0;
            // Para programaciones únicas, mantener la fecha que el usuario seleccione manualmente
            if (!this.programacion.fechaProximoMantenimiento) {
                this.programacion.fechaProximoMantenimiento = new Date();
            }
        } else if (valor === -1) {
            // Seleccionó "Personalizado"
            this.esUnico = false;
            this.frecuenciaPersonalizada = true;
            this.programacion.frecuenciaDias = 30; // Valor por defecto
            this.calcularProximaFecha();
        } else {
            this.esUnico = false;
            this.frecuenciaPersonalizada = false;
            this.programacion.frecuenciaDias = valor;
            this.calcularProximaFecha();
        }
    }

    /**
     * Establece una frecuencia predefinida y recalcula la próxima fecha
     */
    setFrecuencia(dias: number): void {
        this.programacion.frecuenciaDias = dias;
        this.frecuenciaPersonalizada = false;
        this.calcularProximaFecha();
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
                    next: (response) => {
                        console.log('📝 Respuesta crearMantenimiento:', response);
                        const idEjecucion = response?.idEjecucion || response?.id;
                        console.log('🆔 ID Ejecución obtenido:', idEjecucion);
                        const equipoNombre = programacion.equipo?.nombre || 'el equipo';
                        
                        this.messageService.add({
                            severity: 'success',
                            summary: '✓ Ejecución Creada',
                            detail: `Se generó exitosamente la ejecución para ${equipoNombre}`,
                            life: 3000,
                            sticky: false
                        });
                        
                        // Mostrar dialog de confirmación para navegar (inmediatamente)
                        setTimeout(() => {
                            this.confirmationService.confirm({
                                message: `<div class="p-3">
                                    <p class="text-lg mb-3">✓ Ejecución de mantenimiento creada exitosamente</p>
                                    <p class="text-600 mb-2"><strong>Equipo:</strong> ${equipoNombre}</p>
                                    <p class="text-600">¿Deseas ver los detalles de la ejecución ahora?</p>
                                </div>`,
                                header: 'Ejecución Creada',
                                icon: 'pi pi-check-circle',
                                acceptLabel: 'Ver Ejecución',
                                rejectLabel: 'Cerrar',
                                acceptButtonStyleClass: 'p-button-success',
                                rejectButtonStyleClass: 'p-button-text',
                                accept: () => {
                                    if (idEjecucion) {
                                        this.router.navigate(['/administracion/ejecuciones'], { 
                                            queryParams: { idEjecucion: idEjecucion } 
                                        });
                                    } else {
                                        this.router.navigate(['/administracion/ejecuciones']);
                                    }
                                }
                            });
                        }, 500);
                        
                        this.loadProgramaciones();
                    },
                    error: (error) => {
                        console.error('❌ Error creando ejecucion:', error);
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
     * Descartar/Saltar una programación vencida y avanzar a la siguiente fecha.
     * Similar al comportamiento de "Descartar" en Outlook para eventos recurrentes.
     */
    descartarProgramacion(programacion: ProgramacionMantenimiento): void {
        if (!programacion.idProgramacion) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'La programación seleccionada no tiene un identificador válido'
            });
            return;
        }

        const fechaActual = programacion.fechaProximoMantenimiento 
            ? new Date(programacion.fechaProximoMantenimiento).toLocaleDateString('es-GT')
            : 'N/A';

        this.confirmationService.confirm({
            message: `<div class="mb-3">
                <p><strong>Equipo:</strong> ${programacion.equipo?.nombre || 'N/A'}</p>
                <p><strong>Fecha programada:</strong> ${fechaActual} <span class="text-red-500">(VENCIDA)</span></p>
                <p class="mt-3">¿Descartar este mantenimiento y avanzar a la siguiente fecha según la frecuencia (${programacion.frecuenciaDias} días)?</p>
                <p class="text-500 text-sm mt-2"><i class="pi pi-info-circle mr-1"></i>Esta acción quedará registrada en el historial.</p>
            </div>`,
            header: 'Descartar Mantenimiento Vencido',
            icon: 'pi pi-forward',
            acceptLabel: 'Descartar y Avanzar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.loading = true;
                const motivo = 'Descartado manualmente - no se ejecutó en fecha programada';
                
                this.programacionesService.descartarProgramacion(programacion.idProgramacion!, motivo).subscribe({
                    next: (response) => {
                        const nuevaFecha = response.nuevaFechaProximo || 'próxima fecha';
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Programación Avanzada',
                            detail: `Se descartó el mantenimiento vencido. Nueva fecha: ${nuevaFecha}`,
                            life: 5000
                        });
                        this.loadProgramaciones();
                    },
                    error: (error) => {
                        console.error('❌ Error descartando programación:', error);
                        this.loading = false;
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: error?.error || 'No se pudo descartar la programación'
                        });
                    }
                });
            }
        });
    }

    /**
     * Abre el diálogo para reprogramar un mantenimiento
     */
    openReprogramarDialog(programacion: ProgramacionMantenimiento): void {
        this.reprogramarData = {
            programacion: programacion,
            nuevaFecha: programacion.fechaProximoMantenimiento 
                ? new Date(programacion.fechaProximoMantenimiento) 
                : new Date(),
            motivo: ''
        };
        this.displayReprogramarDialog = true;
    }

    /**
     * Confirma la reprogramación del mantenimiento
     */
    confirmarReprogramacion(): void {
        if (!this.reprogramarData.programacion || !this.reprogramarData.nuevaFecha) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Debe seleccionar una nueva fecha'
            });
            return;
        }

        if (!this.reprogramarData.motivo || this.reprogramarData.motivo.trim().length < 5) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Debe ingresar un motivo para la reprogramación (mínimo 5 caracteres)'
            });
            return;
        }

        this.loading = true;
        
        // Formatear fecha manualmente para evitar problemas de zona horaria
        // toISOString() convierte a UTC y puede restar un día
        const fecha = this.reprogramarData.nuevaFecha;
        const fechaFormateada = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
        console.log('📅 Fecha seleccionada:', fecha, '→ Enviando:', fechaFormateada);

        this.programacionesService.reprogramarProgramacion(
            this.reprogramarData.programacion.idProgramacion!,
            fechaFormateada,
            this.reprogramarData.motivo
        ).subscribe({
            next: (response) => {
                console.log('✅ Reprogramación exitosa:', response);
                this.displayReprogramarDialog = false;
                this.loading = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Reprogramado',
                    detail: `Mantenimiento reprogramado para el ${response.nuevaFecha}`,
                    life: 5000
                });
                // Recargar datos para reflejar el cambio
                this.loadProgramaciones();
            },
            error: (error) => {
                console.error('❌ Error reprogramando:', error);
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error?.error || 'No se pudo reprogramar el mantenimiento'
                });
            }
        });
    }

    /**
     * Cancela la reprogramación
     */
    cancelarReprogramacion(): void {
        this.displayReprogramarDialog = false;
        this.reprogramarData = {
            programacion: null,
            nuevaFecha: null,
            motivo: ''
        };
    }

    /**
     * Abre el menú de acciones secundarias
     */
    openAccionesMenu(event: Event, programacion: ProgramacionMantenimiento): void {
        this.programacionSeleccionadaMenu = programacion;
        const esUnica = this.esProgramacionUnica(programacion);
        const esVencida = this.isVencida(programacion.fechaProximoMantenimiento);
        
        this.accionesMenuItems = [
            {
                label: 'Editar Programación',
                icon: 'pi pi-pencil',
                command: () => this.editProgramacion(programacion)
            },
            {
                label: 'Ejecutar Mantenimiento',
                icon: 'pi pi-play',
                visible: programacion.activa,
                styleClass: 'font-semibold',
                command: () => this.crearMantenimiento(programacion)
            },
            { separator: true },
            {
                label: 'Reprogramar',
                icon: 'pi pi-calendar',
                visible: programacion.activa && !esUnica,
                command: () => this.openReprogramarDialog(programacion)
            },
            {
                label: 'Descartar (Vencida)',
                icon: 'pi pi-forward',
                visible: programacion.activa && esVencida && programacion.frecuenciaDias > 0,
                styleClass: 'text-orange-600',
                command: () => this.descartarProgramacion(programacion)
            },
            {
                label: 'Ver Historial',
                icon: 'pi pi-history',
                command: () => this.verHistorialProgramacion(programacion)
            },
            { separator: true },
            {
                label: programacion.activa ? 'Pausar Programación' : 'Activar Programación',
                icon: programacion.activa ? 'pi pi-pause' : 'pi pi-check-circle',
                command: () => this.toggleActiva(programacion)
            },
            { separator: true },
            {
                label: 'Eliminar',
                icon: 'pi pi-trash',
                styleClass: 'text-red-500',
                command: () => this.deleteProgramacion(programacion)
            }
        ];

        this.menuAcciones.toggle(event);
    }

    /**
     * Navega al historial filtrado por esta programación
     */
    verHistorialProgramacion(programacion: ProgramacionMantenimiento): void {
        // Navegar al historial con filtro
        window.location.href = `/administracion/historial-programaciones?programacionId=${programacion.idProgramacion}&equipoNombre=${encodeURIComponent(programacion.equipo?.nombre || '')}`;
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
                'Frecuencia (días)': prog.frecuenciaDias === 0 ? 'Único' : prog.frecuenciaDias,
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
     * Obtiene el texto descriptivo de la frecuencia
     */
    getFrecuenciaTexto(dias: number): string {
        if (dias === 0) return 'Único';
        if (dias === 7) return 'Semanal';
        if (dias === 15) return 'Quincenal';
        if (dias === 30) return 'Mensual';
        if (dias === 60) return 'Bimestral';
        if (dias === 90) return 'Trimestral';
        if (dias === 120) return 'Cuatrimestral';
        if (dias === 180) return 'Semestral';
        if (dias === 365) return 'Anual';
        return `${dias} días`;
    }

    /**
     * Verifica si una programación es de uso único
     */
    esProgramacionUnica(programacion: ProgramacionMantenimiento): boolean {
        return programacion.frecuenciaDias === 0;
    }

    /**
     * Obtiene la clase CSS para las fechas
     */
    getDateClass(fecha: Date | undefined): string {
        if (!fecha) return '';

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const fechaObj = new Date(fecha);
        fechaObj.setHours(0, 0, 0, 0);

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
        const fechaObj = new Date(fecha);
        fechaObj.setHours(0, 0, 0, 0);
        return fechaObj < today;
    }

    /**
     * Verifica si el contrato de una programación está vencido
     */
    isContratoVencido(programacion: ProgramacionMantenimiento): boolean {
        if (!programacion.contrato?.fechaFin) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const fechaFin = new Date(programacion.contrato.fechaFin);
        fechaFin.setHours(0, 0, 0, 0);
        return fechaFin < today;
    }

    /**
     * Obtiene el tipo de vencimiento de una programación
     * Retorna: 'fecha' | 'contrato' | 'ambos' | null
     */
    getTipoVencimiento(programacion: ProgramacionMantenimiento): 'fecha' | 'contrato' | 'ambos' | null {
        const fechaVencida = this.isVencida(programacion.fechaProximoMantenimiento);
        const contratoVencido = this.isContratoVencido(programacion);
        
        if (fechaVencida && contratoVencido) return 'ambos';
        if (fechaVencida) return 'fecha';
        if (contratoVencido) return 'contrato';
        return null;
    }

    /**
     * Verifica si una fecha está próxima (dentro de 7 días)
     */
    isProxima(fecha: Date | undefined): boolean {
        if (!fecha) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sevenDaysFromNow = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000));
        const fechaObj = new Date(fecha);
        fechaObj.setHours(0, 0, 0, 0);
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

        // Si es formato yyyy-MM-dd, parsearlo manualmente para evitar problemas de timezone
        // new Date("2026-02-01") lo interpreta como UTC y puede restar un día en zonas horarias negativas
        const dateOnlyMatch = cleanDateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (dateOnlyMatch) {
            const year = parseInt(dateOnlyMatch[1], 10);
            const month = parseInt(dateOnlyMatch[2], 10) - 1; // Los meses en JS van de 0-11
            const day = parseInt(dateOnlyMatch[3], 10);
            return new Date(year, month, day);
        }

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
