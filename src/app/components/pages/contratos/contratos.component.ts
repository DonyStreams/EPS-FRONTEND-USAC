import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ContratoService, Contrato, EstadisticasContratos } from '../../../service/contrato.service';
import { ProveedoresService, Proveedor } from '../../../service/proveedores.service';

@Component({
    selector: 'app-contratos',
    templateUrl: './contratos.component.html',
    providers: [MessageService, ConfirmationService]
})
export class ContratosComponent implements OnInit {
    
    contratos: Contrato[] = [];
    proveedores: Proveedor[] = [];
    
    displayDialog: boolean = false;
    displayFileDialog: boolean = false;
    contratoForm: FormGroup;
    selectedContrato: Contrato | null = null;
    isEditing: boolean = false;
    loading: boolean = false;
    
    // Opciones de frecuencia
    frecuenciaOptions = [
        { label: 'Mensual', value: 'mensual' },
        { label: 'Bimestral', value: 'bimestral' },
        { label: 'Trimestral', value: 'trimestral' },
        { label: 'Semestral', value: 'semestral' },
        { label: 'Anual', value: 'anual' },
        { label: 'A Demanda', value: 'a_demanda' }
    ];
    
    // Estadísticas
    stats: EstadisticasContratos = {
        total: 0,
        vigentes: 0,
        porVencer: 0,
        vencidos: 0,
        inactivos: 0
    };
    
