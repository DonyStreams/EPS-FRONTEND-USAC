import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AreasService, Area } from '../../../service/areas.service';

@Component({
    selector: 'app-areas',
    templateUrl: './areas.component.html',
    providers: [ConfirmationService, MessageService]
})
export class AreasComponent implements OnInit {
    areas: Area[] = [];
    areaForm: FormGroup;
    displayDialog = false;
    isEditing = false;
    selectedArea: Area | null = null;
    loading = false;
    searchValue = '';

    // Estadísticas para dashboard
    totalAreas = 0;
    areasActivas = 0;
    areasInactivas = 0;

    // Opciones para tipo de área
    tiposArea = [
        { label: 'Operativa', value: 'OPERATIVA' },
        { label: 'Administrativa', value: 'ADMINISTRATIVA' },
        { label: 'Técnica', value: 'TECNICA' },
        { label: 'Laboratorio', value: 'LABORATORIO' },
        { label: 'Almacén', value: 'ALMACEN' }
    ];

    constructor(
        private areasService: AreasService,
        private fb: FormBuilder,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {
        this.areaForm = this.fb.group({
            nombre: ['', [
                Validators.required, 
                Validators.maxLength(100),
                Validators.minLength(3)
            ]],
            tipoArea: ['LABORATORIO', [Validators.required]],
            estado: [true]
        });
    }

    ngOnInit(): void {
        this.loadAreas();
    }

    loadAreas(): void {
        this.loading = true;
        this.areasService.getAll().subscribe({
            next: (data) => {
                this.areas = data;
                this.calculateStatistics();
                this.loading = false;
            },
            error: (error) => {
                console.error('Error al cargar áreas:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar áreas'
                });
                this.loading = false;
            }
        });
    }

    calculateStatistics(): void {
        this.totalAreas = this.areas.length;
        this.areasActivas = this.areas.filter(a => a.estado).length;
        this.areasInactivas = this.areas.filter(a => !a.estado).length;
    }

    showCreateDialog(): void {
        this.isEditing = false;
        this.selectedArea = null;
        this.areaForm.reset({ tipoArea: 'OPERATIVA', estado: true });
        this.displayDialog = true;
    }

    editArea(area: Area): void {
        this.isEditing = true;
        this.selectedArea = area;
        this.areaForm.patchValue({
            codigoArea: area.codigoArea,
            nombre: area.nombre,
            tipoArea: area.tipoArea,
            estado: area.estado
        });
        this.displayDialog = true;
    }

    saveArea(): void {
        if (this.areaForm.valid) {
            const formData = this.areaForm.value;
            
            if (this.isEditing && this.selectedArea) {
                this.areasService.update(this.selectedArea.idArea!, formData).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Área actualizada correctamente'
                        });
                        this.displayDialog = false;
                        this.loadAreas();
                    },
                    error: (error) => {
                        console.error('Error al actualizar área:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al actualizar área'
                        });
                    }
                });
            } else {
                this.areasService.create(formData).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Área creada correctamente'
                        });
                        this.displayDialog = false;
                        this.loadAreas();
                    },
                    error: (error) => {
                        console.error('Error al crear área:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al crear área'
                        });
                    }
                });
            }
        } else {
            this.markFormGroupTouched();
        }
    }

    private markFormGroupTouched(): void {
        Object.keys(this.areaForm.controls).forEach(key => {
            const control = this.areaForm.get(key);
            control?.markAsTouched();
        });
    }

    deleteArea(area: Area): void {
        this.confirmationService.confirm({
            message: '¿Está seguro de eliminar esta área?',
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.areasService.delete(area.idArea!).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Área eliminada correctamente'
                        });
                        this.loadAreas();
                    },
                    error: (error) => {
                        console.error('Error al eliminar área:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al eliminar área'
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
                console.warn('Fecha inválida:', dateString);
                return '-';
            }
            
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            
            return `${day}/${month}/${year} ${hours}:${minutes}`;
        } catch (error) {
            console.error('Error formateando fecha:', dateString, error);
            return '-';
        }
    }

    // Método para obtener información de errores del formulario
    getFieldError(fieldName: string): string {
        const field = this.areaForm.get(fieldName);
        if (field?.errors && field.touched) {
            if (field.errors['required']) return `${fieldName} es requerido`;
            if (field.errors['maxlength']) return `${fieldName} excede la longitud máxima`;
            if (field.errors['minlength']) return `${fieldName} debe tener al menos 3 caracteres`;
            if (field.errors['pattern']) return `${fieldName} debe contener solo letras mayúsculas, números, guiones y guiones bajos`;
        }
        return '';
    }
}
