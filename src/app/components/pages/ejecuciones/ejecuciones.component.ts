import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import { Table } from 'primeng/table';
import { Menu } from 'primeng/menu';
import { FileUpload } from 'primeng/fileupload';
import { ActivatedRoute, Router } from '@angular/router';
import { EjecucionesService, EjecucionMantenimiento, GuardarEjecucionRequest, CambioEstadoRequest } from '../../../service/ejecuciones.service';
import { ContratosService, Contrato } from '../../../service/contratos.service';
import { EvidenciasService, Evidencia, UploadProgress } from '../../../service/evidencias.service';
import { ComentariosEjecucionService, ComentarioEjecucion, CrearComentarioRequest } from '../../../service/comentarios-ejecucion.service';
import { UsuariosService, Usuario } from '../../../service/usuarios.service';
import { KeycloakService } from '../../../service/keycloak.service';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-ejecuciones',
    templateUrl: './ejecuciones.component.html',
    styleUrls: ['./ejecuciones.component.scss']
})
export class EjecucionesComponent implements OnInit {
            // Devuelve la fecha formateada para comentarios
            getFechaComentario(fecha: string | Date | undefined): string {
                if (!fecha) return '-';
                
                let d: Date;
                if (fecha instanceof Date) {
                    d = fecha;
                } else {
                    // Limpiar el sufijo [UTC] que viene del backend
                    const fechaLimpia = fecha.replace(/\[UTC\]$/, '');
                    d = new Date(fechaLimpia);
                }
                
                if (isNaN(d.getTime())) return '-';
                
                // Formato dd/MM/yyyy HH:mm:ss
                const pad = (n: number) => n.toString().padStart(2, '0');
                return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
            }
        // Utilidad para convertir string ISO a Date
        fechaToDate(fecha: string | Date): Date {
            return (fecha instanceof Date) ? fecha : new Date(fecha);
        }
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
    evidencias: Evidencia[] = [];
    loadingEvidencias = false;
    uploadProgress = 0;
    uploading = false;
    nuevaDescripcion = '';
    ejecucionEvidenciasId: number | null = null;
    archivosSeleccionados: File[] = [];
    
    // Sistema de Comentarios y Gestión
    showGestionDialog = false;
    comentarios: ComentarioEjecucion[] = [];
    loadingComentarios = false;
    nuevoComentario = '';
    tipoComentarioSeleccionado = 'SEGUIMIENTO';
    nuevoEstadoSeleccionado: string | null = null;
    ejecucionGestion: EjecucionMantenimiento | null = null;
    
    @ViewChild('fileUploadGestion') fileUploadGestion!: FileUpload;
    
    tiposComentario = [
        { label: 'Seguimiento', value: 'SEGUIMIENTO' },
        { label: 'Técnico', value: 'TECNICO' },
        { label: 'Observación', value: 'OBSERVACION' },
        { label: 'Resolución', value: 'RESOLUCION' },
        { label: 'Alerta', value: 'ALERTA' }
    ];
    
    estadosEdicion = ['PROGRAMADO', 'EN_PROCESO', 'COMPLETADO', 'CANCELADO'];
    
    // Usuario actual
    usuarioActual?: Usuario;
    
