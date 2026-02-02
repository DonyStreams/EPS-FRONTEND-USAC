import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService, MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { ProveedoresService, Proveedor } from '../../../service/proveedores.service';
import { KeycloakService } from '../../../service/keycloak.service';

@Component({
    selector: 'app-proveedores',
    templateUrl: './proveedores.component.html',
    providers: [ConfirmationService, MessageService]
})
export class ProveedoresComponent implements OnInit {
    @ViewChild('menuAcciones') menuAcciones!: Menu;

    proveedores: Proveedor[] = [];
    proveedorForm: FormGroup;
    displayDialog = false;
    isEditing = false;
    selectedProveedor: Proveedor | null = null;
    loading = false;
    searchValue = '';

    // Estadísticas para dashboard
    totalProveedores = 0;
    proveedoresActivos = 0;
    proveedoresInactivos = 0;

    // Menú de acciones
    accionesMenuItems: MenuItem[] = [];
    proveedorSeleccionadoMenu: Proveedor | null = null;

    constructor(
        private proveedoresService: ProveedoresService,
        private fb: FormBuilder,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private keycloakService: KeycloakService
    ) {
        this.proveedorForm = this.fb.group({
            nit: ['', [
                Validators.required, 
                Validators.maxLength(20),
                Validators.pattern(/^[0-9-]+$/) // Solo números y guiones para NIT
            ]],
            nombre: ['', [
                Validators.required, 
                Validators.maxLength(100),
                Validators.minLength(3)
            ]],
            estado: [true]
        });
    }

    ngOnInit(): void {
        this.loadProveedores();
    }

    loadProveedores(): void {
        this.loading = true;
        this.proveedoresService.getAll().subscribe({
            next: (data) => {
                this.proveedores = data;
                this.calculateStatistics();
                this.loading = false;
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar proveedores'
                });
                this.loading = false;
            }
        });
    }

    calculateStatistics(): void {
        this.totalProveedores = this.proveedores.length;
        this.proveedoresActivos = this.proveedores.filter(p => p.estado).length;
        this.proveedoresInactivos = this.proveedores.filter(p => !p.estado).length;
    }

    showCreateDialog(): void {
        this.isEditing = false;
        this.selectedProveedor = null;
        this.proveedorForm.reset({ estado: true });
        this.displayDialog = true;
    }

    editProveedor(proveedor: Proveedor): void {
        this.isEditing = true;
        this.selectedProveedor = proveedor;
        this.proveedorForm.patchValue({
            nit: proveedor.nit,
            nombre: proveedor.nombre,
            estado: proveedor.estado
        });
        this.displayDialog = true;
    }

    /**
     * Abre el menú contextual de acciones
     */
    openAccionesMenu(event: Event, proveedor: Proveedor): void {
        this.proveedorSeleccionadoMenu = proveedor;
        const items: MenuItem[] = [
            {
                label: 'Editar',
                icon: 'pi pi-pencil',
                visible: this.keycloakService.canEditProveedores(),
                command: () => this.editProveedor(proveedor)
            },
            {
                label: 'Eliminar',
                icon: 'pi pi-trash',
                styleClass: 'text-red-500',
                visible: this.keycloakService.canDeleteProveedores(),
                command: () => this.deleteProveedor(proveedor)
            }
        ];

        this.accionesMenuItems = items.filter(item => item.visible !== false);
        if (!this.accionesMenuItems.length) {
            return;
        }

        this.menuAcciones.toggle(event);
    }

    tieneAccionesProveedor(): boolean {
        return this.keycloakService.canEditProveedores() || this.keycloakService.canDeleteProveedores();
    }

    // Validación de NIT único
    isNitUnico(nit: string): boolean {
        if (this.isEditing && this.selectedProveedor?.nit === nit) {
            return true; // Es el mismo NIT del registro actual
        }
        return !this.proveedores.some(p => p.nit === nit);
    }

    saveProveedor(): void {
        if (this.proveedorForm.valid) {
            const formData = this.proveedorForm.value;
            
            // Validar NIT único
            if (!this.isNitUnico(formData.nit)) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'Ya existe un proveedor con este NIT'
                });
                return;
            }
            
            if (this.isEditing && this.selectedProveedor) {
                this.proveedoresService.update(this.selectedProveedor.idProveedor!, formData).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Proveedor actualizado correctamente'
                        });
                        this.displayDialog = false;
                        this.loadProveedores();
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al actualizar proveedor'
                        });
                    }
                });
            } else {
                this.proveedoresService.create(formData).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Proveedor creado correctamente'
                        });
                        this.displayDialog = false;
                        this.loadProveedores();
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al crear proveedor'
                        });
                    }
                });
            }
        } else {
            this.markFormGroupTouched();
        }
    }

    private markFormGroupTouched(): void {
        Object.keys(this.proveedorForm.controls).forEach(key => {
            const control = this.proveedorForm.get(key);
            control?.markAsTouched();
        });
    }

    deleteProveedor(proveedor: Proveedor): void {
        this.confirmationService.confirm({
            message: '¿Está seguro de eliminar este proveedor?',
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.proveedoresService.delete(proveedor.idProveedor!).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Proveedor eliminado correctamente'
                        });
                        this.loadProveedores();
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al eliminar proveedor'
                        });
                    }
                });
            }
        });
    }

    hideDialog(): void {
        this.displayDialog = false;
    }

    formatDate(dateString: any): string {
        if (!dateString) return '-';
        
        try {
            let date: Date;
            
            if (typeof dateString === 'string') {
                const cleanDateString = dateString.replace(/\[UTC\]$/, '');
                date = new Date(cleanDateString);
            } else if (dateString instanceof Date) {
                date = dateString;
            } else {
                return '-';
            }
            
            if (isNaN(date.getTime())) {
                return '-';
            }
            
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            
            return `${day}/${month}/${year} ${hours}:${minutes}`;
        } catch (error) {
            return '-';
        }
    }

    // Método para exportar a CSV
    exportToCsv(): void {
        const csvData = this.proveedores.map(proveedor => ({
            NIT: proveedor.nit,
            Nombre: proveedor.nombre,
            Estado: proveedor.estado ? 'Activo' : 'Inactivo',
            'Fecha Creación': this.formatDate(proveedor.fechaCreacion),
            'Fecha Modificación': proveedor.fechaModificacion ? this.formatDate(proveedor.fechaModificacion) : 'Sin modificar'
        }));

        const csvContent = this.convertToCsv(csvData);
        this.downloadCsv(csvContent, 'proveedores.csv');
    }

    private convertToCsv(data: any[]): string {
        if (!data.length) return '';
        
        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
        ];
        
        return csvRows.join('\n');
    }

    private downloadCsv(content: string, filename: string): void {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Método para obtener información de errores del formulario
    getFieldError(fieldName: string): string {
        const field = this.proveedorForm.get(fieldName);
        if (field?.errors && field.touched) {
            if (field.errors['required']) return `${fieldName} es requerido`;
            if (field.errors['maxlength']) return `${fieldName} excede la longitud máxima`;
            if (field.errors['minlength']) return `${fieldName} debe tener al menos 3 caracteres`;
            if (field.errors['pattern']) {
                if (fieldName === 'nit') return 'NIT debe contener solo números y guiones';
                return `${fieldName} tiene formato inválido`;
            }
        }
        return '';
    }
}
