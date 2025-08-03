import { Component, OnInit } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Table } from 'primeng/table';
import { MantenimientoService, Mantenimiento, Equipo, Proveedor, TipoMantenimiento } from 'src/app/service/mantenimiento.service';

@Component({
    selector: 'app-mantenimientos',
    template: `
        <div class="grid">
            <div class="col-12">
                <div class="card px-6 py-6">
                    <p-toast></p-toast>
                    
                    <p-toolbar styleClass="mb-4">
                        <ng-template pTemplate="left">
                            <div class="my-2">
                                <button pButton pRipple label="Nuevo Mantenimiento" icon="pi pi-plus" class="p-button-success mr-2" 
                                        (click)="openNew()"></button>
                                <button pButton pRipple label="Eliminar" icon="pi pi-trash" class="p-button-danger" 
                                        (click)="deleteSelectedMantenimientos()" 
                                        [disabled]="!selectedMantenimientos || !selectedMantenimientos.length"></button>
                            </div>
                        </ng-template>

                        <ng-template pTemplate="right">
                            <button pButton pRipple label="Exportar" icon="pi pi-upload" class="p-button-help" 
                                    (click)="exportMantenimientos()"></button>
                        </ng-template>
                    </p-toolbar>

                    <!-- TABLA DE PRIMENG -->
                    <p-table #dt [value]="mantenimientos" [columns]="cols" responsiveLayout="scroll" 
                             [rows]="10" [globalFilterFields]="['descripcion','proveedor.nombre','frecuencia']" 
                             [loading]="loading" [paginator]="true" [rowsPerPageOptions]="rowsPerPageOptions" 
                             [showCurrentPageReport]="true" currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} mantenimientos"
                             [(selection)]="selectedMantenimientos" selectionMode="multiple" [rowHover]="true" dataKey="idContrato">
                        
                        <ng-template pTemplate="caption">
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                                <h5 class="m-0">Gestión de Mantenimientos</h5>
                                <span class="block mt-2 md:mt-0 p-input-icon-left">
                                    <i class="pi pi-search"></i>
                                    <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" 
                                           placeholder="Buscar..." class="w-full sm:w-auto"/>
                                </span>
                            </div>
                        </ng-template>
                        
                        <ng-template pTemplate="header">
                            <tr>
                                <th style="width: 3rem">
                                    <p-tableHeaderCheckbox></p-tableHeaderCheckbox>
                                </th>
                                <th pSortableColumn="descripcion">Descripción <p-sortIcon field="descripcion"></p-sortIcon></th>
                                <th pSortableColumn="proveedor.nombre">Proveedor <p-sortIcon field="proveedor.nombre"></p-sortIcon></th>
                                <th pSortableColumn="fechaInicio">Fecha Inicio <p-sortIcon field="fechaInicio"></p-sortIcon></th>
                                <th pSortableColumn="fechaFin">Fecha Fin <p-sortIcon field="fechaFin"></p-sortIcon></th>
                                <th pSortableColumn="frecuencia">Frecuencia <p-sortIcon field="frecuencia"></p-sortIcon></th>
                                <th pSortableColumn="estado">Estado <p-sortIcon field="estado"></p-sortIcon></th>
                                <th>Acciones</th>
                            </tr>
                        </ng-template>
                        
                        <ng-template pTemplate="body" let-mantenimiento>
                            <tr>
                                <td>
                                    <p-tableCheckbox [value]="mantenimiento"></p-tableCheckbox>
                                </td>
                                <td style="width:14%; min-width:10rem;">
                                    <span class="p-column-title">Descripción</span>
                                    {{mantenimiento.descripcion}}
                                </td>
                                <td style="width:14%; min-width:10rem;">
                                    <span class="p-column-title">Proveedor</span>
                                    {{mantenimiento.proveedor?.nombre || 'Sin proveedor'}}
                                </td>
                                <td style="width:14%; min-width:8rem;">
                                    <span class="p-column-title">Fecha Inicio</span>
                                    {{formatDate(mantenimiento.fechaInicio)}}
                                </td>
                                <td style="width:14%; min-width:8rem;">
                                    <span class="p-column-title">Fecha Fin</span>
                                    {{formatDate(mantenimiento.fechaFin)}}
                                </td>
                                <td style="width:14%; min-width:10rem;">
                                    <span class="p-column-title">Frecuencia</span>
                                    <p-tag [value]="mantenimiento.frecuencia || 'Sin frecuencia'" severity="info"></p-tag>
                                </td>
                                <td style="width:14%; min-width:10rem;">
                                    <span class="p-column-title">Estado</span>
                                    <p-tag [value]="getEstadoText(mantenimiento.estado)" 
                                           [severity]="getEstadoSeverity(mantenimiento.estado)"></p-tag>
                                </td>
                                <td>
                                    <div class="flex">
                                        <button pButton pRipple icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" 
                                                (click)="editMantenimiento(mantenimiento)"></button>
                                        <button pButton pRipple icon="pi pi-trash" class="p-button-rounded p-button-warning" 
                                                (click)="deleteMantenimiento(mantenimiento)"></button>
                                    </div>
                                </td>
                            </tr>
                        </ng-template>
                        
                        <ng-template pTemplate="emptymessage">
                            <tr>
                                <td colspan="8" class="text-center">No se encontraron mantenimientos</td>
                            </tr>
                        </ng-template>
                    </p-table>
                </div>
            </div>
        </div>

        <!-- Diálogo simple para crear mantenimiento -->
        <p-dialog [(visible)]="mantenimientoDialog" [style]="{width: '500px'}" header="Nuevo Mantenimiento" 
                  [modal]="true" class="p-fluid">
            <ng-template pTemplate="content">
                <div class="field">
                    <label for="descripcion">Descripción *</label>
                    <input type="text" pInputText id="descripcion" [(ngModel)]="mantenimiento.descripcion" 
                           required autofocus [class.ng-invalid]="submitted && !mantenimiento.descripcion" />
                </div>
                
                <div class="field">
                    <label for="fechaInicio">Fecha Inicio *</label>
                    <p-calendar [(ngModel)]="mantenimiento.fechaInicio" dateFormat="dd/mm/yy" 
                                [showIcon]="true" inputId="fechaInicio"></p-calendar>
                </div>
                
                <div class="field">
                    <label for="fechaFin">Fecha Fin *</label>
                    <p-calendar [(ngModel)]="mantenimiento.fechaFin" dateFormat="dd/mm/yy" 
                                [showIcon]="true" inputId="fechaFin"></p-calendar>
                </div>
                
                <div class="field">
                    <label for="frecuencia">Frecuencia *</label>
                    <p-dropdown [options]="frecuenciaOptions" [(ngModel)]="mantenimiento.frecuencia" 
                                placeholder="Seleccionar frecuencia"></p-dropdown>
                </div>
                
                <div class="field">
                    <label for="proveedor">Proveedor *</label>
                    <p-dropdown [options]="proveedoresDisponibles" [(ngModel)]="mantenimiento.proveedor" 
                                optionLabel="nombre" placeholder="Seleccionar proveedor"></p-dropdown>
                </div>
            </ng-template>

            <ng-template pTemplate="footer">
                <button pButton pRipple label="Cancelar" icon="pi pi-times" class="p-button-text" 
                        (click)="hideDialog()"></button>
                <button pButton pRipple label="Guardar" icon="pi pi-check" class="p-button-text" 
                        (click)="saveMantenimiento()"></button>
            </ng-template>
        </p-dialog>

        <!-- Diálogo de confirmación para eliminar -->
        <p-dialog [(visible)]="deleteMantenimientoDialog" header="Confirmar" [modal]="true" [style]="{width:'450px'}">
            <div class="flex align-items-center justify-content-center">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem"></i>
                <span *ngIf="mantenimiento">¿Está seguro que desea eliminar <b>{{mantenimiento.descripcion}}</b>?</span>
            </div>
            <ng-template pTemplate="footer">
                <button pButton pRipple icon="pi pi-times" class="p-button-text" label="No" 
                        (click)="deleteMantenimientoDialog = false"></button>
                <button pButton pRipple icon="pi pi-check" class="p-button-text" label="Sí" 
                        (click)="confirmDelete()"></button>
            </ng-template>
        </p-dialog>
    `,
    providers: [MessageService, ConfirmationService]
})
export class MantenimientosComponent implements OnInit {

