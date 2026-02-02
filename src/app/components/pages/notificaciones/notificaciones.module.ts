import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SharedModule } from '../../../shared/shared.module';

// Component
import { NotificacionesComponent } from './notificaciones.component';

@NgModule({
    declarations: [NotificacionesComponent],
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        ToastModule,
        ToolbarModule,
        BadgeModule,
        TagModule,
        DialogModule,
        InputSwitchModule,
        InputNumberModule,
        ConfirmDialogModule,
        TooltipModule,
        InputTextModule,
        MenuModule,
        ProgressSpinnerModule,
        SharedModule,
        RouterModule.forChild([{ path: '', component: NotificacionesComponent }])
    ]
})
export class NotificacionesModule { }
