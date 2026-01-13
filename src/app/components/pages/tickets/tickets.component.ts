import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TicketsService, Ticket, ComentarioTicketResponse, EvidenciaTicket } from '../../../service/tickets.service';
import { EquiposService } from '../../../service/equipos.service';
import { UsuariosService, Usuario } from '../../../service/usuarios.service';
import { KeycloakService } from '../../../service/keycloak.service';
import { Equipo } from '../../../api/equipos';
import { FileUpload } from 'primeng/fileupload';

@Component({
    selector: 'app-tickets',
    templateUrl: './tickets.component.html',
    styleUrls: ['./tickets.component.scss']
})
export class TicketsComponent implements OnInit {

    @ViewChild('fileUploadEvidencia') fileUploadEvidencia?: FileUpload;

    // Datos principales
    tickets: Ticket[] = [];
    ticketSeleccionado: Ticket | null = null;
    selectedTickets: Ticket[] = [];
    loading: boolean = false;

    // Configuración de tabla
    cols: any[] = [];

    // Filtros y búsqueda
    globalFilter: string = '';
    filtroEstado: string = '';
    filtroPrioridad: string = '';
    
    // Opciones para dropdowns
    estados: string[] = ['Abierto', 'Asignado', 'En Proceso', 'Resuelto', 'Cerrado'];
    estadosEdicion: string[] = ['Abierto', 'Asignado', 'En Proceso', 'Resuelto', 'Cerrado', 'Inactivo'];
    prioridades: string[] = ['Baja', 'Media', 'Alta', 'Crítica'];
    
    // Modal nuevo ticket
    dialogNuevoTicket: boolean = false;
    nuevoTicket: Partial<Ticket> = this.inicializarTicket();
    
    // Modal editar ticket
    dialogEditarTicket: boolean = false;
    ticketEditando: Partial<Ticket> = {};
    equipoSeleccionado: Equipo | null = null;
    
    // Modal ver detalles
    dialogDetalles: boolean = false;
    dialogComentarios: boolean = false;
    comentarios: ComentarioTicketResponse[] = [];
    
    // Modal eliminar
    deleteTicketDialog: boolean = false;
    deleteTicketsDialog: boolean = false;
    ticket: Ticket | null = null;
    
    // Listas para dropdowns
    equipos: Equipo[] = [];
    usuarios: Usuario[] = [];
    usuarioActual?: Usuario;
    
    // Funcionalidad de comentarios y estados
    nuevoComentario: string = '';
    tipoComentarioSeleccionado: string = 'Seguimiento';
    nuevoEstadoSeleccionado: string = '';
    tiposComentario: string[] = ['Técnico', 'Seguimiento', 'Alerta', 'Resolución', 'General'];
    
    // Funcionalidad de evidencias
    evidencias: Array<EvidenciaTicket & { iconoCss?: string; tamanoFormateado?: string }> = [];
    dialogEvidencia: boolean = false;
    archivosEvidenciaSeleccionados: File[] = [];
    descripcionEvidencia: string = '';
    subiendoEvidencias: boolean = false;
    
    // Controles de la vista
    mostrarTicketsAbiertos: boolean = false;

    // Estadísticas de tickets
    statsTickets = {
        total: 0,
        abiertos: 0,
        asignados: 0,
        enProceso: 0,
        resueltos: 0,
        cerrados: 0,
        prioridadAlta: 0
    };

    constructor(
        private ticketsService: TicketsService,
        private equiposService: EquiposService,
        private usuariosService: UsuariosService,
        public keycloakService: KeycloakService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        this.inicializarColumnas();
        this.cargarDatos();
        this.cargarEquipos();
        this.cargarUsuarios();
        
        // Verificar si viene con parámetro para abrir nuevo ticket
        this.route.queryParams.subscribe(params => {
            if (params['action'] === 'nuevo') {
                // Esperar un poco para que los datos se carguen
                setTimeout(() => {
                    this.abrirNuevoTicket();
                }, 500);
            }
        });
    }

    /**
     * Inicializa las columnas de la tabla
     */
    inicializarColumnas(): void {
        this.cols = [
            { field: 'id', header: 'ID' },
            { field: 'descripcion', header: 'Descripción' },
            { field: 'prioridad', header: 'Prioridad' },
            { field: 'estado', header: 'Estado' },
            { field: 'equipoNombre', header: 'Equipo' },
            { field: 'usuarioCreador', header: 'Creador' },
            { field: 'fechaCreacion', header: 'Fecha Creación' }
        ];
    }

