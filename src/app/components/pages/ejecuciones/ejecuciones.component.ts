import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-ejecuciones',
    template: `
        <div class="card">
            <h5>Ejecuciones de Mantenimiento</h5>
            <p>Módulo en desarrollo - Aquí se mostrarán las ejecuciones de mantenimiento realizadas.</p>
            
            <p-toolbar styleClass="mb-4">
                <ng-template pTemplate="left">
                    <button pButton pRipple label="Nueva Ejecución" icon="pi pi-plus" class="p-button-success"></button>
                </ng-template>
            </p-toolbar>

            <p-table [value]="[]" styleClass="p-datatable-gridlines">
                <ng-template pTemplate="header">
                    <tr>
                        <th>Fecha</th>
                        <th>Equipo</th>
                        <th>Tipo Mantenimiento</th>
                        <th>Responsable</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body">
                    <tr>
                        <td colspan="6" class="text-center p-4">
                            <i class="pi pi-info-circle text-4xl text-blue-500 mb-3"></i>
                            <p>Módulo en construcción</p>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
        <p-toast></p-toast>
    `
})
export class EjecucionesComponent implements OnInit {
    
    constructor() { }

    ngOnInit(): void {
        // TODO: Implementar carga de datos
    }
}
