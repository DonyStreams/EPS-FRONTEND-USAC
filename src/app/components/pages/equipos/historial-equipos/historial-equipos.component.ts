import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HistorialEquipo, HistorialEquiposService } from 'src/app/service/historial-equipos.service';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
    selector: 'app-historial-equipos',
    templateUrl: './historial-equipos.component.html',
    styleUrls: ['./historial-equipos.component.scss'],
    providers: [ConfirmationService, MessageService]
})
export class HistorialEquiposComponent implements OnInit {
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
        this.historialService.getAll().subscribe({
            next: (data) => {
                console.log('📋 Datos del historial recibidos:', data);
                if (data && data.length > 0) {
                    console.log('Ejemplo de registro:', data[0]);
                    console.log('Tipo de cambio del primer registro:', data[0].tipoCambio);
                    console.log('Tipo de tipoCambio:', typeof data[0].tipoCambio);
                }
                
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
                console.error('Error al cargar historial:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo cargar el historial'
                });
                this.loading = false;
            }
        });
    }

    formatDate(date: any): string {
        if (!date) return 'Sin fecha';
        
        try {
            let dateString = date;
            
            // Si es string, limpiar el formato [UTC] que viene del backend
            if (typeof date === 'string') {
                // Remover [UTC] si existe
                dateString = date.replace(/\[UTC\]$/, '');
            }
            
            const d = new Date(dateString);
            
            // Verificar si la fecha es válida
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
        console.log('getTipoCambioLabel llamado con:', tipoCambio);
        if (!tipoCambio) return 'General';
        
        const labels: { [key: string]: string } = {
            'CREACION': 'Creación',
            'EDICION_GENERAL': 'Edición',
            'CAMBIO_IMAGEN': 'Imagen',
            'CAMBIO_UBICACION': 'Ubicación',
            'CAMBIO_ESTADO': 'Estado',
            'MANTENIMIENTO': 'Mantenimiento',
            'CALIBRACION': 'Calibración',
            'REPARACION': 'Reparación'
        };
        
        const label = labels[tipoCambio] || tipoCambio;
        console.log('Retornando label:', label);
        return label;
    }

    getTipoCambioSeverity(tipoCambio: string | undefined): string {
        if (!tipoCambio) return 'info';
        
        const severities: { [key: string]: string } = {
            'CREACION': 'success',
            'EDICION_GENERAL': 'info',
            'CAMBIO_IMAGEN': 'warning',
            'CAMBIO_UBICACION': 'warning',
            'CAMBIO_ESTADO': 'danger',
            'MANTENIMIENTO': 'success',
            'CALIBRACION': 'success',
            'REPARACION': 'danger'
        };
        
        return severities[tipoCambio] || 'info';
    }

    getTipoCambioIcon(tipoCambio: string | undefined): string {
        if (!tipoCambio) return 'pi pi-circle';
        
        const icons: { [key: string]: string } = {
            'CREACION': 'pi pi-plus-circle',
            'EDICION_GENERAL': 'pi pi-pencil',
            'CAMBIO_IMAGEN': 'pi pi-image',
            'CAMBIO_UBICACION': 'pi pi-map-marker',
            'CAMBIO_ESTADO': 'pi pi-info-circle',
            'MANTENIMIENTO': 'pi pi-wrench',
            'CALIBRACION': 'pi pi-cog',
            'REPARACION': 'pi pi-shield'
        };
        
        return icons[tipoCambio] || 'pi pi-circle';
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
        
        // Llamar al servicio para eliminar múltiples registros
        this.historialService.deleteMultiple(idsAEliminar).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: `${this.registrosSeleccionados.length} registro(s) eliminado(s) correctamente`
                });
                
                // Limpiar selección y recargar
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
