// Proveedores Module
import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-proveedores',
    template: `
        <div class="card">
            <h5>Proveedores de Mantenimiento</h5>
            <p>Gestión de proveedores de servicios de mantenimiento.</p>
            <p-toolbar styleClass="mb-4">
                <ng-template pTemplate="left">
                    <button pButton label="Nuevo Proveedor" icon="pi pi-plus" class="p-button-success"></button>
                </ng-template>
            </p-toolbar>
            <p-table [value]="[]" styleClass="p-datatable-gridlines">
                <ng-template pTemplate="header">
                    <tr><th>NIT</th><th>Nombre</th><th>Estado</th><th>Acciones</th></tr>
                </ng-template>
                <ng-template pTemplate="body">
                    <tr><td colspan="4" class="text-center p-4">Módulo en construcción</td></tr>
                </ng-template>
            </p-table>
        </div>
        <p-toast></p-toast>
    `
})
export class ProveedoresComponent { }

@NgModule({
    declarations: [ProveedoresComponent],
    imports: [
        CommonModule,
        TableModule,
        ButtonModule,
        ToastModule,
        ToolbarModule,
        RouterModule.forChild([{ path: '', component: ProveedoresComponent }])
    ]
})
export class ProveedoresModule { }
