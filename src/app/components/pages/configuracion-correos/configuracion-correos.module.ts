import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { SharedModule } from '../../../shared/shared.module';

import { ConfiguracionCorreosComponent } from './configuracion-correos.component';

@NgModule({
    declarations: [ConfiguracionCorreosComponent],
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        ToastModule,
        InputTextareaModule,
        SharedModule,
        RouterModule.forChild([{ path: '', component: ConfiguracionCorreosComponent }])
    ]
})
export class ConfiguracionCorreosModule { }
