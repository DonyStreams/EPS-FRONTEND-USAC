import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';

import { EjecucionesRoutingModule } from './ejecuciones-routing.module';
import { EjecucionesComponent } from './ejecuciones.component';

@NgModule({
    declarations: [EjecucionesComponent],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        EjecucionesRoutingModule,
        TableModule,
        ButtonModule,
        ToastModule,
        ToolbarModule
    ]
})
export class EjecucionesModule { }
