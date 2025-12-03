import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Router } from '@angular/router';
import { ContratoService, Contrato, EstadisticasContratos } from '../../../service/contrato.service';
import { ProveedoresService, Proveedor } from '../../../service/proveedores.service';
import { ArchivosService, ArchivoResponse } from '../../../service/archivos.service';

@Component({
    selector: 'app-contratos',
    templateUrl: './contratos.component.html',
    providers: [MessageService, ConfirmationService]
})
export class ContratosComponent implements OnInit {
    
    @ViewChild('fileUpload') fileUpload: any;
    
    contratos: Contrato[] = [];
    proveedores: Proveedor[] = [];
    
    displayDialog: boolean = false;
    displayFileDialog: boolean = false;
    contratoForm: FormGroup;
    selectedContrato: Contrato | null = null;
    isEditing: boolean = false;
    loading: boolean = false;
    
    // 🆕 Control para evitar eventos múltiples
    private isClearing: boolean = false;
    private lastClearTime: number = 0;
    
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
        private proveedoresService: ProveedoresService,
        public archivosService: ArchivosService,  // 🆕 Hacer público para usar en template
        private router: Router  // 🆕 Agregar Router
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
            descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
            idProveedor: ['', Validators.required],
            estado: [true]
        }, { validators: this.fechaValidator });
    }

    // Validador personalizado para fechas
    fechaValidator(group: FormGroup): {[key: string]: any} | null {
        const fechaInicio = group.get('fechaInicio')?.value;
        const fechaFin = group.get('fechaFin')?.value;
        
        if (fechaInicio && fechaFin) {
            const inicio = new Date(fechaInicio);
            const fin = new Date(fechaFin);
            
            // Verificar que la fecha de inicio no sea mayor que la de fin
            if (inicio > fin) {
                return { fechasInvalidas: true };
            }
            
            // Opcional: Verificar que el contrato tenga al menos 1 día de duración
            const unDia = 24 * 60 * 60 * 1000; // milisegundos en un día
            if ((fin.getTime() - inicio.getTime()) < unDia) {
                return { duracionMinima: true };
            }
        }
        
        return null;
    }
    
    // Helper para obtener mensajes de error de validación
    getFormError(field: string): string | null {
        const control = this.contratoForm.get(field);
        if (control?.errors && control.touched) {
            if (control.errors['required']) return 'Este campo es requerido';
            if (control.errors['minlength']) return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
            if (control.errors['maxlength']) return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
        }
        return null;
    }
    
    getFechasError(): string | null {
        const errors = this.contratoForm.errors;
        if (errors && (this.contratoForm.get('fechaInicio')?.touched || this.contratoForm.get('fechaFin')?.touched)) {
            if (errors['fechasInvalidas']) return 'La fecha de inicio no puede ser mayor que la fecha de fin';
            if (errors['duracionMinima']) return 'El contrato debe tener al menos 1 día de duración';
        }
        return null;
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
        this.contratoForm.patchValue({ estado: false }); // Inicia como inactivo por defecto
        this.uploadedFiles = []; // Limpiar archivos
        this.displayDialog = true;
    }
    
    editContrato(contrato: Contrato): void {
        this.selectedContrato = { ...contrato };
        this.isEditing = true;
        this.contratoForm.patchValue({
            fechaInicio: new Date(contrato.fechaInicio),
            fechaFin: new Date(contrato.fechaFin),
            descripcion: contrato.descripcion,
            idProveedor: contrato.idProveedor,
            estado: contrato.estado
        });
        this.uploadedFiles = []; // Limpiar archivos nuevos
        
        // Cargar archivos existentes del contrato
        if (contrato.id) {
            this.loadArchivosContrato(contrato.id);
        }
        
        this.displayDialog = true;
    }
    
    // Cargar archivos de un contrato específico
    loadArchivosContrato(contratoId: number): void {
        this.archivosService.getListaArchivosPorContrato(contratoId).subscribe({
            next: (response: any) => {
                if (this.selectedContrato) {
                    this.selectedContrato.archivos = response.archivos.map((archivo: any) => ({
                        ...archivo,
                        iconoCss: this.archivosService.getIconoArchivo(archivo.nombreOriginal),
                        tamanoFormateado: this.archivosService.formatearTamano(archivo.tamano)
                    }));
                }
                console.log('✅ Archivos del contrato cargados:', response.archivos.length);
            },
            error: (error) => {
                console.error('❌ Error al cargar archivos del contrato:', error);
            }
        });
    }
    
    // Subir archivos al contrato
    subirArchivosContrato(contratoId: number): void {
        let archivosSubidos = 0;
        let errores = 0;
        const totalArchivos = this.uploadedFiles.length;

        this.uploadedFiles.forEach((file) => {
            // Validar archivo
            if (!this.archivosService.esArchivoValidoContrato(file)) {
                errores++;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Archivo no válido',
                    detail: `${file.name}: Solo se permiten archivos PDF, DOC y DOCX`
                });
                
                if (archivosSubidos + errores === totalArchivos) {
                    this.finalizarGuardadoConArchivos(archivosSubidos, errores);
                }
                return;
            }

            // Validar tamaño
            if (!this.archivosService.validarTamano(file, 10)) {
                errores++;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Archivo muy grande',
                    detail: `${file.name}: El archivo debe ser menor a 10MB`
                });
                
                if (archivosSubidos + errores === totalArchivos) {
                    this.finalizarGuardadoConArchivos(archivosSubidos, errores);
                }
                return;
            }

            // Subir archivo
            this.archivosService.subirArchivo(file, contratoId).subscribe({
                next: (response: ArchivoResponse) => {
                    console.log('✅ Archivo subido:', response);
                    archivosSubidos++;
                    
                    if (archivosSubidos + errores === totalArchivos) {
                        this.finalizarGuardadoConArchivos(archivosSubidos, errores);
                    }
                },
                error: (error) => {
                    console.error('❌ Error al subir archivo:', error);
                    errores++;
                    
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error al subir archivo',
                        detail: `${file.name}: ${error.error?.error || error.message || 'Error desconocido'}`
                    });
                    
                    if (archivosSubidos + errores === totalArchivos) {
                        this.finalizarGuardadoConArchivos(archivosSubidos, errores);
                    }
                }
            });
        });
    }
    
    finalizarGuardadoConArchivos(exitosos: number, errores: number): void {
        if (exitosos > 0 && errores === 0) {
            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: `Contrato guardado y ${exitosos} archivo(s) subido(s) correctamente`
            });
        } else if (exitosos > 0 && errores > 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Parcialmente completado',
                detail: `Contrato guardado. ${exitosos} archivo(s) subido(s), ${errores} error(es)`
            });
        } else if (errores > 0) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error en archivos',
                detail: `Contrato guardado pero no se pudieron subir los archivos`
            });
        }
        
        this.displayDialog = false;
        this.uploadedFiles = [];
        this.loadContratos();
        this.loadStats();
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
                idProveedor: formValue.idProveedor,
                estado: formValue.estado === true ? true : false,  // Asegurar que sea booleano explícito
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
                        
                        // Subir archivos nuevos si hay
                        if (this.uploadedFiles.length > 0) {
                            this.subirArchivosContrato(this.selectedContrato!.id!);
                        } else {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Éxito',
                                detail: 'Contrato actualizado correctamente'
                            });
                            this.displayDialog = false;
                            this.loadContratos();
                            this.loadStats();
                        }
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
                        
                        // Subir archivos si hay
                        if (this.uploadedFiles.length > 0 && contrato.id) {
                            this.subirArchivosContrato(contrato.id);
                        } else {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Éxito',
                                detail: 'Contrato creado correctamente'
                            });
                            this.displayDialog = false;
                            this.loadContratos();
                            this.loadStats();
                        }
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
    
    verArchivos(contrato: Contrato): void {
        console.log('👁️ Ver archivos del contrato:', contrato.id);
        this.openFileDialog(contrato);
    }
    
    openFileDialog(contrato: Contrato): void {
        console.log('📂 Abriendo modal de archivos para contrato:', contrato.id);
        
        this.selectedContrato = contrato;
        this.uploadedFiles = []; // Limpiar archivos previos
        
        // Resetear flags de control
        this.isClearing = false;
        this.lastClearTime = 0;
        
        this.displayFileDialog = true;
        
        // 🆕 Limpiar cualquier estado previo del componente de upload
        setTimeout(() => {
            if (this.fileUpload) {
                // Limpiar también nuestro array local
                this.uploadedFiles = [];
                
                // Resetear el input si existe
                const input = this.fileUpload.basicFileInput?.nativeElement;
                if (input) {
                    input.value = '';
                }
                
                // Limpiar array interno
                if (this.fileUpload.files) {
                    this.fileUpload.files = [];
                }
            }
        }, 100);
    }

    // 🆕 MÉTODO PARA NAVEGAR A LA PÁGINA DE GESTIÓN DE ARCHIVOS
    gestionarArchivos(contrato: Contrato): void {
        console.log('📂 Navegando a gestión de archivos para contrato:', contrato.id);
        this.router.navigate(['/administracion/contratos/archivos', contrato.id]);
    }
    
    onFileSelect(event: any): void {
        // 🆕 En modo básico, solo actualizamos nuestro array cuando se seleccionan archivos
        // No limpiamos porque el usuario puede estar agregando archivos gradualmente
        
        console.log('📁 Archivos seleccionados:', event.files);
        
        // Agregar los nuevos archivos a nuestro array local
        for (let file of event.files) {
            // Verificar que no esté duplicado
            const existe = this.uploadedFiles.find(f => f.name === file.name && f.size === file.size);
            if (!existe) {
                this.uploadedFiles.push(file);
            }
        }
        
        this.messageService.add({
            severity: 'info',
            summary: 'Archivo seleccionado',
            detail: `${event.files.length} archivo(s) agregado(s). Total: ${this.uploadedFiles.length}`
        });
    }

    // 🆕 NUEVOS MÉTODOS PARA MANEJO DE ARCHIVOS
    onFilesClear(): void {
        // 🆕 Prevenir llamadas múltiples usando debounce
        const currentTime = Date.now();
        if (this.isClearing || (currentTime - this.lastClearTime) < 500) {
            console.log('🚫 Evitando llamada múltiple a onFilesClear');
            return;
        }
        
        this.isClearing = true;
        this.lastClearTime = currentTime;
        
        console.log('🧹 Limpiando archivos...');
        
        // Limpiar nuestro array
        this.uploadedFiles = [];
        
        // Mostrar mensaje solo una vez
        this.messageService.add({
            severity: 'info',
            summary: 'Archivos limpiados',
            detail: 'Se han eliminado todos los archivos seleccionados'
        });
        
        // Resetear el flag después de un breve delay
        setTimeout(() => {
            this.isClearing = false;
        }, 100);
    }

    // 🆕 MÉTODO MANUAL PARA LIMPIAR (sin depender del evento del componente)
    clearFilesManually(): void {
        console.log('🧹 Limpieza manual de archivos');
        
        // Limpiar nuestro array
        this.uploadedFiles = [];
        
        // Limpiar el componente p-fileUpload completamente
        if (this.fileUpload) {
            // Limpiar el array interno del componente
            if (this.fileUpload.files) {
                this.fileUpload.files = [];
            }
            
            // Acceder al input file y limpiarlo (modo básico)
            if (this.fileUpload.basicFileInput?.nativeElement) {
                this.fileUpload.basicFileInput.nativeElement.value = '';
            }
            
            // Forzar actualización del componente
            this.fileUpload.cd?.detectChanges();
            
            // Limpiar también el label si existe
            setTimeout(() => {
                if (this.fileUpload.basicFileInput?.nativeElement) {
                    this.fileUpload.basicFileInput.nativeElement.value = null;
                }
            }, 100);
        }
        
        this.messageService.add({
            severity: 'info',
            summary: 'Archivos limpiados',
            detail: 'Se han eliminado todos los archivos seleccionados'
        });
    }

    onFileRemove(event: any): void {
        // El evento de PrimeNG ya maneja la eliminación del archivo
        // Solo actualizamos nuestro array local
        this.uploadedFiles = this.uploadedFiles.filter(file => file !== event.file);
        this.messageService.add({
            severity: 'info',
            summary: 'Archivo eliminado',
            detail: `${event.file.name} ha sido eliminado`
        });
    }

    removeFile(index: number): void {
        const fileName = this.uploadedFiles[index].name;
        this.uploadedFiles.splice(index, 1);
        
        // Si el componente p-fileUpload tiene archivos, también actualizarlo
        if (this.fileUpload && this.fileUpload.files) {
            // Encontrar y eliminar el archivo del componente también
            const fileIndex = this.fileUpload.files.findIndex((f: File) => f.name === fileName);
            if (fileIndex > -1) {
                this.fileUpload.files.splice(fileIndex, 1);
            }
        }
        
        this.messageService.add({
            severity: 'info',
            summary: 'Archivo eliminado',
            detail: `${fileName} ha sido eliminado`
        });
    }

    // 🆕 MÉTODO PARA CERRAR EL MODAL DE ARCHIVOS
    closeFileDialog(): void {
        this.limpiarEstadoModal();
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

        // 🆕 IMPLEMENTACIÓN REAL DE SUBIDA DE ARCHIVOS
        let archivosSubidos = 0;
        let errores = 0;

        this.uploadedFiles.forEach((file, index) => {
            // Validar que sea un archivo de contrato válido
            if (!this.archivosService.esArchivoValidoContrato(file)) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Archivo no válido',
                    detail: `${file.name}: Solo se permiten archivos PDF, DOC y DOCX`
                });
                errores++;
                return;
            }

            // Validar tamaño del archivo
            if (!this.archivosService.validarTamano(file, 10)) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Archivo muy grande',
                    detail: `${file.name}: El archivo debe ser menor a 10MB`
                });
                errores++;
                return;
            }

            // Subir archivo al servidor
            this.archivosService.subirArchivo(file, this.selectedContrato!.id!).subscribe({
                next: (response: ArchivoResponse) => {
                    console.log('✅ Archivo subido:', response);
                    archivosSubidos++;
                    
                    // Si es el último archivo, mostrar resumen
                    if (archivosSubidos + errores === this.uploadedFiles.length) {
                        this.mostrarResumenSubida(archivosSubidos, errores);
                    }
                },
                error: (error) => {
                    console.error('❌ Error al subir archivo:', error);
                    errores++;
                    
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error al subir archivo',
                        detail: `${file.name}: ${error.error?.error || error.message || 'Error desconocido'}`
                    });
                    
                    // Si es el último archivo, mostrar resumen
                    if (archivosSubidos + errores === this.uploadedFiles.length) {
                        this.mostrarResumenSubida(archivosSubidos, errores);
                    }
                }
            });
        });
    }

    private mostrarResumenSubida(exitosos: number, errores: number): void {
        if (exitosos > 0 && errores === 0) {
            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: `${exitosos} archivo(s) subido(s) correctamente`
            });
            
            // 🆕 Limpiar completamente el estado del modal
            this.limpiarEstadoModal();
            
            // 🆕 Recargar la lista de contratos para actualizar el contador de archivos
            this.loadContratos();
            
        } else if (exitosos > 0 && errores > 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Parcialmente completado',
                detail: `${exitosos} archivo(s) subido(s), ${errores} error(es)`
            });
        } else if (errores > 0) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: `No se pudo subir ningún archivo (${errores} error(es))`
            });
        }
    }
    
    downloadFile(archivo: any): void {
        console.log('📥 Descargando archivo:', archivo);
        
        // Usar nombreSistema que es el nombre real del archivo en el servidor
        this.archivosService.descargarArchivo(archivo.nombreSistema).subscribe({
            next: (blob: Blob) => {
                // Crear URL temporal para el blob
                const url = window.URL.createObjectURL(blob);
                
                // Crear elemento <a> temporal para descargar
                const link = document.createElement('a');
                link.href = url;
                link.download = archivo.nombreOriginal; // Usar el nombre original del archivo
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Limpiar URL temporal
                window.URL.revokeObjectURL(url);
                
                this.messageService.add({
                    severity: 'success',
                    summary: 'Descarga exitosa',
                    detail: `Archivo ${archivo.nombreOriginal} descargado correctamente`
                });
            },
            error: (error) => {
                console.error('❌ Error al descargar archivo:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error de descarga',
                    detail: `No se pudo descargar el archivo ${archivo.nombreOriginal}`
                });
            }
        });
    }
    
    deleteContrato(contrato: Contrato): void {
        this.confirmationService.confirm({
            message: `¿Está seguro de eliminar el contrato "${contrato.descripcion}"?${contrato.totalArchivos && contrato.totalArchivos > 0 ? '\n\nEste contrato tiene ' + contrato.totalArchivos + ' archivo(s) asociado(s) que también se eliminarán.' : ''}`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.contratoService.delete(contrato.id!).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Contrato eliminado correctamente'
                        });
                        this.loadContratos();
                        this.loadStats();
                    },
                    error: (error) => {
                        console.error('❌ Error al eliminar contrato:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al eliminar contrato: ' + (error.error?.error || error.message || 'Error desconocido')
                        });
                    }
                });
            }
        });
    }
    
    deleteFile(archivo: any): void {
        this.confirmationService.confirm({
            message: `¿Está seguro de eliminar el archivo "${archivo.nombreOriginal}"?`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.archivosService.eliminarArchivo(archivo.nombreSistema).subscribe({
                    next: (response) => {
                        console.log('✅ Archivo eliminado:', response);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Archivo eliminado',
                            detail: `${archivo.nombreOriginal} eliminado correctamente`
                        });
                        
                        // Recargar archivos del contrato
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
     * Formatea una fecha para enviar al backend
     * Formato: YYYY-MM-DDTHH:mm:ss (con hora para compatibilidad con Java Date)
     */
    formatDateForBackend(dateValue: Date | string | null | undefined): string | null {
        if (!dateValue) return null;
        
        try {
            const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
            if (isNaN(date.getTime())) return null;
            
            // Obtener la fecha seleccionada
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            
            // Agregar hora fija al mediodía para evitar problemas de zona horaria
            // Docker ya está configurado con TZ=America/Guatemala
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
    
    // 🆕 MÉTODO PARA LIMPIAR COMPLETAMENTE EL ESTADO DEL MODAL
    private limpiarEstadoModal(): void {
        console.log('🧹 Limpiando estado del modal...');
        
        this.displayFileDialog = false;
        this.uploadedFiles = [];
        this.selectedContrato = null;
        
        // Resetear flags de control
        this.isClearing = false;
        this.lastClearTime = 0;
        
        // Usar setTimeout para asegurar que el DOM se actualice
        setTimeout(() => {
            // Limpiar el componente p-fileUpload usando ViewChild
            if (this.fileUpload) {
                // Resetear el input de archivo directamente
                const input = this.fileUpload.basicFileInput?.nativeElement;
                if (input) {
                    input.value = '';
                }
                
                // Limpiar el array interno si existe
                if (this.fileUpload.files) {
                    this.fileUpload.files = [];
                }
            }
        }, 100);
    }
    
    private getMockProveedores(): Proveedor[] {
        return [
            { idProveedor: 1, nit: '12345678-9', nombre: 'TecnoLab S.A.', estado: true },
            { idProveedor: 2, nit: '87654321-0', nombre: 'Calibraciones Exactas', estado: true },
            { idProveedor: 3, nit: '11223344-5', nombre: 'Servicios Industriales', estado: true }
        ];
    }
}
