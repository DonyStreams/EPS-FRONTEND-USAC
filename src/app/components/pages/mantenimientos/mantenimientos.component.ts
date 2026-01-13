import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { CalendarOptions, EventClickArg, DateSelectArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { ProgramacionesService, ProgramacionMantenimiento } from 'src/app/service/programaciones.service';
import { EjecucionesService, EjecucionMantenimiento } from 'src/app/service/ejecuciones.service';
import { ContratosService } from 'src/app/service/contratos.service';

interface ContratoCalendario {
    id: number;
    descripcion: string;
    proveedor?: { nombre?: string };
    equipos?: any[];
}

interface CalendarEvent {
    id: string;
    title: string;
    start: Date | string;
    end?: Date | string;
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    extendedProps?: {
        tipo: 'programacion';
        tipoMantenimiento?: string;
        equipoNombre?: string;
        proveedorNombre?: string;
        contratoDescripcion?: string;
        frecuencia?: string;
        idProgramacion?: number;
        idContrato?: number;
        idEquipo?: number;
    };
}

@Component({
    selector: 'app-mantenimientos',
    templateUrl: './mantenimientos.component.html',
    providers: [MessageService]
})
export class MantenimientosComponent implements OnInit {

    calendarOptions: CalendarOptions = {};
    events: CalendarEvent[] = [];
    
    programaciones: ProgramacionMantenimiento[] = [];
    contratos: ContratoCalendario[] = [];
    
    loading = false;
    
    // Dialog para ver detalle
    showDetailDialog = false;
    selectedEvent: CalendarEvent | null = null;
    
    // Dialog para crear ejecucion
    showCreateDialog = false;
    selectedDate: Date | null = null;
    nuevaEjecucion: Partial<EjecucionMantenimiento> = {};
    equiposContrato: any[] = [];
    
    // Filtros por tipo de mantenimiento
    filtroTipo: string = 'todos';
    tiposFiltro = [
        { label: 'Todos los tipos', value: 'todos' },
        { label: 'Preventivo', value: 'PREVENTIVO' },
        { label: 'Correctivo', value: 'CORRECTIVO' },
        { label: 'Calibración', value: 'CALIBRACION' },
        { label: 'Otros', value: 'OTROS' }
    ];

    constructor(
        private programacionesService: ProgramacionesService,
        private ejecucionesService: EjecucionesService,
        private contratosService: ContratosService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.initCalendar();
        this.loadData();
    }

    private initCalendar(): void {
        this.calendarOptions = {
            plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
            initialView: 'dayGridMonth',
            locale: esLocale,
            headerToolbar: {
                left: 'prev,today,next',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek'
            },
            buttonText: {
                today: 'Hoy',
                month: 'Mes',
                week: 'Semana'
            },
            editable: false,
            selectable: true,
            selectMirror: true,
            dayMaxEvents: 3,
            weekends: true,
            events: [],
            eventClick: this.handleEventClick.bind(this),
            select: this.handleDateSelect.bind(this),
            height: 'auto',
            aspectRatio: 1.8
        };
    }

    private loadData(): void {
        this.loading = true;
        
        // Cargar programaciones (solo estas se muestran en el calendario)
        this.programacionesService.getAll().subscribe({
            next: (data) => {
                this.programaciones = data || [];
                console.log('📅 Programaciones cargadas:', this.programaciones.length);
                this.generateEvents();
                this.loading = false;
            },
            error: (err) => {
                console.error('Error cargando programaciones:', err);
                this.generateEvents();
                this.loading = false;
            }
        });

        // Cargar contratos para crear ejecuciones desde el calendario
        this.contratosService.getAll().subscribe({
            next: (data) => {
                this.contratos = (data || []).map((c: any) => ({
                    id: c.id || c.idContrato,
                    descripcion: c.descripcion,
                    proveedor: c.proveedor,
                    equipos: c.equipos || []
                }));
                console.log('📋 Contratos cargados:', this.contratos.length);
            },
            error: (err) => {
                console.error('Error cargando contratos:', err);
            }
        });
    }

    private generateEvents(): void {
        const eventos: CalendarEvent[] = [];
        const hoy = new Date();
        const unAnioAtras = new Date(hoy.getFullYear() - 1, hoy.getMonth(), hoy.getDate());
        const unAnioAdelante = new Date(hoy.getFullYear() + 1, hoy.getMonth(), hoy.getDate());

        console.log('🔄 Generando eventos del calendario...');
        console.log('📅 Programaciones activas:', this.programaciones.filter(p => p.activa).length);

        // Generar eventos solo de programaciones (cuándo toca el mantenimiento)
        this.programaciones.forEach(prog => {
            if (prog.activa && prog.fechaProximoMantenimiento) {
                const eventosRecurrentes = this.generarEventosRecurrentes(prog, unAnioAtras, unAnioAdelante);
                eventos.push(...eventosRecurrentes);
            }
        });

        this.events = eventos;
        console.log('📊 Total eventos en calendario:', this.events.length);
        this.applyFilter();
    }

    private generarEventosRecurrentes(prog: ProgramacionMantenimiento, desde: Date, hasta: Date): CalendarEvent[] {
        const eventos: CalendarEvent[] = [];
        const frecuenciaDias = prog.frecuenciaDias || 30;
        
        if (!frecuenciaDias || !prog.fechaProximoMantenimiento) return eventos;

        // Parsear la fecha que viene como string del backend
        let fechaProxima: Date;
        const fechaOriginal = prog.fechaProximoMantenimiento as any;
        
        if (typeof fechaOriginal === 'string') {
            // Limpiar el formato "[UTC]" si existe
            const fechaLimpia = fechaOriginal.replace('[UTC]', '');
            fechaProxima = new Date(fechaLimpia);
        } else if (fechaOriginal instanceof Date) {
            fechaProxima = fechaOriginal;
        } else {
            fechaProxima = new Date(fechaOriginal);
        }

        // Validar que la fecha sea válida
        if (isNaN(fechaProxima.getTime())) {
            console.warn(`⚠️ Fecha inválida en programación ${prog.idProgramacion}:`, prog.fechaProximoMantenimiento);
            return eventos;
        }

        let fecha = new Date(fechaProxima);
        
        console.log(`📅 Generando eventos para programación ${prog.idProgramacion} desde ${fecha.toISOString()}`);
        
        // Retroceder para mostrar programaciones pasadas
        while (fecha > desde) {
            fecha = new Date(fecha.getTime() - frecuenciaDias * 24 * 60 * 60 * 1000);
        }
        fecha = new Date(fecha.getTime() + frecuenciaDias * 24 * 60 * 60 * 1000);

        // Generar eventos hacia adelante
        let contadorEventos = 0;
        const tipoMantenimientoNombre = prog.tipoMantenimiento?.nombre || '';
        const colores = this.getColorByTipoMantenimiento(tipoMantenimientoNombre);
        
        while (fecha <= hasta) {
            const equipoNombre = prog.equipo?.nombre || 'Equipo';
            const proveedorNombre = prog.contrato?.proveedor?.nombre || '';
            const contratoDesc = prog.contrato?.descripcion || '';
            
            eventos.push({
                id: `prog-${prog.idProgramacion}-${fecha.getTime()}`,
                title: `${equipoNombre}`,
                start: new Date(fecha),
                backgroundColor: colores.bg,
                borderColor: colores.border,
                textColor: '#ffffff',
                extendedProps: {
                    tipo: 'programacion',
                    tipoMantenimiento: tipoMantenimientoNombre,
                    equipoNombre: equipoNombre,
                    proveedorNombre: proveedorNombre,
                    contratoDescripcion: contratoDesc,
                    frecuencia: this.getFrecuenciaLabel(frecuenciaDias),
                    idProgramacion: prog.idProgramacion,
                    idContrato: prog.contratoId,
                    idEquipo: prog.equipoId
                }
            });
            contadorEventos++;
            fecha = new Date(fecha.getTime() + frecuenciaDias * 24 * 60 * 60 * 1000);
        }

        console.log(`  ✅ Generó ${contadorEventos} eventos para programación ${prog.idProgramacion}`);
        return eventos;
    }

    private getFrecuenciaLabel(dias: number): string {
        if (dias <= 1) return 'DIARIO';
        if (dias <= 7) return 'SEMANAL';
        if (dias <= 15) return 'QUINCENAL';
        if (dias <= 30) return 'MENSUAL';
        if (dias <= 60) return 'BIMESTRAL';
        if (dias <= 90) return 'TRIMESTRAL';
        if (dias <= 180) return 'SEMESTRAL';
        return 'ANUAL';
    }

    private getColorByEstado(estado?: string): string {
        switch (estado?.toUpperCase()) {
            case 'PROGRAMADO': return '#f59e0b';
            case 'EN_PROCESO': return '#3b82f6';
            case 'COMPLETADO': return '#22c55e';
            case 'CANCELADO': return '#ef4444';
            default: return '#6b7280';
        }
    }

    private getColorByTipoMantenimiento(tipo?: string): { bg: string; border: string } {
        const tipoUpper = tipo?.toUpperCase() || '';
        if (tipoUpper.includes('PREVENTIVO')) {
            return { bg: '#22c55e', border: '#16a34a' }; // Verde
        } else if (tipoUpper.includes('CORRECTIVO')) {
            return { bg: '#ef4444', border: '#dc2626' }; // Rojo
        } else if (tipoUpper.includes('CALIBRACION') || tipoUpper.includes('CALIBRACIÓN')) {
            return { bg: '#3b82f6', border: '#2563eb' }; // Azul
        } else {
            return { bg: '#6366f1', border: '#4f46e5' }; // Morado (Otros)
        }
    }

    getTipoMantenimientoColor(tipo?: string): string {
        return this.getColorByTipoMantenimiento(tipo).bg;
    }

    handleEventClick(info: EventClickArg): void {
        const event = info.event;
        this.selectedEvent = {
            id: event.id,
            title: event.title,
            start: event.start || new Date(),
            backgroundColor: event.backgroundColor || '',
            extendedProps: event.extendedProps as any
        };
        this.showDetailDialog = true;
    }

    handleDateSelect(info: DateSelectArg): void {
        this.selectedDate = info.start;
        this.nuevaEjecucion = {
            fechaEjecucion: info.start,
            estado: 'PROGRAMADO'
        };
        this.showCreateDialog = true;
    }

    crearEjecucionManual(): void {
        this.selectedDate = new Date();
        this.nuevaEjecucion = {
            fechaEjecucion: new Date(),
            estado: 'PROGRAMADO'
        };
        this.showCreateDialog = true;
    }

    applyFilter(): void {
        let filteredEvents = [...this.events];
        
        if (this.filtroTipo !== 'todos') {
            // Filtrar por tipo de mantenimiento
            filteredEvents = this.events.filter(e => {
                const tipoMant = e.extendedProps?.tipoMantenimiento?.toUpperCase() || '';
                
                if (this.filtroTipo === 'OTROS') {
                    // "Otros" = todo lo que NO sea Preventivo, Correctivo o Calibración
                    return !tipoMant.includes('PREVENTIVO') && 
                           !tipoMant.includes('CORRECTIVO') && 
                           !tipoMant.includes('CALIBRACION') &&
                           !tipoMant.includes('CALIBRACIÓN');
                }
                return tipoMant.includes(this.filtroTipo);
            });
        }

        this.calendarOptions = {
            ...this.calendarOptions,
            events: filteredEvents
        };
    }

    onFilterChange(): void {
        this.applyFilter();
    }

    closeDetailDialog(): void {
        this.showDetailDialog = false;
        this.selectedEvent = null;
    }

    closeCreateDialog(): void {
        this.showCreateDialog = false;
        this.selectedDate = null;
        this.nuevaEjecucion = {};
        this.equiposContrato = [];
    }

    onContratoChange(): void {
        if (this.nuevaEjecucion.idContrato) {
            const contrato = this.contratos.find(c => c.id === this.nuevaEjecucion.idContrato);
            this.equiposContrato = contrato?.equipos || [];
            this.nuevaEjecucion.idEquipo = undefined;
        } else {
            this.equiposContrato = [];
        }
    }

    crearEjecucion(): void {
        if (!this.nuevaEjecucion.idContrato || !this.nuevaEjecucion.idEquipo) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Campos requeridos',
                detail: 'Seleccione un contrato y un equipo'
            });
            return;
        }

        this.ejecucionesService.create(this.nuevaEjecucion as any).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Exito',
                    detail: 'Ejecucion creada correctamente'
                });
                this.closeCreateDialog();
                this.loadData();
            },
            error: (err) => {
                console.error('Error al crear ejecucion:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo crear la ejecucion'
                });
            }
        });
    }

    crearDesdeProgamacion(): void {
        if (!this.selectedEvent?.extendedProps) return;
        
        const props = this.selectedEvent.extendedProps;
        this.nuevaEjecucion = {
            idContrato: props.idContrato,
            idEquipo: props.idEquipo,
            idProgramacion: props.idProgramacion, // Vincular con programación
            fechaEjecucion: this.selectedEvent.start as Date,
            estado: 'PROGRAMADO'
        };
        
        if (props.idContrato) {
            const contrato = this.contratos.find(c => c.id === props.idContrato);
            this.equiposContrato = contrato?.equipos || [];
        }
        
        this.closeDetailDialog();
        this.showCreateDialog = true;
    }

    formatDate(date: Date | string | null | undefined): string {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('es-GT', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    refreshCalendar(): void {
        this.loadData();
        this.messageService.add({
            severity: 'info',
            summary: 'Actualizado',
            detail: 'Calendario actualizado'
        });
    }
}
