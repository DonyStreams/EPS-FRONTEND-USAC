import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-areas',
    template: `
        <div class="card">
            <h5>Gestión de Áreas</h5>
            <p>Administración de áreas y laboratorios del INACIF.</p>
            <p-toolbar styleClass="mb-4">
                <ng-template pTemplate="left">
                    <button pButton label="Nueva Área" icon="pi pi-plus" class="p-button-success"></button>
                </ng-template>
            </p-toolbar>
            <p-table [value]="[]" styleClass="p-datatable-gridlines">
                <ng-template pTemplate="header">
                    <tr><th>Código</th><th>Nombre</th><th>Tipo</th><th>Estado</th><th>Acciones</th></tr>
                </ng-template>
                <ng-template pTemplate="body">
                    <tr><td colspan="5" class="text-center p-4">Módulo en construcción</td></tr>
                </ng-template>
            </p-table>
        </div>
        <p-toast></p-toast>
    `
})
export class AreasComponent { }

@NgModule({
    declarations: [AreasComponent],
    imports: [
        CommonModule,
        TableModule,
        ButtonModule,
        ToastModule,
        ToolbarModule,
        RouterModule.forChild([{ path: '', component: AreasComponent }])
    ]
})
export class AreasModule { }
