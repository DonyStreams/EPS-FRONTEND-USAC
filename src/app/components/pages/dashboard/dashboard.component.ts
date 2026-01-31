import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Subscription, debounceTime, forkJoin } from 'rxjs';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { AlertasService, DashboardAlertas, AlertaMantenimiento } from '../../../service/alertas.service';
import { EquiposService } from '../../../service/equipos.service';
import { TicketsService, Ticket } from '../../../service/tickets.service';
import { ContratosService, Contrato } from '../../../service/contratos.service';
import { EjecucionesService, EjecucionMantenimiento } from '../../../service/ejecuciones.service';
import { AreasService, Area } from '../../../service/areas.service';
import { TiposMantenimientoService, TipoMantenimiento } from '../../../service/tipos-mantenimiento.service';
import { ProveedoresService, Proveedor } from '../../../service/proveedores.service';
import { Equipo } from '../../../api/equipos';

@Component({
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

    items!: MenuItem[];
    subscription!: Subscription;
    loading: boolean = true;

    // === KPIs PRINCIPALES ===
    totalProgramaciones: number = 0;
    totalVencidas: number = 0;
    totalAlertas: number = 0;
    equiposActivos: number = 0;
    equiposCriticos: number = 0;
    equiposInactivos: number = 0;
    ticketsAbiertos: number = 0;
    ticketsEnProceso: number = 0;
    ticketsResueltos: number = 0;
    ticketsCriticos: number = 0;
    contratosActivos: number = 0;
    contratosPorVencer: number = 0;
    contratosVencidos: number = 0;
    proveedoresActivos: number = 0;
    ejecucionesCompletadas: number = 0;
    ejecucionesPendientes: number = 0;

    // === DATOS RAW ===
    dashboardAlertas: DashboardAlertas | null = null;
    equipos: Equipo[] = [];
    tickets: Ticket[] = [];
    contratos: Contrato[] = [];
    ejecuciones: EjecucionMantenimiento[] = [];
    areas: Area[] = [];
    tiposMantenimiento: TipoMantenimiento[] = [];
    proveedores: Proveedor[] = [];
    alertasRecientes: AlertaMantenimiento[] = [];

    // === GRÁFICOS ===
    equiposPorAreaData: any;
    equiposPorAreaOptions: any;
    
    ticketsPorPrioridadData: any;
    ticketsPorPrioridadOptions: any;
    
    ticketsPorEstadoData: any;
    ticketsPorEstadoOptions: any;
    
    ejecucionesPorEstadoData: any;
    ejecucionesPorEstadoOptions: any;
    
    tendenciaMantenimientosData: any;
    tendenciaMantenimientosOptions: any;
    
    equiposPorEstadoData: any;
    equiposPorEstadoOptions: any;

    contratosPorEstadoData: any;
    contratosPorEstadoOptions: any;

    constructor(
        public layoutService: LayoutService,
        private alertasService: AlertasService,
        private equiposService: EquiposService,
        private ticketsService: TicketsService,
        private contratosService: ContratosService,
        private ejecucionesService: EjecucionesService,
        private areasService: AreasService,
        private tiposMantenimientoService: TiposMantenimientoService,
        private proveedoresService: ProveedoresService
    ) {
        this.subscription = this.layoutService.configUpdate$
            .pipe(debounceTime(25))
            .subscribe(() => {
                this.initChartOptions();
                this.updateAllCharts();
            });
    }

    ngOnInit() {
        this.initChartOptions();
        this.loadAllData();

        this.items = [
            { label: 'Nuevo Equipo', icon: 'pi pi-fw pi-plus', routerLink: ['/administracion/equipos'] },
            { label: 'Programar Mantenimiento', icon: 'pi pi-fw pi-calendar-plus', routerLink: ['/administracion/programaciones/nuevo'] },
            { label: 'Ver Alertas', icon: 'pi pi-fw pi-exclamation-triangle', routerLink: ['/administracion/programaciones'] },
            { label: 'Crear Ticket', icon: 'pi pi-fw pi-ticket', routerLink: ['/administracion/tickets'], queryParams: { action: 'nuevo' } },
            { label: 'Ver Contratos', icon: 'pi pi-fw pi-file', routerLink: ['/administracion/contratos'] },
            { label: 'Ejecuciones', icon: 'pi pi-fw pi-check-circle', routerLink: ['/administracion/ejecuciones'] }
        ];
    }

    loadAllData(): void {
        this.loading = true;
        
        forkJoin({
            dashboard: this.alertasService.getDashboard(),
            equipos: this.equiposService.getEquipos({}),
            tickets: this.ticketsService.getAll(),
            contratos: this.contratosService.getAll(),
            ejecuciones: this.ejecucionesService.getAll(),
            areas: this.areasService.getAll(),
            tiposMantenimiento: this.tiposMantenimientoService.getAll(),
            proveedores: this.proveedoresService.getActivos()
        }).subscribe({
            next: (data) => {
                // Guardar datos raw
                this.dashboardAlertas = data.dashboard;
                this.equipos = data.equipos;
                this.tickets = data.tickets;
                this.contratos = data.contratos;
                this.ejecuciones = data.ejecuciones;
                this.areas = data.areas;
                this.tiposMantenimiento = data.tiposMantenimiento;
                this.proveedores = data.proveedores;

                // Calcular KPIs
                this.calculateKPIs();
                
                // Actualizar gráficos
                this.updateAllCharts();
                
                this.loading = false;
            },
            error: (error) => {
                console.error('Error al cargar datos del dashboard:', error);
                this.loading = false;
            }
        });
    }

    calculateKPIs(): void {
        // Alertas
        if (this.dashboardAlertas) {
            this.totalProgramaciones = this.dashboardAlertas.total_programaciones_activas;
            this.totalVencidas = this.dashboardAlertas.total_vencidas;
            this.totalAlertas = this.dashboardAlertas.total_alertas;
            this.alertasRecientes = [
                ...(this.dashboardAlertas.vencidas || []),
                ...(this.dashboardAlertas.alertas || [])
            ].slice(0, 5);
        }

        // Equipos
        this.equiposActivos = this.equipos.filter(e => e.estado === 'Activo').length;
        this.equiposCriticos = this.equipos.filter(e => e.estado === 'Critico').length;
        this.equiposInactivos = this.equipos.filter(e => e.estado === 'Inactivo').length;

        // Tickets
        this.ticketsAbiertos = this.tickets.filter(t => t.estado === 'Abierto' || t.estado === 'Asignado').length;
        this.ticketsEnProceso = this.tickets.filter(t => t.estado === 'En Proceso').length;
        this.ticketsResueltos = this.tickets.filter(t => t.estado === 'Resuelto' || t.estado === 'Cerrado').length;
        this.ticketsCriticos = this.tickets.filter(t => t.prioridad === 'Crítica' && t.estado !== 'Cerrado').length;

        // Contratos - Calcular vigentes, por vencer y vencidos
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0); // Normalizar a inicio del día
        const treintaDias = new Date();
        treintaDias.setDate(treintaDias.getDate() + 30);
        treintaDias.setHours(23, 59, 59, 999);
        
        // Función para parsear fechas del backend (quitar [UTC] si existe)
        const parseFecha = (fechaRaw: any): Date | null => {
            if (!fechaRaw) return null;
            // Quitar [UTC] del final si existe
            const fechaLimpia = String(fechaRaw).replace(/\[UTC\]$/, '');
            const fecha = new Date(fechaLimpia);
            return isNaN(fecha.getTime()) ? null : fecha;
        };
        
        // Contratos vencidos: fecha_fin < hoy
        this.contratosVencidos = this.contratos.filter((c: any) => {
            const fechaFin = parseFecha(c.fechaFin || c.fecha_fin);
            if (!fechaFin) return false;
            const fechaFinNorm = new Date(fechaFin);
            fechaFinNorm.setHours(23, 59, 59, 999);
            return fechaFinNorm < hoy;
        }).length;
        
        // Contratos por vencer: fecha_fin está entre hoy y 30 días
        this.contratosPorVencer = this.contratos.filter((c: any) => {
            const fechaFin = parseFecha(c.fechaFin || c.fecha_fin);
            if (!fechaFin) return false;
            const fechaFinNorm = new Date(fechaFin);
            fechaFinNorm.setHours(0, 0, 0, 0);
            return fechaFinNorm >= hoy && fechaFinNorm <= treintaDias;
        }).length;
        
        // Contratos vigentes: TODOS los contratos no vencidos (fecha_fin >= hoy)
        this.contratosActivos = this.contratos.filter((c: any) => {
            const fechaFin = parseFecha(c.fechaFin || c.fecha_fin);
            if (!fechaFin) return false;
            const fechaFinNorm = new Date(fechaFin);
            fechaFinNorm.setHours(23, 59, 59, 999);
            return fechaFinNorm >= hoy;
        }).length;

        // Ejecuciones
        this.ejecucionesCompletadas = this.ejecuciones.filter(e => e.estado === 'COMPLETADO').length;
        this.ejecucionesPendientes = this.ejecuciones.filter(e => e.estado === 'PROGRAMADO' || e.estado === 'EN_PROCESO').length;

        // Proveedores
        this.proveedoresActivos = this.proveedores.length;
    }

    initChartOptions(): void {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        // Opciones para gráficos de barras
        this.equiposPorAreaOptions = {
            maintainAspectRatio: false,
            aspectRatio: 1.2,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary,
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary,
                        stepSize: 1
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                }
            }
        };

        // Opciones para gráficos de donut/pie
        const pieOptions = {
            maintainAspectRatio: false,
            aspectRatio: 1.2,
            plugins: {
                legend: {
                    labels: {
                        color: textColor,
                        usePointStyle: true,
                        padding: 15
                    },
                    position: 'bottom'
                }
            }
        };

        this.ticketsPorPrioridadOptions = { ...pieOptions };
        this.ticketsPorEstadoOptions = { ...pieOptions };
        this.ejecucionesPorEstadoOptions = { ...pieOptions };
        this.equiposPorEstadoOptions = { ...pieOptions };
        this.contratosPorEstadoOptions = { ...pieOptions };

        // Opciones para gráfico de líneas
        this.tendenciaMantenimientosOptions = {
            maintainAspectRatio: false,
            aspectRatio: 2,
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary,
                        stepSize: 1
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                }
            }
        };
    }

    updateAllCharts(): void {
        const documentStyle = getComputedStyle(document.documentElement);

        // === Equipos por Área ===
        const equiposPorArea = this.areas.map(area => ({
            nombre: area.nombre,
            cantidad: this.equipos.filter(e => e.idArea === area.idArea).length
        })).filter(a => a.cantidad > 0);

        this.equiposPorAreaData = {
            labels: equiposPorArea.map(a => a.nombre.length > 15 ? a.nombre.substring(0, 15) + '...' : a.nombre),
            datasets: [{
                data: equiposPorArea.map(a => a.cantidad),
                backgroundColor: [
                    documentStyle.getPropertyValue('--blue-500'),
                    documentStyle.getPropertyValue('--green-500'),
                    documentStyle.getPropertyValue('--yellow-500'),
                    documentStyle.getPropertyValue('--cyan-500'),
                    documentStyle.getPropertyValue('--pink-500'),
                    documentStyle.getPropertyValue('--indigo-500'),
                    documentStyle.getPropertyValue('--teal-500'),
                    documentStyle.getPropertyValue('--orange-500')
                ],
                borderColor: documentStyle.getPropertyValue('--surface-border'),
                borderWidth: 1
            }]
        };

        // === Equipos por Estado ===
        this.equiposPorEstadoData = {
            labels: ['Activo', 'Inactivo', 'Crítico'],
            datasets: [{
                data: [this.equiposActivos, this.equiposInactivos, this.equiposCriticos],
                backgroundColor: [
                    documentStyle.getPropertyValue('--green-500'),
                    documentStyle.getPropertyValue('--gray-500'),
                    documentStyle.getPropertyValue('--red-500')
                ],
                hoverBackgroundColor: [
                    documentStyle.getPropertyValue('--green-400'),
                    documentStyle.getPropertyValue('--gray-400'),
                    documentStyle.getPropertyValue('--red-400')
                ]
            }]
        };

        // === Tickets por Prioridad ===
        const ticketsBaja = this.tickets.filter(t => t.prioridad === 'Baja').length;
        const ticketsMedia = this.tickets.filter(t => t.prioridad === 'Media').length;
        const ticketsAlta = this.tickets.filter(t => t.prioridad === 'Alta').length;
        const ticketsCritica = this.tickets.filter(t => t.prioridad === 'Crítica').length;

        this.ticketsPorPrioridadData = {
            labels: ['Baja', 'Media', 'Alta', 'Crítica'],
            datasets: [{
                data: [ticketsBaja, ticketsMedia, ticketsAlta, ticketsCritica],
                backgroundColor: [
                    documentStyle.getPropertyValue('--green-500'),
                    documentStyle.getPropertyValue('--yellow-500'),
                    documentStyle.getPropertyValue('--orange-500'),
                    documentStyle.getPropertyValue('--red-500')
                ],
                hoverBackgroundColor: [
                    documentStyle.getPropertyValue('--green-400'),
                    documentStyle.getPropertyValue('--yellow-400'),
                    documentStyle.getPropertyValue('--orange-400'),
                    documentStyle.getPropertyValue('--red-400')
                ]
            }]
        };

        // === Tickets por Estado ===
        const ticketsAbiertosCount = this.tickets.filter(t => t.estado === 'Abierto').length;
        const ticketsAsignadosCount = this.tickets.filter(t => t.estado === 'Asignado').length;
        const ticketsEnProcesoCount = this.tickets.filter(t => t.estado === 'En Proceso').length;
        const ticketsResueltosCount = this.tickets.filter(t => t.estado === 'Resuelto').length;
        const ticketsCerradosCount = this.tickets.filter(t => t.estado === 'Cerrado').length;

        this.ticketsPorEstadoData = {
            labels: ['Abierto', 'Asignado', 'En Proceso', 'Resuelto', 'Cerrado'],
            datasets: [{
                data: [ticketsAbiertosCount, ticketsAsignadosCount, ticketsEnProcesoCount, ticketsResueltosCount, ticketsCerradosCount],
                backgroundColor: [
                    documentStyle.getPropertyValue('--blue-500'),
                    documentStyle.getPropertyValue('--cyan-500'),
                    documentStyle.getPropertyValue('--yellow-500'),
                    documentStyle.getPropertyValue('--green-500'),
                    documentStyle.getPropertyValue('--gray-500')
                ],
                hoverBackgroundColor: [
                    documentStyle.getPropertyValue('--blue-400'),
                    documentStyle.getPropertyValue('--cyan-400'),
                    documentStyle.getPropertyValue('--yellow-400'),
                    documentStyle.getPropertyValue('--green-400'),
                    documentStyle.getPropertyValue('--gray-400')
                ]
            }]
        };

        // === Ejecuciones por Estado ===
        const ejProgramadas = this.ejecuciones.filter(e => e.estado === 'PROGRAMADO').length;
        const ejEnProceso = this.ejecuciones.filter(e => e.estado === 'EN_PROCESO').length;
        const ejCompletadas = this.ejecuciones.filter(e => e.estado === 'COMPLETADO').length;
        const ejCanceladas = this.ejecuciones.filter(e => e.estado === 'CANCELADO').length;

        this.ejecucionesPorEstadoData = {
            labels: ['Programado', 'En Proceso', 'Completado', 'Cancelado'],
            datasets: [{
                data: [ejProgramadas, ejEnProceso, ejCompletadas, ejCanceladas],
                backgroundColor: [
                    documentStyle.getPropertyValue('--blue-500'),
                    documentStyle.getPropertyValue('--yellow-500'),
                    documentStyle.getPropertyValue('--green-500'),
                    documentStyle.getPropertyValue('--red-500')
                ],
                hoverBackgroundColor: [
                    documentStyle.getPropertyValue('--blue-400'),
                    documentStyle.getPropertyValue('--yellow-400'),
                    documentStyle.getPropertyValue('--green-400'),
                    documentStyle.getPropertyValue('--red-400')
                ]
            }]
        };

        // === Contratos por Estado (Vigencia) ===
        this.contratosPorEstadoData = {
            labels: ['Vigentes', 'Por Vencer (30d)', 'Vencidos'],
            datasets: [{
                data: [this.contratosActivos, this.contratosPorVencer, this.contratosVencidos],
                backgroundColor: [
                    documentStyle.getPropertyValue('--green-500'),
                    documentStyle.getPropertyValue('--orange-500'),
                    documentStyle.getPropertyValue('--red-500')
                ],
                hoverBackgroundColor: [
                    documentStyle.getPropertyValue('--green-400'),
                    documentStyle.getPropertyValue('--orange-400'),
                    documentStyle.getPropertyValue('--red-400')
                ]
            }]
        };

        // === Tendencia de Ejecuciones por Mes (últimos 6 meses) ===
        this.tendenciaMantenimientosData = this.calcularTendenciaEjecuciones();
    }

    calcularTendenciaEjecuciones(): any {
        const documentStyle = getComputedStyle(document.documentElement);
        const meses: string[] = [];
        const completados: number[] = [];
        const programados: number[] = [];
        
        const hoy = new Date();
        
        // Función para parsear fechas quitando [UTC]
        const parseFecha = (fechaRaw: any): Date | null => {
            if (!fechaRaw) return null;
            const fechaLimpia = String(fechaRaw).replace(/\[UTC\]$/, '');
            const fecha = new Date(fechaLimpia);
            return isNaN(fecha.getTime()) ? null : fecha;
        };
        
        for (let i = 5; i >= 0; i--) {
            const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
            const mesNombre = fecha.toLocaleDateString('es-GT', { month: 'short', year: '2-digit' });
            meses.push(mesNombre);
            
            const mesInicio = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
            const mesFin = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
            mesFin.setHours(23, 59, 59, 999);
            
            // Completados: usar fecha_cierre o fechaCierre
            const completadosMes = this.ejecuciones.filter((e: any) => {
                const fechaCierre = parseFecha(e.fechaCierre || e.fecha_cierre);
                if (!fechaCierre) return false;
                return (e.estado === 'COMPLETADO' || e.estado === 'Completado') && 
                       fechaCierre >= mesInicio && fechaCierre <= mesFin;
            }).length;
            
            // Programados: usar fecha_ejecucion o fechaEjecucion
            const programadosMes = this.ejecuciones.filter((e: any) => {
                const fechaEjecucion = parseFecha(e.fechaEjecucion || e.fecha_ejecucion);
                if (!fechaEjecucion) return false;
                return fechaEjecucion >= mesInicio && fechaEjecucion <= mesFin;
            }).length;
            
            completados.push(completadosMes);
            programados.push(programadosMes);
        }

        return {
            labels: meses,
            datasets: [
                {
                    label: 'Programados',
                    data: programados,
                    fill: false,
                    backgroundColor: documentStyle.getPropertyValue('--blue-500'),
                    borderColor: documentStyle.getPropertyValue('--blue-500'),
                    tension: 0.4
                },
                {
                    label: 'Completados',
                    data: completados,
                    fill: false,
                    backgroundColor: documentStyle.getPropertyValue('--green-500'),
                    borderColor: documentStyle.getPropertyValue('--green-500'),
                    tension: 0.4
                }
            ]
        };
    }

    getAlertaSeverity(alerta: any): string {
        const dias = this.calcularDiasRestantes(alerta);
        return dias < 0 ? 'danger' : 'warning';
    }

    getAlertaIcon(alerta: any): string {
        const dias = this.calcularDiasRestantes(alerta);
        return dias < 0 ? 'pi-times-circle' : 'pi-exclamation-triangle';
    }

    getAlertaEstado(alerta: any): string {
        const dias = this.calcularDiasRestantes(alerta);
        return dias < 0 ? 'VENCIDO' : 'ALERTA';
    }

    calcularDiasRestantes(alerta: any): number {
        // Intentar obtener fecha del campo correspondiente
        const fechaRaw = alerta.fechaProximoMantenimiento || alerta.fecha_proximo_mantenimiento;
        if (!fechaRaw) return 0;
        
        // Limpiar [UTC] si existe
        const fechaLimpia = String(fechaRaw).replace(/\[UTC\]$/, '');
        const fechaProximo = new Date(fechaLimpia);
        
        if (isNaN(fechaProximo.getTime())) return 0;
        
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        fechaProximo.setHours(0, 0, 0, 0);
        
        const diffTime = fechaProximo.getTime() - hoy.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    }

    formatDiasRestantes(alerta: any): string {
        const dias = this.calcularDiasRestantes(alerta);
        if (dias < 0) {
            return `Vencido hace ${Math.abs(dias)} día(s)`;
        } else if (dias === 0) {
            return 'Vence hoy';
        } else {
            return `${dias} día(s) restante(s)`;
        }
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
