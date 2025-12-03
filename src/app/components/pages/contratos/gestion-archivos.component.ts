import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ContratoService, Contrato } from '../../../service/contrato.service';
import { ArchivosService, ArchivoResponse } from '../../../service/archivos.service';

interface ArchivoContrato {
    id: number;
    nombreOriginal: string;
    nombreSistema: string;
    tipoDocumento: string;
    tamano: number;
    tipoMime: string;
    fechaSubida: string;
    iconoCss?: string;
    tamanoFormateado?: string;
}

@Component({
    selector: 'app-gestion-archivos',
    templateUrl: './gestion-archivos.component.html',
    styleUrls: ['./gestion-archivos.component.scss']
})
export class GestionArchivosComponent implements OnInit {

    contratos: Contrato[] = [];
    selectedContrato: Contrato | null = null;
    archivos: ArchivoContrato[] = [];
    loading: boolean = false;
    uploadedFiles: File[] = [];
    maxFileSize: number = 10000000; // 10MB

    // Filtros
    filtroTipo: string = '';
    filtroBusqueda: string = '';
    tiposArchivo: any[] = [
        { label: 'Todos', value: '' },
        { label: 'PDF', value: 'PDF' },
        { label: 'DOC', value: 'DOC' },
        { label: 'DOCX', value: 'DOCX' }
    ];

    constructor(
        private contratoService: ContratoService,
        private archivosService: ArchivosService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private route: ActivatedRoute,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.loadContratos();
        
        // Si viene un ID de contrato en la URL, seleccionarlo automáticamente
        this.route.params.subscribe(params => {
            if (params['id']) {
                const contratoId = parseInt(params['id']);
                setTimeout(() => {
                    const contrato = this.contratos.find(c => c.id === contratoId);
                    if (contrato) {
                        this.onContratoChange();
                    }
                }, 500);
            }
        });
    }

