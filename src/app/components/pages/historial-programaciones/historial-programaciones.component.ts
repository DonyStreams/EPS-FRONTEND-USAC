import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ProgramacionesService } from 'src/app/service/programaciones.service';

export interface HistorialProgramacion {
    idHistorial: number;
    idProgramacion: number;
    tipoEvento: string;
    fechaOriginal: string;
    fechaNueva: string | null;
    motivo: string;
    usuarioId: number | null;
    fechaRegistro: string;
    idEjecucion: number | null;
    equipoNombre: string;
    equipoSerie: string;
    tipoMantenimiento: string;
    usuarioNombre: string;
}

@Component({
    selector: 'app-historial-programaciones',
    templateUrl: './historial-programaciones.component.html',
    styleUrls: ['./historial-programaciones.component.scss'],
    providers: [ConfirmationService, MessageService]
})
export class HistorialProgramacionesComponent implements OnInit {
    historial: HistorialProgramacion[] = [];
    registrosSeleccionados: HistorialProgramacion[] = [];
    loading: boolean = false;
    programacionIdFiltro: number | null = null;
    equipoNombreFiltro: string | null = null;

    // Métricas
    metricas = {
        total: 0,
        ejecutados: 0,
        saltados: 0,
        reprogramados: 0,
        porcentajeCumplimiento: 100
    };

    constructor(
        private programacionesService: ProgramacionesService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            if (params['programacionId']) {
                this.programacionIdFiltro = +params['programacionId'];
                this.equipoNombreFiltro = params['equipoNombre'] || null;
            }
            this.loadHistorial();
            this.loadMetricas();
        });
    }

    loadHistorial() {
        this.loading = true;
        this.programacionesService.getHistorialCompleto().subscribe({
            next: (data) => {
                if (this.programacionIdFiltro) {
                    this.historial = data.filter((h: HistorialProgramacion) => h.idProgramacion === this.programacionIdFiltro);
                } else {
                    this.historial = data;
                }
                
                this.loading = false;
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo cargar el historial'
                });
                this.loading = false;
            }
        });
    }

    loadMetricas() {
        this.programacionesService.getMetricasCumplimiento().subscribe({
            next: (data) => {
                this.metricas = data;
            },
            error: (error) => {
            }
        });
    }

    formatDate(date: any): string {
        if (!date) return 'Sin fecha';
        
        try {
            let dateString = date;
            
            if (typeof date === 'string') {
                dateString = date.replace(/\[UTC\]$/, '');
            }
            
            const d = new Date(dateString);
            
            if (isNaN(d.getTime())) {
                return 'Fecha inválida';
            }
            
            return d.toLocaleString('es-GT', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        } catch (error) {
            return 'Error en fecha';
        }
    }

    formatDateOnly(date: any): string {
        if (!date) return 'Sin fecha';
        
        try {
            const d = new Date(date);
            if (isNaN(d.getTime())) return 'Fecha inválida';
            
            return d.toLocaleDateString('es-GT', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch (error) {
            return 'Error';
        }
    }

    getTipoEventoLabel(tipo: string): string {
        const labels: { [key: string]: string } = {
            'CREADO': 'Creado',
            'EDITADO': 'Editado',
            'PAUSADO': 'Pausado',
            'ACTIVADO': 'Activado',
            'EJECUTADO': 'Completado',
            'EJECUTADO_PROGRAMADO': 'Ejecución Programada',
            'SALTADO': 'Descartado',
            'REPROGRAMADO': 'Reprogramado'
        };
        return labels[tipo] || tipo;
    }

    getTipoEventoSeverity(tipo: string): "success" | "secondary" | "info" | "warning" | "danger" | "contrast" | undefined {
        const severities: { [key: string]: "success" | "secondary" | "info" | "warning" | "danger" | "contrast" } = {
            'CREADO': 'info',
            'EDITADO': 'secondary',
            'PAUSADO': 'warning',
            'ACTIVADO': 'success',
            'EJECUTADO': 'success',
            'EJECUTADO_PROGRAMADO': 'info',
            'SALTADO': 'danger',
            'REPROGRAMADO': 'warning'
        };
        return severities[tipo] || 'secondary';
    }

    getTipoEventoIcon(tipo: string): string {
        const icons: { [key: string]: string } = {
            'CREADO': 'pi pi-plus-circle',
            'EDITADO': 'pi pi-pencil',
            'PAUSADO': 'pi pi-pause',
            'ACTIVADO': 'pi pi-play',
            'EJECUTADO': 'pi pi-check-circle',
            'EJECUTADO_PROGRAMADO': 'pi pi-calendar-plus',
            'SALTADO': 'pi pi-forward',
            'REPROGRAMADO': 'pi pi-calendar-plus'
        };
        return icons[tipo] || 'pi pi-circle';
    }

    limpiarFiltro() {
        this.programacionIdFiltro = null;
        this.equipoNombreFiltro = null;
        this.loadHistorial();
    }

    eliminarSeleccionados() {
        if (!this.registrosSeleccionados || this.registrosSeleccionados.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Selecciona al menos un registro para eliminar'
            });
            return;
        }

        this.confirmationService.confirm({
            message: `¿Estás seguro de que deseas eliminar ${this.registrosSeleccionados.length} registro(s) del historial?`,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.procesarEliminacionMasiva();
            }
        });
    }

    private procesarEliminacionMasiva() {
        this.loading = true;
        const idsAEliminar = this.registrosSeleccionados.map(r => r.idHistorial);
        
        this.programacionesService.deleteHistorialMultiple(idsAEliminar).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: `${this.registrosSeleccionados.length} registro(s) eliminado(s) correctamente`
                });
                
                this.registrosSeleccionados = [];
                this.loadHistorial();
                this.loadMetricas();
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al eliminar los registros seleccionados'
                });
                this.loading = false;
            }
        });
    }
}