    // Archivos
    uploadedFiles: any[] = [];
    maxFileSize: number = 10000000; // 10MB
    
    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private contratoService: ContratoService,
        private proveedoresService: ProveedoresService
    ) {
        this.contratoForm = this.createForm();
    }
    
    ngOnInit(): void {
        this.loadContratos();
        this.loadProveedores();
        this.loadStats();
    }
    
    createForm(): FormGroup {
        return this.fb.group({
            fechaInicio: ['', Validators.required],
            fechaFin: ['', Validators.required],
            descripcion: ['', [Validators.required, Validators.minLength(10)]],
            frecuencia: ['', Validators.required],
            idProveedor: ['', Validators.required],
            estado: [true]
        });
    }
    
    // 🔄 MÉTODOS DE CARGA DE DATOS
    
    loadContratos(): void {
        this.loading = true;
        this.contratoService.getAll().subscribe({
            next: (contratos) => {
                this.contratos = contratos;
                this.loading = false;
                console.log('✅ Contratos cargados:', contratos.length);
            },
            error: (error) => {
                console.error('❌ Error al cargar contratos:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudieron cargar los contratos: ' + error.message
                });
                this.loading = false;
                // Usar datos mock como fallback
                this.contratos = this.getMockContratos();
            }
        });
    }
    
    loadProveedores(): void {
        this.proveedoresService.getActivos().subscribe({
            next: (proveedores) => {
                this.proveedores = proveedores;
                console.log('✅ Proveedores cargados:', proveedores.length);
            },
            error: (error) => {
                console.error('❌ Error al cargar proveedores:', error);
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'No se pudieron cargar los proveedores: ' + error.message
                });
                // Usar datos mock como fallback
                this.proveedores = this.getMockProveedores();
            }
        });
    }
    
    loadStats(): void {
        this.contratoService.getStats().subscribe({
            next: (stats) => {
                this.stats = stats;
                console.log('✅ Estadísticas cargadas:', stats);
            },
            error: (error) => {
                console.error('❌ Error al cargar estadísticas:', error);
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'No se pudieron cargar las estadísticas: ' + error.message
                });
                // Usar estadísticas calculadas como fallback
                this.stats = this.calculateStatsFromContratos();
            }
        });
    }

    // Método auxiliar para calcular estadísticas desde los contratos locales
    calculateStatsFromContratos(): EstadisticasContratos {
        return {
            total: this.contratos.length,
            vigentes: this.contratos.filter(c => c.vigente).length,
            porVencer: this.contratos.filter(c => c.proximoAVencer).length,
            vencidos: this.contratos.filter(c => !c.vigente && !c.proximoAVencer).length,
            inactivos: this.contratos.filter(c => c.estadoDescriptivo === 'Inactivo').length
        };
    }
    
    // 📋 MÉTODOS CRUD
    
    openNew(): void {
        this.selectedContrato = null;
        this.isEditing = false;
        this.contratoForm.reset();
        this.contratoForm.patchValue({ estado: true });
        this.displayDialog = true;
    }
    
    editContrato(contrato: Contrato): void {
        this.selectedContrato = { ...contrato };
        this.isEditing = true;
        this.contratoForm.patchValue({
            fechaInicio: new Date(contrato.fechaInicio),
            fechaFin: new Date(contrato.fechaFin),
            descripcion: contrato.descripcion,
            frecuencia: contrato.frecuencia,
            idProveedor: contrato.idProveedor,
            estado: contrato.estado
        });
        this.displayDialog = true;
    }
    
    saveContrato(): void {
        if (this.contratoForm.valid) {
            const formValue = this.contratoForm.value;
            console.log('📋 Valores del formulario:', formValue);
            console.log('🔍 idProveedor específico:', formValue.idProveedor);
            console.log('📝 Tipo de idProveedor:', typeof formValue.idProveedor);
            console.log('📦 Proveedores disponibles:', this.proveedores);
            
            // Convertir fechas a formato ISO string para el backend
            const contratoData = {
                descripcion: formValue.descripcion,
                frecuencia: formValue.frecuencia,
                idProveedor: formValue.idProveedor,
                estado: formValue.estado !== undefined ? formValue.estado : true,
                fechaInicio: formValue.fechaInicio ? this.formatDateForBackend(formValue.fechaInicio) : null,
                fechaFin: formValue.fechaFin ? this.formatDateForBackend(formValue.fechaFin) : null
                // NO enviamos 'proveedor' - el backend lo resolverá con idProveedor
            };
            
            console.log('📤 Enviando contrato al backend:', contratoData);
            console.log('🔍 Estado específico enviado:', contratoData.estado, 'tipo:', typeof contratoData.estado);
            console.log('🔍 Enviando idProveedor:', contratoData.idProveedor, 'tipo:', typeof contratoData.idProveedor);
            
            if (this.isEditing && this.selectedContrato) {
                // Actualizar contrato existente
                this.contratoService.update(this.selectedContrato.id!, contratoData as any).subscribe({
                    next: (contrato) => {
                        console.log('✅ Contrato actualizado:', contrato);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Contrato actualizado correctamente'
                        });
                        this.displayDialog = false;
                        this.loadContratos();
                        this.loadStats();
                    },
                    error: (error) => {
                        console.error('❌ Error al actualizar contrato:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al actualizar contrato: ' + error.message
                        });
                    }
                });
            } else {
                // Crear nuevo contrato
                this.contratoService.create(contratoData as any).subscribe({
                    next: (contrato) => {
                        console.log('✅ Contrato creado:', contrato);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Contrato creado correctamente'
                        });
                        this.displayDialog = false;
                        this.loadContratos();
                        this.loadStats();
                    },
                    error: (error) => {
                        console.error('❌ Error al crear contrato:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al crear contrato: ' + error.message
                        });
                    }
                });
            }
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Por favor complete todos los campos requeridos'
            });
        }
    }
    
    // 📎 MÉTODOS DE ARCHIVOS
    
    openFileDialog(contrato: Contrato): void {
        this.selectedContrato = contrato;
        this.uploadedFiles = [];
        this.displayFileDialog = true;
    }
    
    onFileSelect(event: any): void {
        for (let file of event.files) {
            this.uploadedFiles.push(file);
        }
        
        this.messageService.add({
            severity: 'info',
            summary: 'Archivo seleccionado',
            detail: `${event.files.length} archivo(s) seleccionado(s)`
        });
    }
    
    uploadFiles(): void {
        if (this.uploadedFiles.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Seleccione al menos un archivo'
            });
            return;
        }
        
        // TODO: Implementar upload real
        console.log('Subiendo archivos:', this.uploadedFiles);
        
        this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `${this.uploadedFiles.length} archivo(s) subido(s) correctamente`
        });
        
        this.displayFileDialog = false;
        this.uploadedFiles = [];
    }
    
    downloadFile(archivo: any): void {
        // TODO: Implementar descarga de archivos
        console.log('Descargando archivo:', archivo);
        this.messageService.add({
            severity: 'info',
            summary: 'Descarga',
            detail: `Descargando ${archivo.nombre}...`
        });
    }
    
    deleteFile(archivo: any): void {
        this.confirmationService.confirm({
            message: '¿Está seguro de eliminar este archivo?',
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                // TODO: Implementar eliminación de archivos
                console.log('Eliminando archivo:', archivo);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Archivo eliminado correctamente'
                });
            }
        });
    }
    
    // 📅 MÉTODOS DE CONVERSIÓN DE FECHAS
    
    /**
     * Convierte una fecha string a Date object de forma segura
     */
    parseDate(dateString: string | Date | null | undefined): Date | null {
        if (!dateString) return null;
        
        if (dateString instanceof Date) return dateString;
        
        try {
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? null : date;
        } catch (error) {
            console.warn('Error parsing date:', dateString, error);
            return null;
        }
    }
    
    /**
     * Formatea una fecha de forma segura para mostrar
     */
    formatDate(dateValue: string | Date | null | undefined, format: string = 'dd/MM/yyyy'): string {
        const date = this.parseDate(dateValue);
        if (!date) return '-';
        
        try {
            // Usar el DatePipe de Angular de forma manual
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            
            if (format === 'dd/MM/yyyy') {
                return `${day}/${month}/${year}`;
            }
            return date.toLocaleDateString();
        } catch (error) {
            console.warn('Error formatting date:', dateValue, error);
            return '-';
        }
    }
    
    /**
     * Formatea una fecha con hora de forma segura
     */
    formatDateTime(dateValue: string | Date | null | undefined): string {
        const date = this.parseDate(dateValue);
        if (!date) return '-';
        
        try {
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            
            return `${day}/${month}/${year} ${hours}:${minutes}`;
        } catch (error) {
            console.warn('Error formatting datetime:', dateValue, error);
            return '-';
        }
    }
    
    /**
     * Verifica si una fecha es válida
     */
    isValidDate(dateString: string | Date | null | undefined): boolean {
        return this.parseDate(dateString) !== null;
    }
    
    /**
     * Formatea una fecha para enviar al backend (YYYY-MM-DDTHH:MM:SS)
     */
    formatDateForBackend(dateValue: Date | string | null | undefined): string | null {
        if (!dateValue) return null;
        
        try {
            const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
            if (isNaN(date.getTime())) return null;
            
            // Usar la fecha local sin conversión de zona horaria
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            
            // Agregar hora por defecto al mediodía para evitar problemas de zona horaria
            return `${year}-${month}-${day}T12:00:00`;
        } catch (error) {
            console.warn('Error formatting date for backend:', dateValue, error);
            return null;
        }
    }
    
    // 🎨 MÉTODOS DE UI
    
    getSeverity(estadoDescriptivo: string): string {
        switch (estadoDescriptivo) {
            case 'Vigente': return 'success';
            case 'Próximo a vencer': return 'warning';
            case 'Vencido': return 'danger';
            case 'Inactivo': return 'danger';  // Cambiar a rojo para que se vea claramente
            default: return 'info';
        }
    }
    
    getIcon(estadoDescriptivo: string): string {
        switch (estadoDescriptivo) {
            case 'Vigente': return 'pi pi-check-circle';
            case 'Próximo a vencer': return 'pi pi-exclamation-triangle';
            case 'Vencido': return 'pi pi-times-circle';
            case 'Inactivo': return 'pi pi-ban';
            default: return 'pi pi-info-circle';
        }
    }
    
    // 🎭 DATOS MOCK (Temporales)
    
    private getMockContratos(): Contrato[] {
        return [
            {
                id: 1,
                fechaInicio: new Date('2024-01-01'),
                fechaFin: new Date('2024-12-31'),
                descripcion: 'Mantenimiento preventivo de equipos de laboratorio',
                frecuencia: 'mensual',
                estado: true,
                estadoDescriptivo: 'Vigente',
                proveedor: 'TecnoLab S.A.',
                idProveedor: 1,
                fechaCreacion: new Date('2024-01-01'),
                usuarioCreacion: 'Admin Sistema',
                vigente: true,
                proximoAVencer: false,
                totalArchivos: 3
            },
            {
                id: 2,
                fechaInicio: new Date('2024-06-01'),
                fechaFin: new Date('2024-11-30'),
                descripcion: 'Calibración de equipos de medición',
                frecuencia: 'semestral',
                estado: true,
                estadoDescriptivo: 'Próximo a vencer',
                proveedor: 'Calibraciones Exactas',
                idProveedor: 2,
                fechaCreacion: new Date('2024-06-01'),
                usuarioCreacion: 'Admin Sistema',
                vigente: true,
                proximoAVencer: true,
                totalArchivos: 1
            }
        ];
    }
    
    // 📥 EXPORTAR CSV
    exportCSV(): void {
        const csvData = this.contratos.map(contrato => ({
            'ID': contrato.id || '',
            'Proveedor': contrato.proveedor || '',
            'Descripción': contrato.descripcion || '',
            'Frecuencia': contrato.frecuencia || '',
            'Fecha Inicio': this.formatDate(contrato.fechaInicio),
            'Fecha Fin': this.formatDate(contrato.fechaFin),
            'Estado': contrato.estadoDescriptivo || '',
            'Total Archivos': contrato.totalArchivos || 0
        }));

        const csv = this.convertToCSV(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `contratos_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Archivo CSV exportado correctamente'
            });
        }
    }

    private convertToCSV(objArray: any[]): string {
        const array = [Object.keys(objArray[0])].concat(objArray);
        return array.map(row => {
            return Object.values(row).map(value => {
                // Escapar comillas y envolver en comillas si contiene comas o saltos de línea
                const stringValue = value?.toString() || '';
                if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
                    return `"${stringValue.replace(/"/g, '""')}"`;
                }
                return stringValue;
            }).join(',');
        }).join('\n');
    }
    
    private getMockProveedores(): Proveedor[] {
        return [
            { idProveedor: 1, nit: '12345678-9', nombre: 'TecnoLab S.A.', estado: true },
            { idProveedor: 2, nit: '87654321-0', nombre: 'Calibraciones Exactas', estado: true },
            { idProveedor: 3, nit: '11223344-5', nombre: 'Servicios Industriales', estado: true }
        ];
    }
}
