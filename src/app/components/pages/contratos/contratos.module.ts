import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-contratos',
    template: `
        <div class="card">
            <h5>Contratos de Mantenimiento</h5>
            <p>Gestión de contratos con proveedores de mantenimiento.</p>
            <p-toolbar styleClass="mb-4">
                <ng-template pTemplate="left">
                    <button pButton label="Nuevo Contrato" icon="pi pi-plus" class="p-button-success mr-2"></button>
                    <button pButton label="Subir Contrato" icon="pi pi-upload" class="p-button-info"></button>
                </ng-template>
            </p-toolbar>
            <p-table [value]="[]" styleClass="p-datatable-gridlines">
                <ng-template pTemplate="header">
                    <tr><th>Proveedor</th><th>Fecha Inicio</th><th>Fecha Fin</th><th>Frecuencia</th><th>Estado</th><th>Acciones</th></tr>
                </ng-template>
                <ng-template pTemplate="body">
                    <tr><td colspan="6" class="text-center p-4">Módulo en construcción</td></tr>
                </ng-template>
            </p-table>
        </div>
        <p-toast></p-toast>
    `
})
export class ContratosComponent { }

@NgModule({
    declarations: [ContratosComponent],
    imports: [
        CommonModule,
        TableModule,
        ButtonModule,
        ToastModule,
        ToolbarModule,
        RouterModule.forChild([
            { path: '', component: ContratosComponent },
            { path: 'nuevo', component: ContratosComponent }
        ])
    ]
})
export class ContratosModule { }
