import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SharedModule } from '../../../shared/shared.module';

import { HistorialProgramacionesComponent } from './historial-programaciones.component';

@NgModule({
    declarations: [
        HistorialProgramacionesComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        TagModule,
        ToastModule,
        ConfirmDialogModule,
        SharedModule,
        RouterModule.forChild([
            { path: '', component: HistorialProgramacionesComponent }
        ])
    ]
})
export class HistorialProgramacionesModule { }
