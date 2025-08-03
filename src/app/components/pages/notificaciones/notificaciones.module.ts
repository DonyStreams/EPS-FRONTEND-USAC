import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { BadgeModule } from 'primeng/badge';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-notificaciones',
    template: `
        <div class="card">
            <h5>Panel de Notificaciones</h5>
            <p>Centro de notificaciones y alertas del sistema.</p>
            
            <div class="grid">
                <div class="col-12 md:col-4">
                    <div class="card bg-blue-50">
                        <div class="flex justify-content-between align-items-center">
                            <div>
                                <span class="block text-blue-900 font-medium mb-2">Notificaciones Nuevas</span>
                                <div class="text-blue-900 font-bold text-2xl">0</div>
                            </div>
                            <i class="pi pi-bell text-blue-500 text-4xl"></i>
                        </div>
                    </div>
                </div>
                
                <div class="col-12 md:col-4">
                    <div class="card bg-orange-50">
                        <div class="flex justify-content-between align-items-center">
                            <div>
                                <span class="block text-orange-900 font-medium mb-2">Alertas Pendientes</span>
                                <div class="text-orange-900 font-bold text-2xl">0</div>
                            </div>
                            <i class="pi pi-exclamation-triangle text-orange-500 text-4xl"></i>
                        </div>
                    </div>
                </div>
                
                <div class="col-12 md:col-4">
                    <div class="card bg-red-50">
                        <div class="flex justify-content-between align-items-center">
                            <div>
                                <span class="block text-red-900 font-medium mb-2">Críticas</span>
                                <div class="text-red-900 font-bold text-2xl">0</div>
                            </div>
                            <i class="pi pi-times-circle text-red-500 text-4xl"></i>
                        </div>
                    </div>
                </div>
            </div>
            
            <p-toolbar styleClass="mb-4">
                <ng-template pTemplate="left">
                    <button pButton label="Marcar todas como leídas" icon="pi pi-check" class="p-button-success"></button>
                </ng-template>
            </p-toolbar>
            
            <p-table [value]="[]" styleClass="p-datatable-gridlines">
                <ng-template pTemplate="header">
                    <tr><th>Tipo</th><th>Título</th><th>Mensaje</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr>
                </ng-template>
                <ng-template pTemplate="body">
                    <tr><td colspan="6" class="text-center p-4">No hay notificaciones</td></tr>
                </ng-template>
            </p-table>
        </div>
        <p-toast></p-toast>
    `
})
export class NotificacionesComponent { }

@NgModule({
    declarations: [NotificacionesComponent],
    imports: [
        CommonModule,
        TableModule,
        ButtonModule,
        ToastModule,
        ToolbarModule,
        BadgeModule,
        RouterModule.forChild([{ path: '', component: NotificacionesComponent }])
    ]
})
export class NotificacionesModule { }
