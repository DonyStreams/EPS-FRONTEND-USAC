import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { FileUploadModule } from 'primeng/fileupload';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CheckboxModule } from 'primeng/checkbox';
import { MenuModule } from 'primeng/menu';
import { SharedModule } from '../../../shared/shared.module';

import { EquiposListComponent } from './equipos-list.component';
import { HistorialEquiposComponent } from './historial-equipos/historial-equipos.component';
import { EquiposRoutingModule } from './equipos-routing.module';

@NgModule({
  declarations: [
    EquiposListComponent,
    HistorialEquiposComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    TooltipModule,
    FileUploadModule,
    DialogModule,
    DropdownModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    CheckboxModule,
    MenuModule,
    SharedModule,
    EquiposRoutingModule
  ]
})
export class EquiposModule { }