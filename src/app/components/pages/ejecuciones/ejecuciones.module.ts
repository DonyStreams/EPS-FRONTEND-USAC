import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { FileUploadModule } from 'primeng/fileupload';
import { ProgressBarModule } from 'primeng/progressbar';
import { MenuModule } from 'primeng/menu';

import { EjecucionesRoutingModule } from './ejecuciones-routing.module';
import { EjecucionesComponent } from './ejecuciones.component';

@NgModule({
    declarations: [EjecucionesComponent],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        EjecucionesRoutingModule,
        TableModule,
        ButtonModule,
        ToastModule,
        ToolbarModule,
        DialogModule,
        DropdownModule,
        CalendarModule,
        InputTextModule,
        InputTextareaModule,
        InputNumberModule,
        ConfirmDialogModule,
        TooltipModule,
        TagModule,
        FileUploadModule,
        ProgressBarModule,
        MenuModule
    ]
})
export class EjecucionesModule { }
