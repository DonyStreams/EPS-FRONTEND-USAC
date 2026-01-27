import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { TagModule } from 'primeng/tag';
import { FileUploadModule } from 'primeng/fileupload';
import { ProgressBarModule } from 'primeng/progressbar';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { TabViewModule } from 'primeng/tabview';
import { AccordionModule } from 'primeng/accordion';
import { ChipModule } from 'primeng/chip';
import { BadgeModule } from 'primeng/badge';

// Componentes
import { TicketsComponent } from './tickets.component';
import { HistorialTicketsComponent } from './historial-tickets/historial-tickets.component';

@NgModule({
    declarations: [
        TicketsComponent,
        HistorialTicketsComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TableModule,
        ButtonModule,
        ToastModule,
        ToolbarModule,
        DialogModule,
        InputTextModule,
        InputTextareaModule,
        DropdownModule,
        CalendarModule,
        TagModule,
        FileUploadModule,
        ProgressBarModule,
        CardModule,
        PanelModule,
        ConfirmDialogModule,
        CheckboxModule,
        TooltipModule,
        TabViewModule,
        AccordionModule,
        ChipModule,
        BadgeModule,
        RouterModule.forChild([
            { path: '', component: TicketsComponent },
            { path: 'historial', component: HistorialTicketsComponent }
        ])
    ]
})
export class TicketsModule { }