    // Filtros
    filtroIdEjecucion: number | null = null;
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
        private comentariosService: ComentariosEjecucionService,
        private usuariosService: UsuariosService,
        private keycloakService: KeycloakService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private route: ActivatedRoute,
        private router: Router
    ) {}

    ngOnInit() {
        console.log('🚀 Iniciando componente ejecuciones');
        
        // Suscribirse a cambios en los queryParams
        this.route.queryParams.subscribe(params => {
            console.log('📋 QueryParams recibidos:', params);
            
            if (params['idEjecucion']) {
                this.filtroIdEjecucion = +params['idEjecucion'];
                console.log('🔍 Filtro por ejecución ID:', this.filtroIdEjecucion);
            } else {
                this.filtroIdEjecucion = null;
                console.log('❌ No hay filtro de ejecución');
            }
        });
        
        this.loadEjecuciones();
        this.loadContratos();
        this.cargarUsuarioActual();
    }

    cargarUsuarioActual() {
        const keycloakId = this.keycloakService.getUserId();
        console.log('🔑 Cargando usuario actual...');
        console.log('   Keycloak ID:', keycloakId);
        
        if (keycloakId) {
            this.usuariosService.getActivos().subscribe({
                next: (usuarios) => {
                    console.log('   👥 Usuarios activos recibidos:', usuarios.length);
                    console.log('   📋 KeycloakIds en BD:', usuarios.map(u => ({
                        id: u.id,
                        nombre: u.nombreCompleto,
                        keycloakId: u.keycloakId
                    })));
                    
                    // Comparación case-insensitive para keycloakId
                    this.usuarioActual = usuarios.find(u => 
                        u.keycloakId?.toLowerCase() === keycloakId.toLowerCase()
                    );
                    
                    console.log('   ✅ Usuario actual encontrado:', this.usuarioActual);
                    
                    if (!this.usuarioActual) {
                        console.warn('   ⚠️ Tu keycloakId no coincide con ningún usuario en BD');
                        console.warn('   ⚠️ Verifica que tu usuario esté registrado en la tabla Usuarios');
                    }
                },
                error: (err) => {
                    console.error('   ❌ Error cargando usuarios:', err);
                }
            });
        } else {
            console.log('   ⚠️ No hay keycloakId');
        }
    }

    loadEjecuciones() {
        console.log('📥 Cargando ejecuciones...', { filtroActivo: this.filtroIdEjecucion });
        this.loading = true;
        this.ejecucionesService.getAll().subscribe({
            next: (data) => {
                this.ejecuciones = data;
                this.loading = false;
                console.log('✅ Ejecuciones cargadas:', this.ejecuciones.length, 'registros');
                
                // Si hay un filtro activo por ID, abrir automáticamente el detalle
                if (this.filtroIdEjecucion) {
                    console.log('🔎 Buscando ejecución con ID:', this.filtroIdEjecucion);
                    const ejecucion = this.ejecuciones.find(e => e.idEjecucion === this.filtroIdEjecucion);
                    if (ejecucion) {
                        console.log('✅ Ejecución encontrada:', ejecucion);
                        setTimeout(() => {
                            console.log('🔓 Abriendo detalle...');
                            this.verDetalle(ejecucion);
                        }, 300);
                    } else {
                        console.log('❌ Ejecución NO encontrada con ID:', this.filtroIdEjecucion);
                        console.log('📋 IDs disponibles:', this.ejecuciones.map(e => e.idEjecucion));
                    }
                }
            },
            error: (error) => {
                console.error('❌ Error al cargar ejecuciones:', error);
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
            ? `⚠️ Esta ejecución ya está finalizada. ¿Está seguro de que desea eliminar la ejecución de "${ejecucion.equipoNombre}"?`
            : `¿Está seguro de que desea eliminar la ejecución de "${ejecucion.equipoNombre}"?`;
        
        if (confirm(mensaje)) {
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
                        
                        // Extraer mensaje de error del backend
                        let motivo = 'Error desconocido';
                        if (error?.error?.error) {
                            motivo = error.error.error;
                        } else if (error?.message) {
                            motivo = error.message;
                        }
                        
                        alert(`❌ No se pudo eliminar la ejecución:\n\n${ejecucion.equipoNombre}\n\nMotivo: ${motivo}`);
                    }
                });
            }
        }
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
        // Validación diferente según el modo
        const esValido = this.isEditMode 
            ? this.selectedEjecucion.fechaEjecucion  // En edición solo validar fecha
            : (this.selectedEjecucion.idContrato && this.selectedEjecucion.idEquipo && this.selectedEjecucion.fechaEjecucion); // En creación validar todo
        
        if (esValido) {
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
        // Limpiar el sufijo [UTC] si existe
        const dateStr = typeof date === 'string' ? date.replace(/\[UTC\]$/, '') : date;
        const parsed = new Date(dateStr);
        return isNaN(parsed.getTime()) ? null : parsed;
    }

    formatDateTime(date: any): string {
        if (!date) return '';
        
        try {
            let d: Date;
            if (typeof date === 'string') {
                let cleanDate = date.replace('Z[UTC]', 'Z');
                d = new Date(cleanDate);
            } else if (date instanceof Date) {
                d = date;
            } else if (typeof date === 'number') {
                d = new Date(date);
            } else {
                return '';
            }
            
            if (isNaN(d.getTime())) {
                return '';
            }
            
            return d.toLocaleString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
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
    
    // ==================== INICIAR TRABAJO ====================
    
    abrirIniciarDialog(ejecucion: EjecucionMantenimiento) {
        this.selectedEjecucion = ejecucion;
        this.confirmationService.confirm({
            message: `¿Iniciar trabajo de mantenimiento para <strong>${ejecucion.equipoNombre}</strong>?<br><br>Se registrará la fecha y hora actual como inicio del trabajo.`,
            header: '🔧 Iniciar Trabajo',
            icon: 'pi pi-play-circle',
            acceptLabel: 'Sí, Iniciar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-info',
            accept: () => {
                this.confirmarIniciar();
            }
        });
    }
    
    confirmarIniciar() {
        if (!this.selectedEjecucion.idEjecucion) return;
        
        const estadoAnterior = this.selectedEjecucion.estado || 'PROGRAMADO';
        const payload: CambioEstadoRequest = {
            estado: 'EN_PROCESO',
            fechaReferencia: new Date(),
            fechaInicio: new Date(),
            bitacora: ''
        };
        
        this.accionLoadingId = this.selectedEjecucion.idEjecucion;
        this.ejecucionesService.actualizarEstado(this.selectedEjecucion.idEjecucion, payload).subscribe({
            next: () => {
                // Crear comentario de cambio de estado
                const comentarioRequest: CrearComentarioRequest = {
                    idEjecucion: this.selectedEjecucion.idEjecucion!,
                    tipoComentario: 'SEGUIMIENTO',
                    comentario: '🔧 Trabajo iniciado.',
                    estadoAnterior: estadoAnterior,
                    estadoNuevo: 'EN_PROCESO',
                    usuarioId: this.usuarioActual?.id
                };
                this.comentariosService.create(comentarioRequest).subscribe();
                
                this.messageService.add({
                    severity: 'success',
                    summary: 'Trabajo iniciado',
                    detail: 'El mantenimiento está ahora en proceso'
                });
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
        this.confirmationService.confirm({
            message: `¿Completar mantenimiento de <strong>${ejecucion.equipoNombre}</strong>?<br><br>Se marcará como finalizado y se registrará la fecha de completado. Puede agregar observaciones y evidencias desde la Gestión de Ejecución.`,
            header: '✅ Completar Mantenimiento',
            icon: 'pi pi-check-circle',
            acceptLabel: 'Sí, Completar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-success',
            accept: () => {
                this.confirmarCompletar();
            }
        });
    }
    
    confirmarCompletar() {
        if (!this.selectedEjecucion.idEjecucion) return;
        
        const estadoAnterior = this.selectedEjecucion.estado || 'EN_PROCESO';
        
        const payload: CambioEstadoRequest = {
            estado: 'COMPLETADO',
            fechaReferencia: new Date(),
            fechaInicio: this.parseToDate(this.selectedEjecucion.fechaInicioTrabajo) ?? new Date(),
            bitacora: this.selectedEjecucion.bitacora || ''
        };
        
        this.accionLoadingId = this.selectedEjecucion.idEjecucion;
        this.ejecucionesService.actualizarEstado(this.selectedEjecucion.idEjecucion, payload).subscribe({
            next: () => {
                // Crear comentario de cambio de estado
                const comentarioRequest: CrearComentarioRequest = {
                    idEjecucion: this.selectedEjecucion.idEjecucion!,
                    tipoComentario: 'RESOLUCION',
                    comentario: '✅ Mantenimiento completado exitosamente.',
                    estadoAnterior: estadoAnterior,
                    estadoNuevo: 'COMPLETADO',
                    usuarioId: this.usuarioActual?.id
                };
                this.comentariosService.create(comentarioRequest).subscribe();
                
                this.messageService.add({
                    severity: 'success',
                    summary: 'Mantenimiento completado',
                    detail: 'El mantenimiento ha sido finalizado exitosamente'
                });
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
        this.confirmationService.confirm({
            message: `¿Está seguro de cancelar el mantenimiento de <strong>${ejecucion.equipoNombre}</strong>?<br><br>Esta acción marcará la ejecución como cancelada. Puede agregar comentarios explicativos desde la Gestión de Ejecución.`,
            header: '⚠️ Cancelar Mantenimiento',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, Cancelar',
            rejectLabel: 'No',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.confirmarCancelar();
            }
        });
    }
    
    confirmarCancelar() {
        if (!this.selectedEjecucion.idEjecucion) return;
        
        const estadoAnterior = this.selectedEjecucion.estado || 'PROGRAMADO';
        
        const payload: CambioEstadoRequest = {
            estado: 'CANCELADO',
            fechaReferencia: new Date(),
            bitacora: this.selectedEjecucion.bitacora || ''
        };
        
        this.accionLoadingId = this.selectedEjecucion.idEjecucion;
        this.ejecucionesService.actualizarEstado(this.selectedEjecucion.idEjecucion, payload).subscribe({
            next: () => {
                // Crear comentario de cancelación
                const comentarioRequest: CrearComentarioRequest = {
                    idEjecucion: this.selectedEjecucion.idEjecucion!,
                    tipoComentario: 'ALERTA',
                    comentario: '❌ Mantenimiento cancelado.',
                    estadoAnterior: estadoAnterior,
                    estadoNuevo: 'CANCELADO',
                    usuarioId: this.usuarioActual?.id
                };
                this.comentariosService.create(comentarioRequest).subscribe();
                
                this.messageService.add({
                    severity: 'info',
                    summary: 'Mantenimiento cancelado',
                    detail: 'El mantenimiento ha sido cancelado'
                });
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
        let resultado = this.ejecuciones;
        
        // Filtrar por ID si está activo (tiene prioridad)
        if (this.filtroIdEjecucion) {
            resultado = resultado.filter(e => e.idEjecucion === this.filtroIdEjecucion);
        }
        
        // Filtrar por estado
        if (this.filtroEstado) {
            resultado = resultado.filter(e => e.estado === this.filtroEstado);
        }
        
        return resultado;
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
    
    limpiarFiltroId() {
        this.filtroIdEjecucion = null;
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { idEjecucion: null },
            queryParamsHandling: 'merge'
        });
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
                label: 'Gestionar',
                icon: 'pi pi-comments',
                command: () => this.abrirGestion(ejecucion)
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
                        
                        // Agregar comentario automático de eliminación
                        if (this.ejecucionGestion?.idEjecucion) {
                            const comentarioAuto: CrearComentarioRequest = {
                                idEjecucion: this.ejecucionGestion.idEjecucion,
                                tipoComentario: 'SEGUIMIENTO',
                                comentario: `Se eliminó evidencia: ${evidencia.nombreOriginal}`,
                                usuarioId: this.usuarioActual?.id
                            };
                            this.comentariosService.create(comentarioAuto).subscribe(() => {
                                this.loadComentarios();
                            });
                        }
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

    // ==================== GESTIÓN DE COMENTARIOS ====================
    
    abrirGestion(ejecucion: EjecucionMantenimiento) {
        this.ejecucionGestion = ejecucion;
        this.ejecucionEvidenciasId = ejecucion.idEjecucion || null;
        this.showGestionDialog = true;
        this.nuevoComentario = '';
        this.tipoComentarioSeleccionado = 'SEGUIMIENTO';
        this.nuevoEstadoSeleccionado = null;
        this.loadComentarios();
        this.loadEvidencias();
    }

    hideGestionDialog() {
        this.showGestionDialog = false;
        this.ejecucionGestion = null;
        this.comentarios = [];
        this.evidencias = [];
        this.nuevoComentario = '';
        this.tipoComentarioSeleccionado = 'SEGUIMIENTO';
        this.nuevoEstadoSeleccionado = null;
    }

    loadComentarios() {
        if (!this.ejecucionGestion?.idEjecucion) return;
        
        this.loadingComentarios = true;
        this.comentariosService.getByEjecucion(this.ejecucionGestion.idEjecucion).subscribe({
            next: (data) => {
                this.comentarios = data;
                this.loadingComentarios = false;
            },
            error: (error) => {
                console.error('Error al cargar comentarios:', error);
                this.loadingComentarios = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudieron cargar los comentarios'
                });
            }
        });
    }

    agregarComentario() {
        if (!this.ejecucionGestion?.idEjecucion || !this.nuevoComentario?.trim()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Debe escribir un comentario'
            });
            return;
        }

        const request: CrearComentarioRequest = {
            idEjecucion: this.ejecucionGestion.idEjecucion,
            tipoComentario: this.tipoComentarioSeleccionado,
            comentario: this.nuevoComentario.trim(),
            usuarioId: this.usuarioActual?.id
        };

        console.log('📝 Agregando comentario:', request);
        console.log('   Usuario actual:', this.usuarioActual);

        // Mostrar el comentario de inmediato en la lista local
        const now = new Date();
        this.comentarios.unshift({
            ...request,
            usuario: this.usuarioActual?.nombreCompleto || 'Sistema',
            fechaCreacion: now.toISOString()
        });
        this.comentariosService.create(request).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Comentario agregado correctamente'
                });
                this.nuevoComentario = '';
                this.loadEjecuciones(); // Refrescar lista principal
            },
            error: (error) => {
                console.error('Error al agregar comentario:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo agregar el comentario'
                });
            }
        });
    }

    // Nueva función para cambiar estado desde gestión
    renderComentarioConEnlaces(comentario: string): string {
        if (!comentario) return '';
        
        // Detectar si el comentario menciona archivos adjuntos
        if (comentario.includes('Se adjuntó evidencia:')) {
            const partes = comentario.split('Se adjuntó evidencia:');
            return `${partes[0]}Se adjuntó evidencia: <strong class="text-primary"><i class="pi pi-paperclip"></i> ${partes[1]}</strong>`;
        }
        
        if (comentario.includes('archivos de evidencia:')) {
            const partes = comentario.split('archivos de evidencia:');
            return `${partes[0]}archivos de evidencia: <strong class="text-primary"><i class="pi pi-paperclip"></i> ${partes[1]}</strong>`;
        }
        
        return comentario;
    }

    cambiarEstadoGestion() {
        if (!this.ejecucionGestion?.idEjecucion || !this.nuevoEstadoSeleccionado || this.nuevoEstadoSeleccionado === this.ejecucionGestion.estado) {
            return;
        }
        const estadoAnterior = this.ejecucionGestion.estado;
        const payload: CambioEstadoRequest = {
            estado: this.nuevoEstadoSeleccionado as 'PROGRAMADO' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO',
            fechaReferencia: new Date()
        };
        this.accionLoadingId = this.ejecucionGestion.idEjecucion;
        this.ejecucionesService.actualizarEstado(this.ejecucionGestion.idEjecucion, payload).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Estado actualizado',
                    detail: `La ejecución pasó de ${this.getEstadoLabel(estadoAnterior)} a ${this.getEstadoLabel(this.nuevoEstadoSeleccionado)}`
                });
                this.ejecucionGestion.estado = this.nuevoEstadoSeleccionado as any;
                // Agregar comentario automático al historial localmente
                const now = new Date();
                this.comentarios.unshift({
                    idEjecucion: this.ejecucionGestion.idEjecucion!,
                    tipoComentario: 'SEGUIMIENTO',
                    comentario: `Estado cambiado de ${this.getEstadoLabel(estadoAnterior)} a ${this.getEstadoLabel(this.nuevoEstadoSeleccionado)}.`,
                    estadoAnterior: estadoAnterior,
                    estadoNuevo: this.nuevoEstadoSeleccionado,
                    usuario: this.usuarioActual?.nombreCompleto || 'Sistema',
                    fechaCreacion: now.toISOString()
                });
                this.comentariosService.create({
                    idEjecucion: this.ejecucionGestion.idEjecucion!,
                    tipoComentario: 'SEGUIMIENTO',
                    comentario: `Estado cambiado de ${this.getEstadoLabel(estadoAnterior)} a ${this.getEstadoLabel(this.nuevoEstadoSeleccionado)}.`,
                    estadoAnterior: estadoAnterior,
                    estadoNuevo: this.nuevoEstadoSeleccionado,
                    usuarioId: this.usuarioActual?.id
                }).subscribe();
                this.nuevoEstadoSeleccionado = null;
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

    guardarObservaciones() {
        if (!this.ejecucionGestion?.idEjecucion) {
            return;
        }

        const payload = {
            ...this.ejecucionGestion,
            bitacora: this.ejecucionGestion.bitacora || ''
        };

        this.ejecucionesService.update(this.ejecucionGestion.idEjecucion, payload).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Observaciones guardadas',
                    detail: 'Las observaciones se han actualizado correctamente'
                });
                this.loadEjecuciones();
            },
            error: (error) => {
                console.error('Error al guardar observaciones:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudieron guardar las observaciones'
                });
            }
        });
    }

    getTipoComentarioSeverity(tipo: string): string {
        switch (tipo?.toUpperCase()) {
            case 'TECNICO': return 'info';
            case 'SEGUIMIENTO': return 'secondary';
            case 'OBSERVACION': return 'warning';
            case 'RESOLUCION': return 'success';
            case 'ALERTA': return 'danger';
            default: return 'secondary';
        }
    }

    getTipoComentarioIcon(tipo: string): string {
        switch (tipo?.toUpperCase()) {
            case 'TECNICO': return 'pi pi-wrench';
            case 'SEGUIMIENTO': return 'pi pi-clock';
            case 'OBSERVACION': return 'pi pi-eye';
            case 'RESOLUCION': return 'pi pi-check-circle';
            case 'ALERTA': return 'pi pi-exclamation-triangle';
            default: return 'pi pi-comment';
        }
    }

    // Subir evidencia desde el dialog de gestión
    subirEvidenciaGestion(event: any) {
        const files: File[] = event.files;
        if (!files || files.length === 0 || !this.ejecucionGestion?.idEjecucion) return;

        this.uploading = true;
        this.uploadProgress = 0;
        
        let completedCount = 0;
        const totalFiles = files.length;
        const fileNames: string[] = files.map(f => f.name);
        
        // Subir archivos uno por uno
        files.forEach((file: File) => {
            this.evidenciasService.upload(
                this.ejecucionGestion!.idEjecucion!,
                file,
                this.nuevaDescripcion
            ).subscribe({
                next: (progress: UploadProgress) => {
                    if (progress.status === 'progress') {
                        this.uploadProgress = progress.progress || 0;
                    } else if (progress.status === 'complete') {
                        completedCount++;
                        this.uploadProgress = Math.round((completedCount / totalFiles) * 100);
                        
                        if (completedCount === totalFiles) {
                            this.uploading = false;
                            this.uploadProgress = 0;
                            this.nuevaDescripcion = '';
                            
                            // Limpiar el componente de upload para que no se vuelvan a subir los mismos archivos
                            setTimeout(() => {
                                if (this.fileUploadGestion) {
                                    this.fileUploadGestion.clear();
                                }
                            }, 100);
                            
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Éxito',
                                detail: `${totalFiles} archivo(s) subido(s) correctamente`
                            });
                            this.loadEvidencias();
                            
                            // Agregar comentario automático con los nombres de los archivos
                            let comentarioTexto = totalFiles === 1 
                                ? `Se adjuntó evidencia: ${fileNames[0]}`
                                : `Se adjuntaron ${totalFiles} archivos de evidencia: ${fileNames.join(', ')}`;
                            
                            const comentarioAuto: CrearComentarioRequest = {
                                idEjecucion: this.ejecucionGestion!.idEjecucion!,
                                tipoComentario: 'SEGUIMIENTO',
                                comentario: comentarioTexto,
                                usuarioId: this.usuarioActual?.id
                            };
                            this.comentariosService.create(comentarioAuto).subscribe(() => {
                                this.loadComentarios();
                            });
                        }
                    }
                },
                error: (error) => {
                    console.error('Error al subir archivo:', error);
                    completedCount++;
                    if (completedCount === totalFiles) {
                        this.uploading = false;
                        this.uploadProgress = 0;
                        
                        // Limpiar también en caso de error
                        setTimeout(() => {
                            if (this.fileUploadGestion) {
                                this.fileUploadGestion.clear();
                            }
                        }, 100);
                    }
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: `No se pudo subir el archivo: ${file.name}`
                    });
                }
            });
        });
    }
}
