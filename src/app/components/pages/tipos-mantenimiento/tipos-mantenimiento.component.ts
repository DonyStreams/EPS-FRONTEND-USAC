import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TiposMantenimientoService, TipoMantenimiento } from '../../../service/tipos-mantenimiento.service';

@Component({
    selector: 'app-tipos-mantenimiento',
    templateUrl: './tipos-mantenimiento.component.html',
    providers: [ConfirmationService, MessageService]
})
export class TiposMantenimientoComponent implements OnInit {
    tipos: TipoMantenimiento[] = [];
    tipoForm: FormGroup;
    displayDialog = false;
    isEditing = false;
    selectedTipo: TipoMantenimiento | null = null;
    loading = false;

    constructor(
        private tiposService: TiposMantenimientoService,
        private fb: FormBuilder,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {
        this.tipoForm = this.fb.group({
            codigo: ['', [Validators.required, Validators.maxLength(20)]],
            nombre: ['', [Validators.required, Validators.maxLength(50)]],
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

    showCreateDialog(): void {
        this.isEditing = false;
        this.selectedTipo = null;
        this.tipoForm.reset({ estado: true });
        this.displayDialog = true;
    }

    editTipo(tipo: TipoMantenimiento): void {
        this.isEditing = true;
        this.selectedTipo = tipo;
        this.tipoForm.patchValue(tipo);
        this.displayDialog = true;
    }

    saveTipo(): void {
        if (this.tipoForm.valid) {
            const formData = this.tipoForm.value;
            
            if (this.isEditing && this.selectedTipo) {
                this.tiposService.update(this.selectedTipo.id_tipo!, formData).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Tipo de mantenimiento actualizado'
                        });
                        this.displayDialog = false;
                        this.loadTipos();
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al actualizar tipo'
                        });
                    }
                });
            } else {
                this.tiposService.create(formData).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Tipo de mantenimiento creado'
                        });
                        this.displayDialog = false;
                        this.loadTipos();
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al crear tipo'
                        });
                    }
                });
            }
        }
    }

    deleteTipo(tipo: TipoMantenimiento): void {
        this.confirmationService.confirm({
            message: '¿Está seguro de eliminar este tipo de mantenimiento?',
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.tiposService.delete(tipo.id_tipo!).subscribe({
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
}
