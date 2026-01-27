import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService, TreeNode } from 'primeng/api';
import { CategoriasEquipoService, CategoriaEquipo } from '../../../service/categorias-equipo.service';
import { EquiposService } from '../../../service/equipos.service';
import { Equipo } from '../../../api/equipos';

@Component({
    selector: 'app-categorias-equipo',
    templateUrl: './categorias-equipo.component.html',
    providers: [ConfirmationService, MessageService]
})
export class CategoriasEquipoComponent implements OnInit {
    categorias: CategoriaEquipo[] = [];
    treeData: TreeNode[] = [];
    loading = false;
    treeLoading = false;

    categoriaForm: FormGroup;
    displayDialog = false;
    isEditing = false;
    selectedCategoria: CategoriaEquipo | null = null;
    parentOptions: CategoriaEquipo[] = [];

    searchValue = '';

    // Modal de equipos por categoría
    displayEquiposDialog = false;
    equiposPorCategoria: Equipo[] = [];
    categoriaSeleccionadaEquipos: CategoriaEquipo | null = null;
    loadingEquipos = false;

    stats = {
        total: 0,
        activas: 0,
        inactivas: 0,
        sinPadre: 0
    };

    constructor(
        private categoriasService: CategoriasEquipoService,
        private equiposService: EquiposService,
        private fb: FormBuilder,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {
        this.categoriaForm = this.fb.group({
            nombre: ['', [Validators.required, Validators.maxLength(120), Validators.minLength(3)]],
            descripcion: ['', [Validators.maxLength(255)]],
            idPadre: [null],
            estado: [true]
        });
    }

    ngOnInit(): void {
        this.loadCategorias();
        this.loadTree();
    }

    loadCategorias(): void {
        this.loading = true;
        this.categoriasService.getAll().subscribe({
            next: (data) => {
                this.categorias = data;
                this.updateStats();
                this.refreshParentOptions();
                this.loading = false;
            },
            error: (error) => {
                console.error('Error al cargar categorías:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudieron cargar las categorías'
                });
                this.loading = false;
            }
        });
    }

    loadTree(): void {
        this.treeLoading = true;
        this.categoriasService.getTree().subscribe({
            next: (data) => {
                this.treeData = this.buildTreeNodes(data);
                this.treeLoading = false;
            },
            error: (error) => {
                console.error('Error al cargar árbol de categorías:', error);
                this.treeLoading = false;
            }
        });
    }

    private buildTreeNodes(data: CategoriaEquipo[] | undefined): TreeNode[] {
        if (!data) {
            return [];
        }
        return data.map((item) => ({
            key: item.id?.toString(),
            label: item.nombre,
            data: item,
            icon: item.estado ? 'pi pi-folder-open text-green-500' : 'pi pi-folder text-gray-400',
            children: this.buildTreeNodes(item.subcategorias)
        }));
    }

    updateStats(): void {
        this.stats.total = this.categorias.length;
        this.stats.activas = this.categorias.filter(c => c.estado).length;
        this.stats.inactivas = this.categorias.filter(c => c.estado === false).length;
        this.stats.sinPadre = this.categorias.filter(c => !c.idPadre).length;
    }

    refreshParentOptions(): void {
        const currentId = this.selectedCategoria?.id;
        this.parentOptions = this.categorias
            .filter(cat => cat.id !== currentId)
            .map(cat => ({ ...cat }));
    }

    showCreateDialog(): void {
        this.isEditing = false;
        this.selectedCategoria = null;
        this.categoriaForm.reset({ estado: true, idPadre: null, descripcion: '' });
        this.refreshParentOptions();
        this.displayDialog = true;
    }

    editCategoria(categoria: CategoriaEquipo): void {
        this.isEditing = true;
        this.selectedCategoria = categoria;
        this.categoriaForm.patchValue({
            nombre: categoria.nombre,
            descripcion: categoria.descripcion || '',
            idPadre: categoria.idPadre || null,
            estado: categoria.estado ?? true
        });
        this.refreshParentOptions();
        this.displayDialog = true;
    }

    saveCategoria(): void {
        if (this.categoriaForm.invalid) {
            this.markFormTouched();
            return;
        }

        const payload: CategoriaEquipo = {
            ...this.categoriaForm.value,
            idPadre: this.categoriaForm.value.idPadre ?? null
        };

        if (this.isEditing && this.selectedCategoria?.id) {
            this.categoriasService.update(this.selectedCategoria.id, payload).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Actualizado',
                        detail: 'Categoría actualizada correctamente'
                    });
                    this.closeDialog();
                },
                error: (error) => this.handleError('actualizar', error)
            });
        } else {
            this.categoriasService.create(payload).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Creado',
                        detail: 'Categoría creada correctamente'
                    });
                    this.closeDialog();
                },
                error: (error) => this.handleError('crear', error)
            });
        }
    }

    deleteCategoria(categoria: CategoriaEquipo): void {
        this.confirmationService.confirm({
            message: `¿Eliminar la categoría "${categoria.nombre}"?`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                if (!categoria.id) {
                    return;
                }
                this.categoriasService.delete(categoria.id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Eliminada',
                            detail: 'Categoría eliminada correctamente'
                        });
                        this.loadCategorias();
                        this.loadTree();
                    },
                    error: (error) => this.handleError('eliminar', error)
                });
            }
        });
    }

    closeDialog(): void {
        this.displayDialog = false;
        this.loadCategorias();
        this.loadTree();
    }

    private markFormTouched(): void {
        Object.values(this.categoriaForm.controls).forEach(control => control.markAsTouched());
    }

    private handleError(action: string, error: any): void {
        console.error(`Error al ${action} categoría:`, error);
        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error?.error?.error || `No se pudo ${action} la categoría`
        });
    }

    showEquiposPorCategoria(categoria: CategoriaEquipo): void {
        if (!categoria.id || !categoria.totalEquipos || categoria.totalEquipos === 0) {
            this.messageService.add({
                severity: 'info',
                summary: 'Sin equipos',
                detail: 'Esta categoría no tiene equipos asociados'
            });
            return;
        }
        
        this.categoriaSeleccionadaEquipos = categoria;
        this.loadingEquipos = true;
        this.displayEquiposDialog = true;
        
        this.equiposService.getEquiposByCategoria(categoria.id).subscribe({
            next: (equipos) => {
                this.equiposPorCategoria = equipos;
                this.loadingEquipos = false;
            },
            error: (error) => {
                console.error('Error al cargar equipos:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudieron cargar los equipos de esta categoría'
                });
                this.loadingEquipos = false;
                this.displayEquiposDialog = false;
            }
        });
    }

    closeEquiposDialog(): void {
        this.displayEquiposDialog = false;
        this.equiposPorCategoria = [];
        this.categoriaSeleccionadaEquipos = null;
    }

    getEstadoSeverity(estado?: boolean): 'success' | 'danger' | 'info' {
        if (estado === false) {
            return 'danger';
        }
        return 'success';
    }

    getParentName(idPadre?: number | null): string {
        if (!idPadre) {
            return 'Sin padre';
        }
        const parent = this.categorias.find(cat => cat.id === idPadre);
        return parent ? parent.nombre : 'Sin padre';
    }

    formatDate(dateValue?: string | Date | null): string {
        if (!dateValue) return '-';
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) {
            return '-';
        }
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}
