import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService, MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { TiposMantenimientoService, TipoMantenimiento } from '../../../service/tipos-mantenimiento.service';
import { KeycloakService } from '../../../service/keycloak.service';

@Component({
    selector: 'app-tipos-mantenimiento',
    templateUrl: './tipos-mantenimiento.component.html',
    providers: [ConfirmationService, MessageService]
})
export class TiposMantenimientoComponent implements OnInit {
    @ViewChild('menuAcciones') menuAcciones!: Menu;

    tipos: TipoMantenimiento[] = [];
    tiposFiltrados: TipoMantenimiento[] = [];
    tipoForm: FormGroup;
    displayDialog = false;
    isEditing = false;
    selectedTipo: TipoMantenimiento | null = null;
    loading = false;
    searchValue = '';

    // Estadísticas para dashboard
    totalTipos = 0;
    tiposActivos = 0;
    tiposInactivos = 0;

    // Menú de acciones
    accionesMenuItems: MenuItem[] = [];
    tipoSeleccionadoMenu: TipoMantenimiento | null = null;

    constructor(
        private tiposService: TiposMantenimientoService,
        private fb: FormBuilder,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private keycloakService: KeycloakService
    ) {
        this.tipoForm = this.fb.group({
            nombre: ['', [
                Validators.required, 
                Validators.maxLength(50),
                Validators.minLength(3)
            ]],
            estado: [true]
        });
    }

    ngOnInit(): void {
        this.loadTipos();
    }

    loadTipos(): void {
        this.loading = true;
        this.tiposService.getAll().subscribe({
            next: (data) => {
                this.tipos = data;
                this.calculateStatistics();
                this.loading = false;
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar tipos de mantenimiento'
                });
                this.loading = false;
            }
        });
    }

    calculateStatistics(): void {
        this.totalTipos = this.tipos.length;
        this.tiposActivos = this.tipos.filter(t => t.estado).length;
        this.tiposInactivos = this.tipos.filter(t => !t.estado).length;
    }

    showCreateDialog(): void {
        this.isEditing = false;
        this.selectedTipo = null;
        this.tipoForm.reset({ estado: true });
        this.displayDialog = true;
    }

    editTipo(tipo: TipoMantenimiento): void {
        this.isEditing = true;
        this.selectedTipo = tipo;
        this.tipoForm.patchValue({
            nombre: tipo.nombre,
            estado: tipo.estado
        });
        this.displayDialog = true;
    }

    /**
     * Abre el menú contextual de acciones
     */
    openAccionesMenu(event: Event, tipo: TipoMantenimiento): void {
        this.tipoSeleccionadoMenu = tipo;
        this.accionesMenuItems = [
            {
                label: 'Editar',
                icon: 'pi pi-pencil',
                visible: this.keycloakService.canEditMantenimientos(),
                command: () => this.editTipo(tipo)
            },
            {
                label: 'Eliminar',
                icon: 'pi pi-trash',
                styleClass: 'text-red-500',
                visible: this.keycloakService.canDeleteMantenimientos(),
                command: () => this.deleteTipo(tipo)
            }
        ];

        this.menuAcciones.toggle(event);
    }

    saveTipo(): void {
        if (this.tipoForm.valid) {
            const formData = this.tipoForm.value;
            
            if (this.isEditing && this.selectedTipo) {
                this.tiposService.update(this.selectedTipo.idTipo!, formData).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Tipo de mantenimiento actualizado correctamente'
                        });
                        this.displayDialog = false;
                        this.loadTipos();
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al actualizar tipo de mantenimiento'
                        });
                    }
                });
            } else {
                this.tiposService.create(formData).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Tipo de mantenimiento creado correctamente'
                        });
                        this.displayDialog = false;
                        this.loadTipos();
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al crear tipo de mantenimiento'
                        });
                    }
                });
            }
        } else {
            this.markFormGroupTouched();
        }
    }

    private markFormGroupTouched(): void {
        Object.keys(this.tipoForm.controls).forEach(key => {
            const control = this.tipoForm.get(key);
            control?.markAsTouched();
        });
    }

    deleteTipo(tipo: TipoMantenimiento): void {
        this.confirmationService.confirm({
            message: '¿Está seguro de eliminar este tipo de mantenimiento?',
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.tiposService.delete(tipo.idTipo!).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Tipo eliminado correctamente'
                        });
                        this.loadTipos();
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al eliminar tipo'
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
        const csvData = this.tipos.map(tipo => ({
            Código: tipo.codigo,
            Nombre: tipo.nombre,
            Estado: tipo.estado ? 'Activo' : 'Inactivo',
            'Fecha Creación': this.formatDate(tipo.fechaCreacion),
            'Fecha Modificación': tipo.fechaModificacion ? this.formatDate(tipo.fechaModificacion) : 'Sin modificar'
        }));

        const csvContent = this.convertToCsv(csvData);
        this.downloadCsv(csvContent, 'tipos-mantenimiento.csv');
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
        const field = this.tipoForm.get(fieldName);
        if (field?.errors && field.touched) {
            if (field.errors['required']) return `${fieldName} es requerido`;
            if (field.errors['maxlength']) return `${fieldName} excede la longitud máxima`;
            if (field.errors['minlength']) return `${fieldName} debe tener al menos 3 caracteres`;
            if (field.errors['pattern']) return `${fieldName} debe contener solo letras mayúsculas, números, guiones y guiones bajos`;
        }
        return '';
    }
}
