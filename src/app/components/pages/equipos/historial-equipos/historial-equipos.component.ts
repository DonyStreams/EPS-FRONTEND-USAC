import { Component, OnInit } from '@angular/core';
import { HistorialEquipo, HistorialEquiposService } from 'src/app/service/historial-equipos.service';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-historial-equipos',
    templateUrl: './historial-equipos.component.html',
    styleUrls: ['./historial-equipos.component.scss']
})
export class HistorialEquiposComponent implements OnInit {
    historial: HistorialEquipo[] = [];
    loading: boolean = false;

    constructor(
        private historialService: HistorialEquiposService,
        private messageService: MessageService
    ) { }

    ngOnInit() {
        this.loadHistorial();
    }

    loadHistorial() {
        this.loading = true;
        this.historialService.getAll().subscribe({
            next: (data) => {
                console.log('📋 Datos del historial recibidos:', data);
                if (data && data.length > 0) {
                    console.log('Ejemplo de registro:', data[0]);
                }
                this.historial = data;
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
        
        return labels[tipoCambio] || tipoCambio;
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
}
