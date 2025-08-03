import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';

import { TiposMantenimientoRoutingModule } from './tipos-mantenimiento-routing.module';
import { TiposMantenimientoComponent } from './tipos-mantenimiento.component';

@NgModule({
    declarations: [
        TiposMantenimientoComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TiposMantenimientoRoutingModule,
        
        // PrimeNG
        TableModule,
        ButtonModule,
        RippleModule,
        TooltipModule,
        DialogModule,
        InputTextModule,
        CheckboxModule,
        ConfirmDialogModule,
        ToastModule,
        ToolbarModule,
        TagModule
    ]
})
export class TiposMantenimientoModule { }
