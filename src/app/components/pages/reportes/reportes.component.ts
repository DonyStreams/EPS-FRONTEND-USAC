import { Component, OnInit } from '@angular/core';
import { ReportesService } from 'src/app/service/reportes.service';
import { AreasService } from 'src/app/service/areas.service';
import { MessageService } from 'primeng/api';

interface TipoReporte {
    id: string;
    nombre: string;
    descripcion: string;
    icon: string;
    color: string;
}

@Component({
    selector: 'app-reportes',
    templateUrl: './reportes.component.html',
    styleUrls: ['./reportes.component.scss'],
    providers: [MessageService]
})
export class ReportesComponent implements OnInit {
    tiposReportes: TipoReporte[] = [
        {
            id: 'equipos',
            nombre: 'Reporte de Equipos',
            descripcion: 'Listado completo de equipos por área o laboratorio',
            icon: 'pi-desktop',
            color: 'blue'
        },
        {
            id: 'mantenimientos',
            nombre: 'Reporte de Mantenimientos',
            descripcion: 'Mantenimientos ejecutados en un período de tiempo',
            icon: 'pi-wrench',
            color: 'green'
        },
        {
            id: 'contratos',
            nombre: 'Reporte de Contratos',
            descripcion: 'Contratos vigentes, por vencer y vencidos',
            icon: 'pi-file',
            color: 'orange'
        },
        {
            id: 'proveedores',
            nombre: 'Reporte de Proveedores',
            descripcion: 'Listado de proveedores y servicios contratados',
            icon: 'pi-building',
            color: 'purple'
        },
        {
            id: 'programaciones',
            nombre: 'Reporte de Programaciones',
            descripcion: 'Programaciones de mantenimiento activas y próximas',
            icon: 'pi-calendar',
            color: 'cyan'
        },
        {
            id: 'tickets',
            nombre: 'Reporte de Tickets',
            descripcion: 'Tickets de fallas registrados y su estado',
            icon: 'pi-ticket',
            color: 'red'
        }
    ];

    // Todos los reportes disponibles
    reportesDisponibles = ['equipos', 'mantenimientos', 'contratos', 'proveedores', 'programaciones', 'tickets'];

    // Filtros generales
    fechaInicio: Date | null = null;
    fechaFin: Date | null = null;
    areas: any[] = [];
    areaSeleccionada: number | null = null;
    
    // Estado
    generando: boolean = false;
    reporteSeleccionado: string | null = null;

    constructor(
        private reportesService: ReportesService,
        private areasService: AreasService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.cargarAreas();
        // Establecer fechas por defecto (último mes)
        const hoy = new Date();
        this.fechaFin = hoy;
        this.fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth() - 1, hoy.getDate());
    }

    cargarAreas() {
        this.areasService.getAll().subscribe({
            next: (areas) => {
                // Mostrar todas las áreas (activas e inactivas) para reportes
                this.areas = areas;
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudieron cargar las áreas'
                });
            }
        });
    }

    seleccionarReporte(tipoReporte: string) {
        // Solo permitir seleccionar reportes disponibles
        if (this.reportesDisponibles.includes(tipoReporte)) {
            this.reporteSeleccionado = tipoReporte;
        } else {
            this.messageService.add({
                severity: 'info',
                summary: 'En desarrollo',
                detail: 'Este reporte estará disponible próximamente'
            });
        }
    }

    esReporteDisponible(tipoReporte: string): boolean {
        return this.reportesDisponibles.includes(tipoReporte);
    }

    generarReporte(formato: 'pdf' | 'excel') {
        if (!this.reporteSeleccionado) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Seleccione un tipo de reporte'
            });
            return;
        }

        this.generando = true;

        const params = {
            tipo: this.reporteSeleccionado,
            formato: formato,
            fechaInicio: this.fechaInicio,
            fechaFin: this.fechaFin,
            idArea: this.areaSeleccionada
        };

        this.reportesService.generarReporte(params).subscribe({
            next: (blob) => {
                // Determinar extensión correcta
                let extension = '';
                let tipoMime = '';
                
                if (formato === 'pdf') {
                    extension = 'txt';  // Por ahora el backend genera TXT
                    tipoMime = 'text/plain';
                } else {
                    extension = 'csv';  // Excel como CSV
                    tipoMime = 'text/csv';
                }

                // Descargar archivo
                const url = window.URL.createObjectURL(new Blob([blob], { type: tipoMime }));
                const a = document.createElement('a');
                a.href = url;
                a.download = `reporte_${this.reporteSeleccionado}_${new Date().getTime()}.${extension}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Reporte generado correctamente'
                });
                this.generando = false;
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo generar el reporte'
                });
                this.generando = false;
            }
        });
    }

    limpiarFiltros() {
        this.fechaInicio = null;
        this.fechaFin = null;
        this.areaSeleccionada = null;
        this.reporteSeleccionado = null;
    }
}
