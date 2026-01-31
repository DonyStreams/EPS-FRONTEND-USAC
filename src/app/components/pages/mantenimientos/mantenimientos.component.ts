import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
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
        contratoFechaFin?: Date | string;
        contratoVencido?: boolean;
        frecuencia?: string;
        idProgramacion?: number;
        idContrato?: number;
        idEquipo?: number;
        esUnico?: boolean;
    };
}

@Component({
    selector: 'app-mantenimientos',
    templateUrl: './mantenimientos.component.html',
    providers: [MessageService, ConfirmationService]
})
export class MantenimientosComponent implements OnInit {

    /**
     * Determina si un evento está vencido (fecha anterior a hoy)
     */
    isEventoVencido(event: any): boolean {
        if (!event?.start) {
            return false;
        }
        const fecha = new Date(event.start);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        return fecha < hoy;
    }

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

    // Estadísticas del dashboard
    stats = {
        totalProgramados: 0,
        proximos7Dias: 0,
        vencidos: 0,
        esteMes: 0,
        porTipo: {
            preventivo: 0,
            correctivo: 0,
            calibracion: 0,
            otros: 0
        }
    };

    constructor(
        private programacionesService: ProgramacionesService,
        private ejecucionesService: EjecucionesService,
        private contratosService: ContratosService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.initCalendar();
        this.loadData();
    }

