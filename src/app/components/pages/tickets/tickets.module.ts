import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-tickets',
    template: `
        <div class="card">
            <h5>Sistema de Tickets</h5>
            <p>Gestión de incidencias y tickets de soporte técnico.</p>
            <p-toolbar styleClass="mb-4">
                <ng-template pTemplate="left">
                    <button pButton label="Nuevo Ticket" icon="pi pi-plus" class="p-button-success mr-2"></button>
                    <button pButton label="Prioridades" icon="pi pi-exclamation-triangle" class="p-button-info"></button>
                </ng-template>
            </p-toolbar>
            <p-table [value]="[]" styleClass="p-datatable-gridlines">
                <ng-template pTemplate="header">
                    <tr><th>ID</th><th>Equipo</th><th>Descripción</th><th>Prioridad</th><th>Estado</th><th>Acciones</th></tr>
                </ng-template>
                <ng-template pTemplate="body">
                    <tr><td colspan="6" class="text-center p-4">Módulo en construcción</td></tr>
                </ng-template>
            </p-table>
        </div>
        <p-toast></p-toast>
    `
})
export class TicketsComponent { }

@NgModule({
    declarations: [TicketsComponent],
    imports: [
        CommonModule,
        TableModule,
        ButtonModule,
        ToastModule,
        ToolbarModule,
        RouterModule.forChild([
            { path: '', component: TicketsComponent },
            { path: 'nuevo', component: TicketsComponent },
            { path: 'prioridades', component: TicketsComponent }
        ])
    ]
})
export class TicketsModule { }
