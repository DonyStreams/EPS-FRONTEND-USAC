import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HistorialEquipo, HistorialEquiposService } from 'src/app/service/historial-equipos.service';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
    selector: 'app-historial-tickets',
    templateUrl: './historial-tickets.component.html',
    styleUrls: ['./historial-tickets.component.scss'],
    providers: [ConfirmationService, MessageService]
})
export class HistorialTicketsComponent implements OnInit {
    historial: HistorialEquipo[] = [];
    registrosSeleccionados: HistorialEquipo[] = [];
    loading: boolean = false;
    equipoIdFiltro: number | null = null;
    equipoNombreFiltro: string | null = null;

    constructor(
        private historialService: HistorialEquiposService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        // Obtener parámetros de la URL
        this.route.queryParams.subscribe(params => {
            if (params['equipoId']) {
                this.equipoIdFiltro = +params['equipoId'];
                this.equipoNombreFiltro = params['equipoNombre'] || null;
            }
            this.loadHistorial();
        });
    }

    loadHistorial() {
        this.loading = true;
        // Usar el nuevo método que solo trae historial de tickets
        this.historialService.getTicketsHistory().subscribe({
            next: (data) => {
                console.log('📋 Datos del historial de tickets recibidos:', data);
                
                // Filtrar por equipo si hay un filtro activo
                if (this.equipoIdFiltro) {
                    this.historial = data.filter(h => h.idEquipo === this.equipoIdFiltro);
                    console.log(`🔍 Filtrado ${this.historial.length} registros para equipo ID ${this.equipoIdFiltro}`);
                } else {
                    this.historial = data;
                }
                
                this.loading = false;
            },
            error: (error) => {
                console.error('Error al cargar historial de tickets:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo cargar el historial de tickets'
                });
                this.loading = false;
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
                console.error('Fecha inválida:', date);
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
            console.error('Error al formatear fecha:', date, error);
            return 'Error en fecha';
        }
    }

    deleteHistorial(historial: HistorialEquipo) {
        if (confirm(`¿Está seguro de eliminar este registro del historial?`)) {
            this.historialService.delete(historial.idHistorial!).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Registro eliminado correctamente'
                    });
                    this.loadHistorial();
                },
                error: (error) => {
                    console.error('Error al eliminar:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudo eliminar el registro'
                    });
                }
            });
        }
    }

    getTipoCambioLabel(tipoCambio: string | undefined): string {
        if (!tipoCambio) return 'Ticket';
        
        const labels: { [key: string]: string } = {
            'TICKET_CREADO': 'Ticket Creado',
            'TICKET_RESUELTO': 'Ticket Resuelto',
            'TICKET_ESTADO': 'Cambio de Estado',
            'TICKET_EVIDENCIA': 'Evidencia Agregada',
            'TICKET_PRIORIDAD': 'Cambio de Prioridad',
            'TICKET_ASIGNADO': 'Asignación'
        };
        
        return labels[tipoCambio] || tipoCambio;
    }

    getTipoCambioSeverity(tipoCambio: string | undefined): string {
        if (!tipoCambio) return 'info';
        
        const severities: { [key: string]: string } = {
            'TICKET_CREADO': 'warning',
            'TICKET_RESUELTO': 'success',
            'TICKET_ESTADO': 'info',
            'TICKET_EVIDENCIA': 'secondary',
            'TICKET_PRIORIDAD': 'danger',
            'TICKET_ASIGNADO': 'primary'
        };
        
        return severities[tipoCambio] || 'info';
    }

    getTipoCambioIcon(tipoCambio: string | undefined): string {
        if (!tipoCambio) return 'pi pi-ticket';
        
        const icons: { [key: string]: string } = {
            'TICKET_CREADO': 'pi pi-exclamation-triangle',
            'TICKET_RESUELTO': 'pi pi-check-circle',
            'TICKET_ESTADO': 'pi pi-sync',
            'TICKET_EVIDENCIA': 'pi pi-paperclip',
            'TICKET_PRIORIDAD': 'pi pi-flag',
            'TICKET_ASIGNADO': 'pi pi-user'
        };
        
        return icons[tipoCambio] || 'pi pi-ticket';
    }

    limpiarFiltro() {
        this.equipoIdFiltro = null;
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
        const idsAEliminar = this.registrosSeleccionados.map(r => r.idHistorial!);
        
        this.historialService.deleteMultiple(idsAEliminar).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: `${this.registrosSeleccionados.length} registro(s) eliminado(s) correctamente`
                });
                
                this.registrosSeleccionados = [];
                this.loadHistorial();
            },
            error: (error) => {
                console.error('Error al eliminar registros:', error);
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
