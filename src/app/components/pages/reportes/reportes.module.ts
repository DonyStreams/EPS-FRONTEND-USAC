import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { SharedModule } from '../../../shared/shared.module';

import { ReportesComponent } from './reportes.component';

@NgModule({
    declarations: [ReportesComponent],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild([{ path: '', component: ReportesComponent }]),
        ButtonModule,
        CalendarModule,
        DropdownModule,
        ToastModule,
        SharedModule
    ]
})
export class ReportesModule { }
