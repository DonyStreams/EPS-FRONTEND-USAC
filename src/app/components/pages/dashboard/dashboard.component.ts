import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Product } from '../../../demo/api/product';
import { ProductService } from '../../../demo/service/product.service';
import { Subscription, debounceTime } from 'rxjs';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { AlertasService, DashboardAlertas } from '../../../service/alertas.service';
import { ProgramacionesService } from '../../../service/programaciones.service';
import { EquiposService } from '../../../service/equipos.service';

@Component({
    templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {

    items!: MenuItem[];
    products!: Product[];
    chartData: any;
    chartOptions: any;
    subscription!: Subscription;

    // Indicadores clave (KPIs) - ACTUALIZADOS
    totalProgramaciones: number = 0;
    totalVencidas: number = 0;
    totalAlertas: number = 0;
    equiposActivos: number = 0;
    ticketsAbiertos: number = 0;
    mantenimientosDelMes: number = 0;
    contratosActivos: number = 0;
    contratosPorVencer: number = 0;
    
    // Dashboard de alertas
    dashboardAlertas: DashboardAlertas | null = null;

    // Datos para gráficos sugeridos
    equiposPorAreaChartData: any = {}; // Gráfico de barras/donut de equipos por área
    mantenimientosPorTipoChartData: any = {}; // Gráfico donut de mantenimientos por tipo
    ticketsPorPrioridadChartData: any = {}; // Gráfico de barras de tickets por prioridad
    mantenimientosPorFechaChartData: any = {}; // Gráfico de líneas de mantenimientos por fecha

    // Opciones para los gráficos (puedes reutilizar chartOptions si lo deseas)
    equiposPorAreaChartOptions: any = {};
    mantenimientosPorTipoChartOptions: any = {};
    ticketsPorPrioridadChartOptions: any = {};
    mantenimientosPorFechaChartOptions: any = {};

    constructor(
        private productService: ProductService, 
        public layoutService: LayoutService,
        private alertasService: AlertasService,
        private programacionesService: ProgramacionesService,
        private equiposService: EquiposService
    ) {
        this.subscription = this.layoutService.configUpdate$
        .pipe(debounceTime(25))
        .subscribe((config) => {
            this.initChart();
        });
    }

    ngOnInit() {
        this.initChart();
        this.loadDashboardData();

        this.productService.getProductsSmall().then(data => this.products = data);

        this.items = [
            { label: 'Nuevo Equipo', icon: 'pi pi-fw pi-plus', routerLink: ['/administracion/equipos'] },
            { label: 'Programar Mantenimiento', icon: 'pi pi-fw pi-calendar-plus', routerLink: ['/administracion/programaciones/nuevo'] },
            { label: 'Ver Alertas', icon: 'pi pi-fw pi-exclamation-triangle', routerLink: ['/administracion/programaciones'] },
            { label: 'Crear Ticket', icon: 'pi pi-fw pi-ticket', routerLink: ['/administracion/tickets/nuevo'] }
        ];
    }

    loadDashboardData(): void {
        // Cargar dashboard de alertas
        this.alertasService.getDashboard().subscribe({
            next: (dashboard) => {
                this.dashboardAlertas = dashboard;
                this.totalProgramaciones = dashboard.total_programaciones_activas;
                this.totalVencidas = dashboard.total_vencidas;
                this.totalAlertas = dashboard.total_alertas;
            },
            error: (error) => {
                console.error('Error al cargar dashboard de alertas:', error);
            }
        });

        // Cargar estadísticas de equipos
        this.equiposService.getEquipos({}).subscribe({
            next: (equipos) => {
                this.equiposActivos = equipos.length;
            },
            error: (error) => {
                console.error('Error al cargar equipos:', error);
            }
        });
    }

    initChart() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        this.chartData = {
            labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio'],
            datasets: [
                {
                    label: 'Mantenimientos Programados',
                    data: [12, 19, 15, 25, 22, 18, 20],
                    fill: false,
                    backgroundColor: documentStyle.getPropertyValue('--bluegray-700'),
                    borderColor: documentStyle.getPropertyValue('--bluegray-700'),
                    tension: .4
                },
                {
                    label: 'Mantenimientos Ejecutados',
                    data: [10, 16, 12, 20, 18, 15, 17],
                    fill: false,
                    backgroundColor: documentStyle.getPropertyValue('--green-600'),
                    borderColor: documentStyle.getPropertyValue('--green-600'),
                    tension: .4
                }
            ]
        };

        this.chartOptions = {
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
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                }
            }
        };
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
