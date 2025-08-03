import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ChartModule } from 'primeng/chart';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-reportes',
    template: `
        <div class="grid">
            <div class="col-12">
                <div class="card">
                    <h5>Reportes Técnicos</h5>
                    <p>Reportes y análisis del sistema de mantenimientos.</p>
                    
                    <div class="grid">
                        <div class="col-12 md:col-6 lg:col-3">
                            <div class="card bg-blue-500 text-white">
                                <div class="flex justify-content-between align-items-center">
                                    <div>
                                        <span class="block font-medium mb-3">Mantenimientos</span>
                                        <div class="text-2xl font-medium">0</div>
                                    </div>
                                    <i class="pi pi-cog text-blue-100 text-4xl"></i>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-12 md:col-6 lg:col-3">
                            <div class="card bg-green-500 text-white">
                                <div class="flex justify-content-between align-items-center">
                                    <div>
                                        <span class="block font-medium mb-3">Completados</span>
                                        <div class="text-2xl font-medium">0</div>
                                    </div>
                                    <i class="pi pi-check-circle text-green-100 text-4xl"></i>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-12 md:col-6 lg:col-3">
                            <div class="card bg-orange-500 text-white">
                                <div class="flex justify-content-between align-items-center">
                                    <div>
                                        <span class="block font-medium mb-3">Pendientes</span>
                                        <div class="text-2xl font-medium">0</div>
                                    </div>
                                    <i class="pi pi-clock text-orange-100 text-4xl"></i>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-12 md:col-6 lg:col-3">
                            <div class="card bg-red-500 text-white">
                                <div class="flex justify-content-between align-items-center">
                                    <div>
                                        <span class="block font-medium mb-3">Vencidos</span>
                                        <div class="text-2xl font-medium">0</div>
                                    </div>
                                    <i class="pi pi-times-circle text-red-100 text-4xl"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <p-toolbar styleClass="mb-4">
                        <ng-template pTemplate="left">
                            <button pButton label="Generar Reporte" icon="pi pi-file-pdf" class="p-button-success mr-2"></button>
                            <button pButton label="Exportar Excel" icon="pi pi-file-excel" class="p-button-info"></button>
                        </ng-template>
                    </p-toolbar>
                    
                    <div class="text-center p-4">
                        <i class="pi pi-chart-bar text-6xl text-blue-500 mb-3"></i>
                        <p class="text-xl">Módulo de reportes en construcción</p>
                        <p class="text-500">Aquí se mostrarán gráficos y reportes detallados</p>
                    </div>
                </div>
            </div>
        </div>
        <p-toast></p-toast>
    `
})
export class ReportesComponent { }

@NgModule({
    declarations: [ReportesComponent],
    imports: [
        CommonModule,
        TableModule,
        ButtonModule,
        ToastModule,
        ToolbarModule,
        ChartModule,
        RouterModule.forChild([{ path: '', component: ReportesComponent }])
    ]
})
export class ReportesModule { }
