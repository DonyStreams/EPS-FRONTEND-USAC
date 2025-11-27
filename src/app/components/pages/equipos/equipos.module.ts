import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { FileUploadModule } from 'primeng/fileupload';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';

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
    TableModule,
    InputTextModule,
    ButtonModule,
    TooltipModule,
    FileUploadModule,
    DialogModule,
    DropdownModule,
    EquiposRoutingModule
  ]
})
export class EquiposModule { }