    private initCalendar(): void {
        this.calendarOptions = {
            plugins: [dayGridPlugin, interactionPlugin],
            initialView: 'dayGridMonth',
            locale: esLocale,
            headerToolbar: {
                left: 'prev,today,next',
                center: 'title',
                right: 'dayGridMonth'
            },
            buttonText: {
                today: 'Hoy',
                month: 'Mes'
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
        hoy.setHours(0, 0, 0, 0);
        // Mostrar eventos: 3 meses atrás y hasta la fecha de fin de contrato (o 6 meses si no hay contrato)
        const tresMesesAtras = new Date(hoy.getFullYear(), hoy.getMonth() - 3, hoy.getDate());

        console.log('🔄 Generando eventos del calendario...');
        console.log('📅 Programaciones activas:', this.programaciones.filter(p => p.activa).length);

        // Generar eventos solo de programaciones ACTIVAS (las pausadas no se muestran)
        this.programaciones.forEach(prog => {
            if (prog.activa && prog.fechaProximoMantenimiento) {
                // Verificar si el contrato está vencido para usar color diferente
                const contratoVencido = this.isContratoVencido(prog);
                if (contratoVencido) {
                    console.log(`⚠️ Programación ${prog.idProgramacion}: contrato vencido (se mostrará con color gris)`);
                }
                // Determinar el límite superior: fecha de fin de contrato si existe, si no, 6 meses adelante
                let fechaLimiteSuperior: Date;
                if (prog.contrato?.fechaFin) {
                    const fechaFinContrato = this.parsearFecha(prog.contrato.fechaFin);
                    fechaLimiteSuperior = fechaFinContrato && !isNaN(fechaFinContrato.getTime()) ? fechaFinContrato : new Date(hoy.getFullYear(), hoy.getMonth() + 6, hoy.getDate());
                } else {
                    fechaLimiteSuperior = new Date(hoy.getFullYear(), hoy.getMonth() + 6, hoy.getDate());
                }
                const eventosRecurrentes = this.generarEventosRecurrentes(prog, tresMesesAtras, fechaLimiteSuperior, contratoVencido);
                eventos.push(...eventosRecurrentes);
            }
        });

        this.events = eventos;
        console.log('📊 Total eventos en calendario:', this.events.length);
        
        // Calcular estadísticas
        this.calcularEstadisticas();
        
        this.applyFilter();
    }

    /**
     * Calcula las estadísticas del dashboard
     */
    private calcularEstadisticas(): void {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        const en7Dias = new Date(hoy);
        en7Dias.setDate(en7Dias.getDate() + 7);
        
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

        // Resetear estadísticas
        const programacionesActivas = this.programaciones.filter(p => p.activa).length;
        
        this.stats = {
            totalProgramados: programacionesActivas,
            proximos7Dias: 0,
            vencidos: 0,
            esteMes: 0,
            porTipo: {
                preventivo: 0,
                correctivo: 0,
                calibracion: 0,
                otros: 0
            }
        };

        this.events.forEach(evento => {
            const fechaEvento = new Date(evento.start);
            fechaEvento.setHours(0, 0, 0, 0);
            
            // Próximos 7 días
            if (fechaEvento >= hoy && fechaEvento <= en7Dias) {
                this.stats.proximos7Dias++;
            }
            
            // Vencidos (antes de hoy)
            if (fechaEvento < hoy) {
                this.stats.vencidos++;
            }
            
            // Este mes
            if (fechaEvento >= inicioMes && fechaEvento <= finMes) {
                this.stats.esteMes++;
            }
            
            // Por tipo
            const tipo = evento.extendedProps?.tipoMantenimiento?.toUpperCase() || '';
            if (tipo.includes('PREVENTIVO')) {
                this.stats.porTipo.preventivo++;
            } else if (tipo.includes('CORRECTIVO')) {
                this.stats.porTipo.correctivo++;
            } else if (tipo.includes('CALIBRACION') || tipo.includes('CALIBRACIÓN')) {
                this.stats.porTipo.calibracion++;
            } else {
                this.stats.porTipo.otros++;
            }
        });

        console.log('📊 Estadísticas calculadas:', this.stats);
    }

    private generarEventosRecurrentes(prog: ProgramacionMantenimiento, desde: Date, hasta: Date, contratoVencido: boolean = false): CalendarEvent[] {
        const eventos: CalendarEvent[] = [];
        const frecuenciaDias = prog.frecuenciaDias;
        const esUnico = frecuenciaDias === 0;
        
        // Si no tiene fecha próxima, no generar eventos
        if (!prog.fechaProximoMantenimiento) return eventos;
        
        // Si es programación única (frecuencia 0), generar solo un evento
        if (esUnico) {
            return this.generarEventoUnico(prog, desde, hasta, contratoVencido);
        }
        
        // Si frecuencia es null/undefined, usar 30 como default
        const frecuencia = frecuenciaDias || 30;

        // Determinar la fecha de inicio real de la programación
        // Usar fechaUltimoMantenimiento o fechaCreacion como punto de partida
        let fechaInicioProgramacion: Date | null = null;
        
        if (prog.fechaUltimoMantenimiento) {
            fechaInicioProgramacion = this.parsearFecha(prog.fechaUltimoMantenimiento);
        } else if (prog.fechaCreacion) {
            fechaInicioProgramacion = this.parsearFecha(prog.fechaCreacion);
        }

        // Parsear la fecha del próximo mantenimiento
        const fechaProxima = this.parsearFecha(prog.fechaProximoMantenimiento);

        // Validar que la fecha sea válida
        if (!fechaProxima || isNaN(fechaProxima.getTime())) {
            console.warn(`⚠️ Fecha inválida en programación ${prog.idProgramacion}:`, prog.fechaProximoMantenimiento);
            return eventos;
        }

        // 🔑 LÍMITE MÁXIMO: Usar la fecha de fin del contrato si existe
        let fechaLimiteContrato: Date | null = null;
        if (prog.contrato?.fechaFin) {
            fechaLimiteContrato = this.parsearFecha(prog.contrato.fechaFin);
            console.log(`   📜 Contrato vigente hasta: ${fechaLimiteContrato?.toLocaleDateString('es-GT')}`);
        }
        
        // El límite superior es el menor entre: hasta (6 meses) y fechaFin del contrato
        let fechaLimiteSuperior = hasta;
        if (fechaLimiteContrato && fechaLimiteContrato < hasta) {
            fechaLimiteSuperior = fechaLimiteContrato;
        }

        // El punto de partida para generar eventos es:
        // - La fecha del próximo mantenimiento (para mostrar el evento más cercano)
        // - O desde el último mantenimiento si queremos mostrar el historial real
        let fechaBase = new Date(fechaProxima);
        
        // Si hay fecha de inicio de programación, no generar eventos antes de esa fecha
        const fechaLimiteInferior = fechaInicioProgramacion || fechaProxima;
        
        console.log(`📅 Generando eventos para programación ${prog.idProgramacion}`);
        console.log(`   📌 Fecha próximo mantenimiento: ${fechaProxima.toLocaleDateString('es-GT')}`);
        console.log(`   📌 Límite inferior: ${fechaLimiteInferior.toLocaleDateString('es-GT')}`);
        console.log(`   📌 Límite superior (contrato/6meses): ${fechaLimiteSuperior.toLocaleDateString('es-GT')}`);

        // Generar eventos solo hacia adelante desde la fecha próxima
        // Y opcionalmente hacia atrás pero solo hasta la fecha del último mantenimiento
        let fecha = new Date(fechaProxima);
        
        // Retroceder solo si hay un último mantenimiento registrado, y solo hasta esa fecha
        if (prog.fechaUltimoMantenimiento && fechaInicioProgramacion) {
            // Mostrar desde el último mantenimiento hacia adelante
            fecha = new Date(fechaInicioProgramacion);
            // Avanzar una frecuencia ya que el último mantenimiento ya fue ejecutado
            fecha = new Date(fecha.getTime() + frecuencia * 24 * 60 * 60 * 1000);
        }

        // Si la fecha calculada es anterior a "desde" (rango visible), ajustar
        while (fecha < desde && fecha < fechaLimiteSuperior) {
            fecha = new Date(fecha.getTime() + frecuencia * 24 * 60 * 60 * 1000);
        }

        // Generar eventos hacia adelante (hasta fecha fin de contrato o límite de visualización)
        let contadorEventos = 0;
        const tipoMantenimientoNombre = prog.tipoMantenimiento?.nombre || '';
        
        // Si el contrato está vencido, usar color gris; si no, usar color según tipo
        const colores = contratoVencido 
            ? { bg: '#6c757d', border: '#495057' }  // Gris para contrato vencido
            : this.getColorByTipoMantenimiento(tipoMantenimientoNombre);
        
        while (fecha <= fechaLimiteSuperior) {
            const equipoNombre = prog.equipo?.nombre || 'Equipo';
            const proveedorNombre = prog.contrato?.proveedor?.nombre || '';
            const contratoDesc = prog.contrato?.descripcion || '';
            // Determinar si el evento está vencido (antes de hoy)
            const hoy = new Date(); hoy.setHours(0,0,0,0);
            const esVencido = fecha < hoy;
            // Si está vencido, usar color gris y agregar texto/icono de vencido
            let colorEvento = colores;
            let textColor = '#ffffff';
            let icono = '';
            let titulo = equipoNombre;
            if (esVencido) {
                icono = '⚠️ ';
                titulo = `${icono}${equipoNombre}`;
            } else if (contratoVencido) {
                icono = '⚠️ ';
                titulo = `${icono}${equipoNombre}`;
            }
            eventos.push({
                id: `prog-${prog.idProgramacion}-${fecha.getTime()}`,
                title: titulo,
                start: new Date(fecha),
                backgroundColor: colorEvento.bg,
                borderColor: colorEvento.border,
                textColor: textColor,
                extendedProps: {
                    tipo: 'programacion',
                    tipoMantenimiento: tipoMantenimientoNombre,
                    equipoNombre: equipoNombre,
                    proveedorNombre: proveedorNombre,
                    contratoDescripcion: contratoDesc,
                    contratoFechaFin: prog.contrato?.fechaFin,
                    contratoVencido: contratoVencido,
                    frecuencia: this.getFrecuenciaLabel(frecuencia),
                    idProgramacion: prog.idProgramacion,
                    idContrato: prog.contratoId,
                    idEquipo: prog.equipoId
                }
            });
            contadorEventos++;
            fecha = new Date(fecha.getTime() + frecuencia * 24 * 60 * 60 * 1000);
        }

        console.log(`  ✅ Generó ${contadorEventos} eventos para programación ${prog.idProgramacion}`);
        return eventos;
    }

    /**
     * Genera un único evento para programaciones de tipo único (frecuenciaDias = 0)
     * Solo muestra el evento si la fecha próxima está dentro del rango visible
     */
    private generarEventoUnico(prog: any, desde: Date, hasta: Date, contratoVencido: boolean = false): any[] {
        const eventos: any[] = [];
        
        const fechaProxima = this.parsearFecha(prog.fechaProximoMantenimiento);
        if (!fechaProxima) {
            console.warn(`⚠️ Programación única ${prog.idProgramacion} sin fecha próxima válida`);
            return eventos;
        }

        // Solo mostrar si está en el rango visible
        if (fechaProxima < desde || fechaProxima > hasta) {
            console.log(`📅 Programación única ${prog.idProgramacion} fuera del rango visible`);
            return eventos;
        }

        const tipoMantenimientoNombre = prog.tipoMantenimiento?.nombre || '';
        // Si el contrato está vencido, usar color gris; si no, usar color según tipo
        let colores = contratoVencido 
            ? { bg: '#6c757d', border: '#495057' }  // Gris para contrato vencido
            : this.getColorByTipoMantenimiento(tipoMantenimientoNombre);
        const equipoNombre = prog.equipo?.nombre || 'Equipo';
        const proveedorNombre = prog.contrato?.proveedor?.nombre || '';
        const contratoDesc = prog.contrato?.descripcion || '';
        const hoy = new Date(); hoy.setHours(0,0,0,0);
        const esVencido = fechaProxima < hoy;
        let textColor = '#ffffff';
        let icono = '';
        let titulo = `${equipoNombre} (Único)`;
        if (esVencido) {
            icono = '⚠️ ';
            titulo = `${icono}${equipoNombre} (Único)`;
        } else if (contratoVencido) {
            icono = '⚠️ ';
            titulo = `${icono}${equipoNombre} (Único)`;
        }
        eventos.push({
            id: `prog-${prog.idProgramacion}-unico`,
            title: titulo,
            start: new Date(fechaProxima),
            backgroundColor: colores.bg,
            borderColor: colores.border,
            textColor: textColor,
            extendedProps: {
                tipo: 'programacion',
                tipoMantenimiento: tipoMantenimientoNombre,
                equipoNombre: equipoNombre,
                proveedorNombre: proveedorNombre,
                contratoDescripcion: contratoDesc,
                contratoVencido: contratoVencido,
                frecuencia: 'ÚNICO',
                idProgramacion: prog.idProgramacion,
                idContrato: prog.contratoId,
                idEquipo: prog.equipoId,
                esUnico: true
            }
        });

        console.log(`✅ Evento único generado para programación ${prog.idProgramacion} en fecha ${fechaProxima.toLocaleDateString()}`);
        return eventos;
    }

    /**
     * Parsea una fecha del backend evitando problemas de timezone.
     * Las fechas del backend vienen en formato YYYY-MM-DD o ISO y deben interpretarse
     * como hora local, no UTC.
     */
    private parsearFecha(fecha: any): Date | null {
        if (!fecha) return null;
        
        let fechaParsed: Date;
        
        if (typeof fecha === 'string') {
            // Limpiar el formato "[UTC]" si existe
            const fechaLimpia = fecha.replace('[UTC]', '').trim();
            
            // Si es formato YYYY-MM-DD (sin hora), parsearlo manualmente para evitar UTC
            const soloFechaMatch = fechaLimpia.match(/^(\d{4})-(\d{2})-(\d{2})$/);
            if (soloFechaMatch) {
                const [, year, month, day] = soloFechaMatch;
                // Crear fecha en hora local (mes es 0-indexado)
                fechaParsed = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
            } 
            // Si tiene formato ISO con T pero sin timezone explícito, extraer solo la fecha
            else if (fechaLimpia.includes('T') && !fechaLimpia.includes('+') && !fechaLimpia.includes('Z')) {
                const parteFecha = fechaLimpia.split('T')[0];
                const [year, month, day] = parteFecha.split('-').map(Number);
                fechaParsed = new Date(year, month - 1, day, 12, 0, 0);
            }
            // Si tiene Z o timezone explícito, parsear normalmente pero ajustar
            else {
                const tempDate = new Date(fechaLimpia);
                // Extraer componentes y crear fecha local
                fechaParsed = new Date(
                    tempDate.getUTCFullYear(),
                    tempDate.getUTCMonth(),
                    tempDate.getUTCDate(),
                    12, 0, 0
                );
            }
        } else if (fecha instanceof Date) {
            fechaParsed = fecha;
        } else {
            fechaParsed = new Date(fecha);
        }
        
        return isNaN(fechaParsed.getTime()) ? null : fechaParsed;
    }

    /**
     * Verifica si el contrato de una programación está vencido
     */
    private isContratoVencido(prog: any): boolean {
        if (!prog.contrato?.fechaFin) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const fechaFin = this.parsearFecha(prog.contrato.fechaFin);
        if (!fechaFin) return false;
        fechaFin.setHours(0, 0, 0, 0);
        return fechaFin < today;
    }

    private getFrecuenciaLabel(dias: number): string {
        if (dias === 0) return 'ÚNICO';
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
        // Formatear fecha como YYYY-MM-DD en zona local (sin conversión UTC)
        const fecha = info.start;
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        const fechaSeleccionada = `${year}-${month}-${day}`;
        
        // Formatear fecha para mostrar al usuario
        const fechaMostrar = fecha.toLocaleDateString('es-GT', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        console.log('📅 Fecha seleccionada en calendario:', fechaSeleccionada);
        
        // Preguntar al usuario si desea crear una nueva programación
        this.confirmationService.confirm({
            message: `<div class="text-center">
                <i class="pi pi-calendar-plus text-5xl text-primary mb-3"></i>
                <p class="mb-2">¿Desea crear una nueva <strong>programación de mantenimiento</strong> para esta fecha?</p>
                <p class="text-lg font-semibold text-primary">${fechaMostrar}</p>
                <p class="text-sm text-500 mt-3">Se le redirigirá al formulario de programaciones con la fecha ya seleccionada.</p>
            </div>`,
            header: 'Nueva Programación',
            icon: 'pi pi-calendar-plus',
            acceptLabel: 'Sí, crear programación',
            rejectLabel: 'Cancelar',
            acceptIcon: 'pi pi-check',
            rejectIcon: 'pi pi-times',
            acceptButtonStyleClass: 'p-button-success',
            rejectButtonStyleClass: 'p-button-text',
            accept: () => {
                // Redirigir a programaciones con la fecha pre-llenada
                this.router.navigate(['/administracion/programaciones'], {
                    queryParams: { 
                        nuevaProgramacion: true,
                        fechaProximoMantenimiento: fechaSeleccionada
                    }
                });
            }
        });
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

    /**
     * Navega a la vista de programaciones filtrando por el equipo seleccionado
     */
    verProgramacion(): void {
        if (!this.selectedEvent?.extendedProps) return;

        const props = this.selectedEvent.extendedProps;
        const idEquipo = props.idEquipo;
        const equipoNombre = props.equipoNombre;
        const tipoMantenimiento = props.tipoMantenimiento;
        const idProgramacion = props.idProgramacion;

        this.closeDetailDialog();

        // Navegar a programaciones con filtro por equipo, tipo de mantenimiento e id de programación
        const queryParams: any = {};
        if (idEquipo) {
            queryParams.equipoId = idEquipo;
            queryParams.equipoNombre = equipoNombre;
        }
        if (tipoMantenimiento) {
            queryParams.tipoMantenimiento = tipoMantenimiento;
        }
        if (idProgramacion) {
            queryParams.idProgramacion = idProgramacion;
        }
        this.router.navigate(['/administracion/programaciones'], { queryParams });
    }

    crearDesdeProgamacion(): void {
        if (!this.selectedEvent?.extendedProps) return;
        
        const props = this.selectedEvent.extendedProps;
        const idProgramacion = props.idProgramacion;
        
        if (!idProgramacion) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Esta programación no tiene un identificador válido'
            });
            return;
        }

        const equipoNombre = props.equipoNombre || 'el equipo';
        const tipoMantenimiento = props.tipoMantenimiento || 'N/A';
        const fechaProgramada = this.formatDate(this.selectedEvent.start);

        this.confirmationService.confirm({
            message: `<div class="mb-3">
                <p><strong>Equipo:</strong> ${equipoNombre}</p>
                <p><strong>Tipo:</strong> ${tipoMantenimiento}</p>
                <p><strong>Fecha programada:</strong> ${fechaProgramada}</p>
                <p class="mt-3">¿Crear ejecución de mantenimiento para este equipo?</p>
            </div>`,
            header: 'Confirmar Ejecución',
            icon: 'pi pi-play',
            accept: () => {
                this.loading = true;
                this.closeDetailDialog();
                
                this.programacionesService.crearMantenimiento(idProgramacion).subscribe({
                    next: (response) => {
                        console.log('📝 Respuesta crearMantenimiento:', response);
                        const idEjecucion = response?.idEjecucion || response?.id;
                        console.log('🆔 ID Ejecución obtenido:', idEjecucion);
                        this.messageService.add({
                            severity: 'success',
                            summary: '✓ Ejecución Creada',
                            detail: `Se registró exitosamente la ejecución para ${equipoNombre}`,
                            life: 3000,
                            sticky: false
                        });
                        
                        // Confirmar si desea ver la ejecución (mostrar inmediatamente)
                        setTimeout(() => {
                            this.confirmationService.confirm({
                                message: `<div class="p-3">
                                    <p class="text-lg mb-3">✓ Ejecución de mantenimiento creada exitosamente</p>
                                    <p class="text-600">¿Deseas ver los detalles de la ejecución ahora?</p>
                                </div>`,
                                header: 'Ejecución Creada',
                                icon: 'pi pi-check-circle',
                                acceptLabel: 'Ver Ejecución',
                                rejectLabel: 'Cerrar',
                                acceptButtonStyleClass: 'p-button-success',
                                rejectButtonStyleClass: 'p-button-text',
                                accept: () => {
                                    console.log('🚀 Navegando a ejecuciones con ID:', idEjecucion);
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
                        
                        this.loadData();
                    },
                    error: (error) => {
                        console.error('❌ Error creando ejecución:', error);
                        this.loading = false;
                        const detail = error?.error?.message || error?.error || 'No se pudo crear la ejecución';
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

    formatDateShort(date: Date | string | null | undefined): string {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('es-GT', {
            year: 'numeric',
            month: 'short',
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