    loadContratos(): void {
        this.loading = true;
        this.contratoService.getAll().subscribe({
            next: (contratos) => {
                this.contratos = contratos;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error al cargar contratos:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudieron cargar los contratos'
                });
                this.loading = false;
            }
        });
    }

    onContratoChange(): void {
        if (this.selectedContrato && this.selectedContrato.id) {
            this.loadArchivosContrato(this.selectedContrato.id);
        } else {
            this.archivos = [];
        }
    }

    loadArchivosContrato(contratoId: number): void {
        this.loading = true;
        this.archivosService.getListaArchivosPorContrato(contratoId).subscribe({
            next: (response: any) => {
                this.archivos = response.archivos.map((archivo: any) => ({
                    ...archivo,
                    iconoCss: this.archivosService.getIconoArchivo(archivo.nombreOriginal),
                    tamanoFormateado: this.archivosService.formatearTamano(archivo.tamano)
                }));
                this.loading = false;
            },
            error: (error) => {
                console.error('Error al cargar archivos:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudieron cargar los archivos del contrato'
                });
                this.loading = false;
            }
        });
    }

    // Subida de archivos
    onFileSelect(event: any): void {
        this.uploadedFiles = [...event.files];
        this.messageService.add({
            severity: 'info',
            summary: 'Archivos seleccionados',
            detail: `${event.files.length} archivo(s) seleccionado(s)`
        });
    }

    uploadFiles(): void {
        if (!this.selectedContrato || !this.selectedContrato.id) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Debe seleccionar un contrato primero'
            });
            return;
        }

        if (this.uploadedFiles.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Debe seleccionar al menos un archivo'
            });
            return;
        }

        let archivosSubidos = 0;
        let errores = 0;

        this.uploadedFiles.forEach(file => {
            // Validar tamaño
            if (file.size > this.maxFileSize) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Archivo muy grande',
                    detail: `${file.name}: El archivo debe ser menor a 10MB`
                });
                errores++;
                return;
            }

            // Subir archivo
            this.archivosService.subirArchivo(file, this.selectedContrato!.id!).subscribe({
                next: (response: ArchivoResponse) => {
                    archivosSubidos++;
                    
                    // Si es el último archivo, mostrar resumen y recargar
                    if (archivosSubidos + errores === this.uploadedFiles.length) {
                        this.mostrarResumenSubida(archivosSubidos, errores);
                        if (archivosSubidos > 0) {
                            this.loadArchivosContrato(this.selectedContrato!.id!);
                        }
                    }
                },
                error: (error) => {
                    console.error('Error al subir archivo:', error);
                    errores++;
                    
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error de subida',
                        detail: `Error al subir ${file.name}`
                    });

                    if (archivosSubidos + errores === this.uploadedFiles.length) {
                        this.mostrarResumenSubida(archivosSubidos, errores);
                    }
                }
            });
        });
    }

    private mostrarResumenSubida(exitosos: number, errores: number): void {
        this.uploadedFiles = [];
        
        if (exitosos > 0 && errores === 0) {
            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: `${exitosos} archivo(s) subido(s) correctamente`
            });
        } else if (exitosos > 0 && errores > 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Parcialmente completado',
                detail: `${exitosos} archivo(s) subido(s), ${errores} con errores`
            });
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo subir ningún archivo'
            });
        }
    }

    // Descarga de archivos
    descargarArchivo(archivo: ArchivoContrato): void {
        console.log('📥 Descargando archivo:', archivo.nombreSistema);
        
        this.archivosService.descargarArchivo(archivo.nombreSistema).subscribe({
            next: (blob: Blob) => {
                // Crear un enlace de descarga
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = archivo.nombreOriginal; // Usar el nombre original del archivo
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                
                this.messageService.add({
                    severity: 'success',
                    summary: 'Descarga exitosa',
                    detail: `Archivo ${archivo.nombreOriginal} descargado correctamente`
                });
            },
            error: (error) => {
                console.error('Error al descargar archivo:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error de descarga',
                    detail: `No se pudo descargar el archivo ${archivo.nombreOriginal}`
                });
            }
        });
    }

    // Eliminación de archivos
    confirmarEliminarArchivo(archivo: ArchivoContrato): void {
        this.confirmationService.confirm({
            message: `¿Está seguro de eliminar el archivo "${archivo.nombreOriginal}"?`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.eliminarArchivo(archivo);
            }
        });
    }

    eliminarArchivo(archivo: ArchivoContrato): void {
        this.archivosService.eliminarArchivo(archivo.nombreSistema).subscribe({
            next: (response) => {
                console.log('✅ Archivo eliminado:', response);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Archivo eliminado',
                    detail: `${archivo.nombreOriginal} eliminado correctamente`
                });
                
                // Recargar la lista de archivos
                if (this.selectedContrato && this.selectedContrato.id) {
                    this.loadArchivosContrato(this.selectedContrato.id);
                }
            },
            error: (error) => {
                console.error('❌ Error al eliminar archivo:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: `No se pudo eliminar el archivo: ${error.error?.error || error.message || 'Error desconocido'}`
                });
            }
        });
    }

    // Filtros
    get archivosFiltrados(): ArchivoContrato[] {
        let filtrados = [...this.archivos];

        // Filtrar por tipo
        if (this.filtroTipo) {
            filtrados = filtrados.filter(archivo => archivo.tipoDocumento === this.filtroTipo);
        }

        // Filtrar por búsqueda
        if (this.filtroBusqueda) {
            const busqueda = this.filtroBusqueda.toLowerCase();
            filtrados = filtrados.filter(archivo => 
                archivo.nombreOriginal.toLowerCase().includes(busqueda)
            );
        }

        return filtrados;
    }

    // Navegación
    volverAContratos(): void {
        this.router.navigate(['/administracion/contratos']);
    }

    // Utilidades
    formatDateTime(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}
