import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { ButtonModule } from 'primeng/button';

@NgModule({
    imports: [
        CommonModule,
        LoginRoutingModule,
        ButtonModule
    ],
    declarations: [LoginComponent]
})
export class LoginModule { }
