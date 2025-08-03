import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProgramacionesComponent } from './programaciones.component';

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: ProgramacionesComponent },
        { path: 'nuevo', component: ProgramacionesComponent },
        { path: 'editar/:id', component: ProgramacionesComponent }
    ])],
    exports: [RouterModule]
})
export class ProgramacionesRoutingModule { }
