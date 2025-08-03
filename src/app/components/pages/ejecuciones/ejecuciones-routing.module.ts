import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EjecucionesComponent } from './ejecuciones.component';

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: EjecucionesComponent }
    ])],
    exports: [RouterModule]
})
export class EjecucionesRoutingModule { }
