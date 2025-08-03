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
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';

import { ProgramacionesRoutingModule } from './programaciones-routing.module';
import { ProgramacionesComponent } from './programaciones.component';

@NgModule({
    declarations: [
        ProgramacionesComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ProgramacionesRoutingModule,
        
        // PrimeNG
        TableModule,
        ButtonModule,
        RippleModule,
        TooltipModule,
        DialogModule,
        InputTextModule,
        InputTextareaModule,
        CalendarModule,
        DropdownModule,
        InputNumberModule,
        CheckboxModule,
        ConfirmDialogModule,
        ToastModule,
        ToolbarModule,
        TagModule
    ]
})
export class ProgramacionesModule { }