    /**
     * Carga los datos iniciales
     */
    cargarDatos(): void {
        this.loading = true;
        
        this.ticketsService.getAll().subscribe({
            next: (tickets: Ticket[]) => {
                this.tickets = tickets || [];
                this.calcularEstadisticas();
                console.log('✅ Tickets cargados:', this.tickets.length);
            },
            error: (error) => {
                console.error('❌ Error al cargar tickets:', error);
                this.tickets = []; // Asegurarse de que tickets sea siempre un array
                this.calcularEstadisticas();
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al conectar con el servidor'
                });
            },
            complete: () => {
                this.loading = false;
            }
        });
    }

    /**
     * Carga la lista de equipos para el dropdown
     */
    cargarEquipos(): void {
        this.equiposService.getEquipos({}).subscribe({
            next: (equipos: Equipo[]) => {
                this.equipos = equipos || [];
                console.log('✅ Equipos cargados:', this.equipos.length);
            },
            error: (error) => {
                console.error('❌ Error al cargar equipos:', error);
                this.equipos = [];
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar equipos'
                });
            }
        });
    }

    /**
     * Carga la lista de usuarios para el dropdown
     */
    cargarUsuarios(): void {
        this.usuariosService.getActivos().subscribe({
            next: (usuarios: Usuario[]) => {
                this.usuarios = usuarios || [];
                console.log('✅ Usuarios cargados:', this.usuarios.length);
                this.establecerUsuarioActual();
            },
            error: (error) => {
                console.error('❌ Error al cargar usuarios:', error);
                this.usuarios = [];
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar usuarios'
                });
            }
        });
    }

    private establecerUsuarioActual(): void {
        const keycloakId = this.keycloakService.getUserId();
        if (!keycloakId) {
            return;
        }

        if (this.usuarios.length) {
            this.usuarioActual = this.usuarios.find(u => u.keycloakId === keycloakId);
        }

        if (this.usuarioActual) {
            this.sincronizarUsuarioCreador();
        } else {
            this.usuariosService.getByKeycloakId(keycloakId).subscribe({
                next: (usuario) => {
                    this.usuarioActual = usuario;
                    this.sincronizarUsuarioCreador();
                },
                error: (error) => {
                    console.error('❌ No se pudo obtener usuario por Keycloak:', error);
                }
            });
        }
    }

    private sincronizarUsuarioCreador(): void {
        if (this.usuarioActual) {
            this.nuevoTicket.usuarioCreadorId = this.usuarioActual.id;
        }
    }

    /**
     * Abre el diálogo para crear nuevo ticket
     */
    abrirNuevoTicket(): void {
        this.nuevoTicket = this.inicializarTicket();
        this.sincronizarUsuarioCreador();
        this.dialogNuevoTicket = true;
    }

    /**
     * Guarda un nuevo ticket
     */
    guardarNuevoTicket(): void {
        if (!this.nuevoTicket.usuarioCreadorId && this.usuarioActual) {
            this.nuevoTicket.usuarioCreadorId = this.usuarioActual.id;
        }
        const payload: Partial<Ticket> = {
            ...this.nuevoTicket,
            equipoId: this.nuevoTicket.equipoId ? Number(this.nuevoTicket.equipoId) : undefined,
            usuarioCreadorId: this.nuevoTicket.usuarioCreadorId ? Number(this.nuevoTicket.usuarioCreadorId) : undefined,
            usuarioAsignadoId: this.nuevoTicket.usuarioAsignadoId ? Number(this.nuevoTicket.usuarioAsignadoId) : undefined
        };

        if (!payload.usuarioCreadorId) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Usuario no identificado',
                detail: 'No se pudo obtener el usuario autenticado. Intente recargar o inicie sesión nuevamente.'
            });
            return;
        }

        if (!this.validarTicket(payload)) {
            return;
        }

        this.ticketsService.create(payload).subscribe({
            next: (response: {message: string, success: boolean}) => {
                if (response.success) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: response.message || 'Ticket creado correctamente'
                    });
                    this.dialogNuevoTicket = false;
                    this.cargarDatos(); // Recargar la lista para mostrar el nuevo ticket
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: response.message || 'Error al crear el ticket'
                    });
                }
            },
            error: (error) => {
                console.error('❌ Error al crear ticket:', error);
                let errorMessage = 'Error al crear el ticket';
                if (error.error && error.error.error) {
                    errorMessage = error.error.error;
                }
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: errorMessage
                });
            }
        });
    }

    /**
     * Abre el diálogo de detalles del ticket
     */
    verDetalles(ticket: Ticket): void {
        this.ticketSeleccionado = { ...ticket };
        this.dialogDetalles = true;
        this.cargarComentarios(ticket.id!);
    }

    /**
     * Abre el diálogo de comentarios para un ticket
     */
    verComentarios(ticket: Ticket): void {
        this.ticketSeleccionado = { ...ticket };
        this.dialogComentarios = true;
        this.cargarComentarios(ticket.id!);
        this.cargarEvidencias(ticket.id!);
    }

    /**
     * Carga los comentarios de un ticket
     */
    cargarComentarios(ticketId: number): void {
        this.ticketsService.getComentarios(ticketId).subscribe({
            next: (comentarios: ComentarioTicketResponse[]) => {
                this.comentarios = comentarios || [];
                console.log('💬 Comentarios cargados:', this.comentarios.length);
            },
            error: (error) => {
                console.error('❌ Error al cargar comentarios:', error);
            }
        });
    }

    /**
     * Confirma la eliminación de un ticket
     */
    confirmarEliminar(ticket: Ticket): void {
        this.confirmationService.confirm({
            message: `¿Está seguro de eliminar el ticket "${ticket.descripcion}"?`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.eliminarTicket(ticket);
            }
        });
    }

    /**
     * Elimina un ticket
     */
    eliminarTicket(ticket: Ticket): void {
        if (!ticket.id) return;

        this.ticketsService.delete(ticket.id).subscribe({
            next: (response: {message: string, success: boolean}) => {
                if (response.success) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: response.message || 'Ticket desactivado correctamente'
                    });
                    this.cargarDatos(); // Recargar la lista
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: response.message || 'Error al desactivar el ticket'
                    });
                }
            },
            error: (error) => {
                console.error('❌ Error al eliminar ticket:', error);
                let errorMessage = 'Error al desactivar el ticket';
                if (error.error && error.error.error) {
                    errorMessage = error.error.error;
                }
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: errorMessage
                });
            }
        });
    }

    /**
     * Asigna un ticket
     */
    asignarTicket(ticket: Ticket, usuarioId: number): void {
        if (!ticket.id) return;

        this.ticketsService.asignar(ticket.id, usuarioId).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Ticket asignado correctamente'
                });
                this.cargarDatos();
            },
            error: (error) => {
                console.error('❌ Error al asignar ticket:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al asignar el ticket'
                });
            }
        });
    }

    /**
     * Cierra un ticket
     */
    cerrarTicket(ticket: Ticket): void {
        if (!ticket.id) return;

        this.confirmationService.confirm({
            message: `¿Está seguro de cerrar el ticket "${ticket.descripcion}"?`,
            header: 'Confirmar cierre',
            icon: 'pi pi-check-circle',
            accept: () => {
                this.ticketsService.cerrar(ticket.id!).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Ticket cerrado correctamente'
                        });
                        this.cargarDatos();
                    },
                    error: (error) => {
                        console.error('❌ Error al cerrar ticket:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al cerrar el ticket'
                        });
                    }
                });
            }
        });
    }

    /**
     * Obtiene el color para una prioridad
     */
    getColorPrioridad(prioridad: string): string {
        switch (prioridad) {
            case 'Crítica': return 'danger';
            case 'Alta': return 'warning';
            case 'Media': return 'info';
            case 'Baja': return 'success';
            default: return 'secondary';
        }
    }

    /**
     * Obtiene el severity para PrimeNG Tag - Estado
     */
    getSeverity(estado: string): string {
        return this.getColorEstado(estado);
    }

    /**
     * Obtiene el severity para PrimeNG Tag - Prioridad
     */
    getPrioridadSeverity(prioridad: string): string {
        return this.getColorPrioridad(prioridad);
    }

    /**
     * Obtiene el severity para PrimeNG Tag - Tipo de Comentario
     */
    getTipoComentarioSeverity(tipo: string): string {
        switch (tipo?.toLowerCase()) {
            case 'técnico': return 'info';
            case 'seguimiento': return 'success';
            case 'alerta': return 'warning';
            case 'resolución': return 'success';
            case 'general': return 'secondary';
            default: return 'info';
        }
    }

    /**
     * Obtiene el color para un estado
     */
    getColorEstado(estado: string): string {
        switch (estado) {
            case 'Abierto': return 'danger';
            case 'Asignado': return 'warning';
            case 'En Proceso': return 'info';
            case 'Resuelto': return 'success';
            case 'Cerrado': return 'secondary';
            default: return 'primary';
        }
    }

    /**
     * Obtiene el icono para una prioridad
     */
    getIconoPrioridad(prioridad: string): string {
        switch (prioridad) {
            case 'Crítica': return 'pi-exclamation-triangle';
            case 'Alta': return 'pi-arrow-up';
            case 'Media': return 'pi-minus';
            case 'Baja': return 'pi-arrow-down';
            default: return 'pi-circle';
        }
    }

    /**
     * Obtiene el icono para un estado
     */
    getIconoEstado(estado: string): string {
        switch (estado) {
            case 'Abierto': return 'pi-circle';
            case 'Asignado': return 'pi-user';
            case 'En Proceso': return 'pi-cog';
            case 'Resuelto': return 'pi-check';
            case 'Cerrado': return 'pi-times';
            default: return 'pi-circle-fill';
        }
    }

    /**
     * Inicializa un ticket nuevo
     */
    private inicializarTicket(): Partial<Ticket> {
        return {
            descripcion: '',
            prioridad: 'Media',
            estado: 'Abierto',
            equipoId: undefined,
            usuarioCreadorId: undefined,
            usuarioAsignadoId: undefined
        };
    }

    /**
     * Valida los datos del ticket
     */
    private validarTicket(ticket: Partial<Ticket>): boolean {
        if (!ticket.descripcion?.trim()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validación',
                detail: 'La descripción es obligatoria'
            });
            return false;
        }

        if (!ticket.prioridad) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validación',
                detail: 'La prioridad es obligatoria'
            });
            return false;
        }

        if (!ticket.equipoId) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validación',
                detail: 'Debe seleccionar un equipo'
            });
            return false;
        }

        return true;
    }

    /**
     * Aplica el filtro global
     */
    aplicarFiltroGlobal(event: any, dt: any): void {
        dt.filterGlobal(event.target.value, 'contains');
    }

    /**
     * Limpia todos los filtros
     */
    limpiarFiltros(): void {
        this.globalFilter = '';
        this.filtroEstado = '';
        this.filtroPrioridad = '';
    }

    /**
     * Alterna la vista de tickets abiertos
     */
    alternarTicketsAbiertos(): void {
        this.mostrarTicketsAbiertos = !this.mostrarTicketsAbiertos;
        this.cargarDatos();
    }

    /**
     * Actualiza los datos
     */
    actualizarDatos(): void {
        this.cargarDatos();
    }

    /**
     * Abre el diálogo de confirmación para eliminar un ticket
     */
    confirmarEliminarTicket(ticket: Ticket): void {
        this.ticket = ticket;
        this.deleteTicketDialog = true;
    }

    /**
     * Abre el diálogo de confirmación para eliminar múltiples tickets
     */
    confirmarEliminarTickets(): void {
        this.deleteTicketsDialog = true;
    }

    /**
     * Elimina el ticket seleccionado (sobrecarga sin parámetros)
     */
    eliminarTicketConfirmado(): void {
        if (this.ticket && this.ticket.id) {
            this.eliminarTicket(this.ticket);
            this.deleteTicketDialog = false;
            this.ticket = null;
        }
    }

    /**
     * Elimina los tickets seleccionados
     */
    eliminarTicketsSeleccionados(): void {
        // Implementar lógica para eliminar múltiples tickets
        this.deleteTicketsDialog = false;
        this.selectedTickets = [];
        this.messageService.add({
            severity: 'info',
            summary: 'Info',
            detail: 'Funcionalidad en desarrollo'
        });
    }

    /**
     * Cierra el modal de comentarios y limpia los campos
     */
    cerrarModalComentarios(): void {
        this.dialogComentarios = false;
        this.nuevoComentario = '';
        this.nuevoEstadoSeleccionado = '';
        this.tipoComentarioSeleccionado = 'Seguimiento';
    }

    /**
     * Abre el modal de edición de ticket
     */
    editarTicket(ticket: Ticket): void {
        console.log('🔧 Editando ticket:', ticket);
        console.log('📦 Equipos disponibles:', this.equipos.length);
        
        // Si no hay equipos cargados, cargarlos primero
        if (this.equipos.length === 0) {
            console.log('⏳ Cargando equipos antes de editar...');
            this.cargarEquipos();
            // Esperar un poco para que se carguen los equipos
            setTimeout(() => {
                this.abrirModalEdicion(ticket);
            }, 500);
        } else {
            this.abrirModalEdicion(ticket);
        }
    }

    /**
     * Abre el modal de edición con los datos del ticket
     */
    private abrirModalEdicion(ticket: Ticket): void {
        this.ticketEditando = { ...ticket };
        const asignadoId = ticket.usuarioAsignadoId
            || (ticket as any).usuario_asignado_id
            || ticket.usuarioAsignado?.id
            || (ticket as any).usuarioAsignadoId;
        this.ticketEditando.usuarioAsignadoId = asignadoId ?? undefined;
        const asignadoNombre = ticket.usuarioAsignado?.nombreCompleto
            || (ticket as any).usuarioAsignado
            || (ticket as any).usuario_asignado;
        if (asignadoNombre) {
            const usuarioEncontrado = this.usuarios.find(u => u.id === asignadoId);
            if (!usuarioEncontrado && asignadoId) {
                this.usuariosService.getById(asignadoId).subscribe({
                    next: (usuario) => {
                        if (!this.usuarios.find(u => u.id === usuario.id)) {
                            this.usuarios.push(usuario);
                        }
                    },
                    error: () => {
                        console.warn('⚠️ No se pudo obtener el usuario asignado con ID:', asignadoId);
                    }
                });
            }
        }
        
        console.log('📦 Equipos disponibles al abrir modal:', this.equipos);
        console.log('📋 Todas las propiedades del ticket:', Object.keys(ticket));
        console.log('🆔 Buscando equipo con ID:', ticket.equipoId);
        console.log('🔍 También verificando equipo_id:', (ticket as any).equipo_id);
        console.log('🔍 También verificando equipoNombre:', (ticket as any).equipoNombre);
        
        // Intentar múltiples campos posibles para el equipo ID
        const equipoId = ticket.equipoId || (ticket as any).equipo_id;
        const equipoNombre = (ticket as any).equipoNombre;
        
        if (equipoId) {
            // Buscar por ID
            this.equipoSeleccionado = this.equipos.find(equipo => {
                console.log('🔍 Comparando ID:', equipo.idEquipo, 'con', equipoId);
                return equipo.idEquipo === equipoId;
            }) || null;
            console.log('🎯 Equipo encontrado por ID:', this.equipoSeleccionado);
        } else if (equipoNombre) {
            // Buscar por nombre
            this.equipoSeleccionado = this.equipos.find(equipo => {
                console.log('🔍 Comparando nombre:', equipo.nombre, 'con', equipoNombre);
                return equipo.nombre === equipoNombre;
            }) || null;
            console.log('🎯 Equipo encontrado por nombre:', this.equipoSeleccionado);
        } else {
            this.equipoSeleccionado = null;
            console.log('❌ No se encontró ID ni nombre de equipo en el ticket');
        }
        
        console.log('✏️ Ticket para editar:', this.ticketEditando);
        
        this.dialogEditarTicket = true;
    }

    /**
     * Cancela la edición y cierra el modal
     */
    cancelarEdicion(): void {
        this.dialogEditarTicket = false;
        this.ticketEditando = {};
        this.equipoSeleccionado = null;
    }

    /**
     * Guarda los cambios del ticket editado
     */
    guardarEdicionTicket(): void {
        if (!this.ticketEditando.id) {
            return;
        }

        // Sincronizar el equipoId con el equipo seleccionado
        if (this.equipoSeleccionado) {
            this.ticketEditando.equipoId = this.equipoSeleccionado.idEquipo;
        }

        const payload: Partial<Ticket> = {
            ...this.ticketEditando,
            equipoId: this.ticketEditando.equipoId ? Number(this.ticketEditando.equipoId) : undefined,
            usuarioAsignadoId: this.ticketEditando.usuarioAsignadoId ? Number(this.ticketEditando.usuarioAsignadoId) : undefined
        };

        console.log('💾 Guardando edición de ticket:', payload);
        console.log('🎯 Equipo seleccionado:', this.equipoSeleccionado);

        this.ticketsService.update(payload.id!, payload as Ticket).subscribe({
            next: (ticketActualizado) => {
                console.log('✅ Ticket actualizado:', ticketActualizado);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Ticket actualizado correctamente'
                });
                this.dialogEditarTicket = false;
                this.cargarDatos(); // Recargar la lista
            },
            error: (error) => {
                console.error('❌ Error al actualizar ticket:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al actualizar el ticket'
                });
            }
        });
    }

    /**
     * Agrega un nuevo comentario (y opcionalmente cambia el estado)
     */
    agregarComentario(): void {
        console.log('🔍 Debug - nuevoComentario:', this.nuevoComentario);
        console.log('🔍 Debug - nuevoComentario.length:', this.nuevoComentario?.length);
        console.log('🔍 Debug - nuevoComentario.trim():', this.nuevoComentario?.trim());
        
        if (!this.nuevoComentario.trim()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'El comentario no puede estar vacío'
            });
            return;
        }

        if (!this.ticketSeleccionado?.id) {
            return;
        }

        const data = {
            comentario: this.nuevoComentario,
            tipoComentario: this.tipoComentarioSeleccionado || 'Seguimiento',
            nuevoEstado: this.nuevoEstadoSeleccionado || undefined
        };

        console.log('💬 Agregando comentario:', data);
        console.log('🔍 DEBUG - nuevoEstadoSeleccionado:', this.nuevoEstadoSeleccionado);
        console.log('🔍 DEBUG - tipoComentarioSeleccionado:', this.tipoComentarioSeleccionado);
        console.log('🔍 DEBUG - nuevoComentario:', this.nuevoComentario);

        this.ticketsService.addComentario(this.ticketSeleccionado.id, data).subscribe({
            next: (response) => {
                console.log('✅ Comentario agregado:', response);
                
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: response.message || 'Comentario agregado correctamente'
                });

                // Limpiar formulario
                this.nuevoComentario = '';
                this.nuevoEstadoSeleccionado = '';

                // Recargar comentarios
                this.cargarComentarios(this.ticketSeleccionado.id);
                
                // Recargar lista de tickets para reflejar cambios de estado
                this.cargarDatos();
            },
            error: (error) => {
                console.error('❌ Error al agregar comentario:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al agregar el comentario'
                });
            }
        });
    }

    /**
     * Cancela la adición de comentario
     */
    cancelarComentario(): void {
        this.nuevoComentario = '';
        this.nuevoEstadoSeleccionado = '';
        this.tipoComentarioSeleccionado = 'Seguimiento';
    }

    /**
     * Calcula las estadísticas de tickets
     */
    calcularEstadisticas(): void {
        if (!this.tickets || this.tickets.length === 0) {
            this.statsTickets = {
                total: 0,
                abiertos: 0,
                asignados: 0,
                enProceso: 0,
                resueltos: 0,
                cerrados: 0,
                prioridadAlta: 0
            };
            return;
        }

        this.statsTickets = {
            total: this.tickets.length,
            abiertos: this.tickets.filter(t => t.estado === 'Abierto').length,
            asignados: this.tickets.filter(t => t.estado === 'Asignado').length,
            enProceso: this.tickets.filter(t => t.estado === 'En Proceso').length,
            resueltos: this.tickets.filter(t => t.estado === 'Resuelto').length,
            cerrados: this.tickets.filter(t => t.estado === 'Cerrado').length,
            prioridadAlta: this.tickets.filter(t => t.prioridad === 'Alta' || t.prioridad === 'Crítica').length
        };
    }

    /**
     * Exporta los tickets a CSV
     */
    exportCSV(): void {
        try {
            if (!this.tickets || this.tickets.length === 0) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'No hay tickets para exportar'
                });
                return;
            }

            const csvData = this.tickets.map(ticket => ({
                'ID': ticket.id,
                'Descripción': ticket.descripcion,
                'Estado': ticket.estado,
                'Prioridad': ticket.prioridad,
                'Equipo': ticket.equipo?.nombre || 'Sin equipo',
                'Código Equipo': ticket.equipo?.codigoInacif || '',
                'Usuario Creador': ticket.usuarioCreador?.nombreCompleto || 'Sin asignar',
                'Usuario Asignado': ticket.usuarioAsignado?.nombreCompleto || 'Sin asignar',
                'Fecha Creación': ticket.fechaCreacion ? new Date(ticket.fechaCreacion).toLocaleDateString('es-ES') : '',
                'Fecha Modificación': ticket.fechaModificacion ? new Date(ticket.fechaModificacion).toLocaleDateString('es-ES') : '',
                'Fecha Cierre': ticket.fechaCierre ? new Date(ticket.fechaCierre).toLocaleDateString('es-ES') : ''
            }));

            // Convertir a CSV
            const headers = Object.keys(csvData[0] || {});
            const csvContent = [
                headers.join(','),
                ...csvData.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
            ].join('\n');

            // Crear nombre de archivo con fecha
            const fechaHoy = new Date().toLocaleDateString('es-ES').replace(/\//g, '-');
            const nombreArchivo = `tickets_${fechaHoy}.csv`;

            // Descargar archivo
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
                detail: `Tickets exportados exitosamente como ${nombreArchivo}`
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
     * Alias para abrir nuevo ticket (compatibilidad con template)
     */
    openNew(): void {
        this.abrirNuevoTicket();
    }

    /**
     * Actualiza la información (alias para compatibilidad)
     */
    loadTickets(): void {
        this.cargarDatos();
    }

    /**
     * Placeholder para funcionalidad de filtros avanzados
     */
    toggleFiltros(): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Filtros',
            detail: 'Panel de filtros avanzados en desarrollo'
        });
    }

    /**
     * Carga las evidencias de un ticket
     */
    cargarEvidencias(ticketId: number): void {
        this.ticketsService.getEvidencias(ticketId).subscribe({
            next: (response: any) => {
                const evidencias: EvidenciaTicket[] = response.evidencias || [];
                this.evidencias = evidencias.map(ev => ({
                    ...ev,
                    iconoCss: this.obtenerIconoArchivo(ev.nombreOriginal || ev.nombreArchivo),
                    tamanoFormateado: this.formatearTamano(ev.tamanio)
                }));
                console.log('📎 Evidencias cargadas:', this.evidencias.length);
            },
            error: (error) => {
                console.error('❌ Error al cargar evidencias:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudieron cargar las evidencias'
                });
            }
        });
    }

    /**
     * Muestra el dialog para subir evidencia
     */
    mostrarDialogEvidencia(): void {
        if (!this.ticketSeleccionado?.id) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Ticket no seleccionado',
                detail: 'Abra un ticket para adjuntar evidencias'
            });
            return;
        }
        this.limpiarEstadoModalEvidencias();
        this.dialogEvidencia = true;
    }

    /**
     * Sube una nueva evidencia al ticket
     */
    subirEvidencia(): void {
        if (!this.ticketSeleccionado?.id) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Debe seleccionar un ticket primero'
            });
            return;
        }

        if (this.archivosEvidenciaSeleccionados.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Seleccione al menos un archivo'
            });
            return;
        }

        const ticketId = this.ticketSeleccionado.id;
        const descripcion = this.descripcionEvidencia?.trim() || '';
        let archivosSubidos = 0;
        let errores = 0;

        this.subiendoEvidencias = true;

        this.archivosEvidenciaSeleccionados.forEach((file, index) => {
            this.ticketsService.uploadEvidenciaArchivo(ticketId, file, descripcion).subscribe({
                next: (response) => {
                    console.log('✅ Archivo subido:', response);
                    archivosSubidos++;
                    
                    if (archivosSubidos + errores === this.archivosEvidenciaSeleccionados.length) {
                        this.mostrarResumenSubidaEvidencias(archivosSubidos, errores);
                    }
                },
                error: (error) => {
                    console.error('❌ Error al subir evidencia:', error);
                    errores++;
                    
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error al subir archivo',
                        detail: `${file.name}: ${error.error?.error || error.message || 'Error desconocido'}`
                    });
                    
                    if (archivosSubidos + errores === this.archivosEvidenciaSeleccionados.length) {
                        this.mostrarResumenSubidaEvidencias(archivosSubidos, errores);
                    }
                }
            });
        });
    }

    private mostrarResumenSubidaEvidencias(exitosos: number, errores: number): void {
        this.subiendoEvidencias = false;
        
        if (exitosos > 0 && errores === 0) {
            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: `${exitosos} archivo(s) subido(s) correctamente`
            });
            
            this.limpiarEstadoModalEvidencias();
            this.cargarEvidencias(this.ticketSeleccionado!.id!);
            
        } else if (exitosos > 0 && errores > 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Parcialmente completado',
                detail: `${exitosos} archivo(s) subido(s), ${errores} error(es)`
            });
            this.cargarEvidencias(this.ticketSeleccionado!.id!);
        } else if (errores > 0) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: `No se pudo subir ningún archivo (${errores} error(es))`
            });
        }
    }

    private limpiarEstadoModalEvidencias(): void {
        this.archivosEvidenciaSeleccionados = [];
        this.descripcionEvidencia = '';
        this.dialogEvidencia = false;
        if (this.fileUploadEvidencia) {
            this.fileUploadEvidencia.clear();
        }
    }

    /**
     * Elimina una evidencia del ticket
     */
    eliminarEvidencia(evidencia: any): void {
        if (!this.ticketSeleccionado?.id) {
            return;
        }
        this.confirmationService.confirm({
            message: '¿Está seguro de eliminar esta evidencia?',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.ticketsService.deleteEvidencia(this.ticketSeleccionado!.id!, evidencia.id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Evidencia eliminada correctamente'
                        });
                        this.cargarEvidencias(this.ticketSeleccionado!.id!);
                    },
                    error: (error) => {
                        console.error('❌ Error al eliminar evidencia:', error);
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

    onArchivoSeleccionado(event: any): void {
        // Cuando se seleccionan archivos, reemplazar el array completo
        this.archivosEvidenciaSeleccionados = event.currentFiles || event.files || [];
        console.log('📎 Archivos seleccionados:', this.archivosEvidenciaSeleccionados.length);
    }

    onArchivoEliminado(event: any): void {
        // Cuando se remueven archivos desde el componente
        this.archivosEvidenciaSeleccionados = event.currentFiles || event.files || [];
        console.log('📎 Archivos actualizados:', this.archivosEvidenciaSeleccionados.length);
    }

    eliminarArchivoSeleccionado(index: number): void {
        this.archivosEvidenciaSeleccionados.splice(index, 1);
        if (this.fileUploadEvidencia) {
            this.fileUploadEvidencia.files = [...this.archivosEvidenciaSeleccionados];
        }
    }

    limpiarArchivosEvidencia(): void {
        this.archivosEvidenciaSeleccionados = [];
        if (this.fileUploadEvidencia) {
            this.fileUploadEvidencia.clear();
        }
    }

    descargarEvidencia(evidencia: EvidenciaTicket): void {
        if (!this.ticketSeleccionado?.id) {
            return;
        }

        if (!evidencia.nombreArchivo) {
            window.open(evidencia.archivoUrl, '_blank');
            return;
        }

        this.ticketsService.downloadEvidencia(this.ticketSeleccionado.id, evidencia.nombreArchivo).subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = evidencia.nombreOriginal || evidencia.nombreArchivo;
                a.click();
                window.URL.revokeObjectURL(url);
            },
            error: (error) => {
                console.error('❌ Error al descargar evidencia:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo descargar la evidencia'
                });
            }
        });
    }

    private obtenerIconoArchivo(nombre?: string): string {
        if (!nombre) {
            return 'pi pi-file text-gray-500';
        }
        const ext = nombre.toLowerCase().split('.').pop();
        switch (ext) {
            case 'pdf':
                return 'pi pi-file-pdf text-red-500';
            case 'doc':
            case 'docx':
                return 'pi pi-file-word text-blue-500';
            case 'xls':
            case 'xlsx':
                return 'pi pi-file-excel text-green-500';
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'gif':
            case 'webp':
                return 'pi pi-image text-purple-500';
            default:
                return 'pi pi-file text-gray-500';
        }
    }

    private formatearTamano(tamano?: number): string {
        if (!tamano) {
            return '0 Bytes';
        }
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(tamano) / Math.log(k));
        return `${(tamano / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
    }
}