    mantenimientoDialog: boolean = false;
    deleteMantenimientoDialog: boolean = false;
    deleteMantenimientosDialog: boolean = false;

    mantenimientos: Mantenimiento[] = [];
    mantenimiento: Mantenimiento = this.getEmptyMantenimiento();
    selectedMantenimientos: Mantenimiento[] = [];

    equiposDisponibles: Equipo[] = [];
    proveedoresDisponibles: Proveedor[] = [];
    tiposDisponibles: TipoMantenimiento[] = [];

    submitted: boolean = false;
    loading: boolean = false;

    cols: any[] = [];
    frecuenciaOptions: any[] = [];
    rowsPerPageOptions = [5, 10, 20];

    constructor(
        private mantenimientoService: MantenimientoService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) { }

    ngOnInit() {
        this.loadMantenimientos();
        this.loadCatalogos();
        this.initColumns();
        this.initFrecuenciaOptions();
    }

    /**
     * Cargar todos los mantenimientos
     */
    loadMantenimientos() {
        this.loading = true;
        console.log('[Mantenimientos] Iniciando carga de mantenimientos...');
        
        this.mantenimientoService.getMantenimientos().subscribe({
            next: (data) => {
                console.log('[Mantenimientos] Datos recibidos:', data);
                console.log('[Mantenimientos] Primer mantenimiento:', data[0]);
                if (data[0]) {
                    console.log('[Mantenimientos] Estructura del objeto:', Object.keys(data[0]));
                }
                this.mantenimientos = data;
                this.loading = false;
            },
            error: (error) => {
                console.error('[Mantenimientos] Error al cargar:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: `No se pudieron cargar los mantenimientos: ${error.message || error.error?.message || 'Error desconocido'}`
                });
                this.loading = false;
            }
        });
    }

    /**
     * Cargar catálogos necesarios
     */
    loadCatalogos() {
        console.log('[Mantenimientos] Cargando catálogos...');
        
        // Cargar equipos
        this.mantenimientoService.getEquiposDisponibles().subscribe({
            next: (equipos) => {
                console.log('[Mantenimientos] Equipos cargados:', equipos);
                this.equiposDisponibles = equipos;
            },
            error: (error) => {
                console.error('[Mantenimientos] Error cargando equipos:', error);
            }
        });

        // Cargar proveedores
        this.mantenimientoService.getProveedoresDisponibles().subscribe({
            next: (proveedores) => {
                console.log('[Mantenimientos] Proveedores cargados:', proveedores);
                this.proveedoresDisponibles = proveedores;
            },
            error: (error) => {
                console.error('[Mantenimientos] Error cargando proveedores:', error);
            }
        });

        // Cargar tipos de mantenimiento
        this.mantenimientoService.getTiposDisponibles().subscribe({
            next: (tipos) => {
                console.log('[Mantenimientos] Tipos cargados:', tipos);
                this.tiposDisponibles = tipos;
            },
            error: (error) => {
                console.error('[Mantenimientos] Error cargando tipos:', error);
            }
        });
    }

    /**
     * Inicializar columnas de la tabla
     */
    initColumns() {
        this.cols = [
            { field: 'descripcion', header: 'Descripción' },
            { field: 'proveedor.nombre', header: 'Proveedor' },
            { field: 'fechaInicio', header: 'Fecha Inicio' },
            { field: 'fechaFin', header: 'Fecha Fin' },
            { field: 'frecuencia', header: 'Frecuencia' },
            { field: 'estado', header: 'Estado' }
        ];
    }

    /**
     * Inicializar opciones de frecuencia
     */
    initFrecuenciaOptions() {
        this.frecuenciaOptions = [
            { label: 'Mensual', value: 'mensual' },
            { label: 'Bimestral', value: 'bimestral' },
            { label: 'Trimestral', value: 'trimestral' },
            { label: 'Semestral', value: 'semestral' },
            { label: 'Anual', value: 'anual' },
            { label: 'A demanda', value: 'a_demanda' }
        ];
    }

    /**
     * Abrir diálogo para nuevo mantenimiento
     */
    openNew() {
        this.mantenimiento = this.getEmptyMantenimiento();
        this.submitted = false;
        this.mantenimientoDialog = true;
    }

    /**
     * Eliminar mantenimientos seleccionados
     */
    deleteSelectedMantenimientos() {
        this.deleteMantenimientosDialog = true;
    }

    /**
     * Editar mantenimiento
     */
    editMantenimiento(mantenimiento: Mantenimiento) {
        this.mantenimiento = { ...mantenimiento };
        this.mantenimientoDialog = true;
    }

    /**
     * Eliminar mantenimiento
     */
    deleteMantenimiento(mantenimiento: Mantenimiento) {
        this.deleteMantenimientoDialog = true;
        this.mantenimiento = { ...mantenimiento };
    }

    /**
     * Confirmar eliminación de mantenimientos seleccionados
     */
    confirmDeleteSelected() {
        this.deleteMantenimientosDialog = false;
        
        const deletePromises = this.selectedMantenimientos.map(mantenimiento => 
            this.mantenimientoService.deleteMantenimiento(mantenimiento.idContrato!).toPromise()
        );

        Promise.all(deletePromises).then(() => {
            this.mantenimientos = this.mantenimientos.filter(val => 
                !this.selectedMantenimientos.includes(val)
            );
            this.selectedMantenimientos = [];
            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Mantenimientos eliminados'
            });
        }).catch((error) => {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al eliminar mantenimientos'
            });
        });
    }

    /**
     * Confirmar eliminación de mantenimiento
     */
    confirmDelete() {
        this.deleteMantenimientoDialog = false;
        
        this.mantenimientoService.deleteMantenimiento(this.mantenimiento.idContrato!).subscribe({
            next: () => {
                this.mantenimientos = this.mantenimientos.filter(val => 
                    val.idContrato !== this.mantenimiento.idContrato
                );
                this.mantenimiento = this.getEmptyMantenimiento();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Mantenimiento eliminado'
                });
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al eliminar mantenimiento'
                });
            }
        });
    }

    /**
     * Ocultar diálogo
     */
    hideDialog() {
        this.mantenimientoDialog = false;
        this.submitted = false;
    }

    /**
     * Guardar mantenimiento
     */
    saveMantenimiento() {
        this.submitted = true;

        if (this.isValidMantenimiento()) {
            if (this.mantenimiento.idContrato) {
                // Actualizar
                this.mantenimientoService.updateMantenimiento(
                    this.mantenimiento.idContrato, 
                    this.mantenimiento
                ).subscribe({
                    next: (updatedMantenimiento) => {
                        const index = this.findIndexById(this.mantenimiento.idContrato!);
                        this.mantenimientos[index] = updatedMantenimiento;
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Mantenimiento actualizado'
                        });
                        this.hideDialog();
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al actualizar mantenimiento'
                        });
                    }
                });
            } else {
                // Crear nuevo
                this.mantenimientoService.createMantenimiento(this.mantenimiento).subscribe({
                    next: (newMantenimiento) => {
                        this.mantenimientos.push(newMantenimiento);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Mantenimiento creado'
                        });
                        this.hideDialog();
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al crear mantenimiento'
                        });
                    }
                });
            }
        }
    }

    /**
     * Validar mantenimiento
     */
    isValidMantenimiento(): boolean {
        return this.mantenimiento.descripcion && 
               this.mantenimiento.descripcion.trim() !== '' &&
               this.mantenimiento.fechaInicio != null &&
               this.mantenimiento.fechaFin != null &&
               this.mantenimiento.frecuencia && 
               this.mantenimiento.frecuencia.trim() !== '' &&
               this.mantenimiento.proveedor != null;
    }

    /**
     * Encontrar índice por ID
     */
    findIndexById(id: number): number {
        return this.mantenimientos.findIndex(mantenimiento => mantenimiento.idContrato === id);
    }

    /**
     * Obtener mantenimiento vacío
     */
    getEmptyMantenimiento(): Mantenimiento {
        return {
            descripcion: '',
            fechaInicio: new Date(),
            fechaFin: new Date(),
            frecuencia: '',
            estado: true
        };
    }

    /**
     * Filtro global para la tabla
     */
    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    /**
     * Formatear fecha para mostrar
     */
    formatDate(date: Date | string): string {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('es-GT');
    }

    /**
     * Obtener texto de estado
     */
    getEstadoText(estado: boolean): string {
        return estado ? 'Activo' : 'Inactivo';
    }

    /**
     * Obtener severidad para el estado
     */
    getEstadoSeverity(estado: boolean): string {
        return estado ? 'success' : 'danger';
    }

    /**
     * Exportar mantenimientos
     */
    exportMantenimientos() {
        // Implementar funcionalidad de exportación
        this.messageService.add({
            severity: 'info',
            summary: 'Exportación',
            detail: 'Funcionalidad de exportación pendiente de implementar'
        });
    }
}
