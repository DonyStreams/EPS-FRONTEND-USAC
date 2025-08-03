import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TiposMantenimientoComponent } from './tipos-mantenimiento.component';

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: TiposMantenimientoComponent }
    ])],
    exports: [RouterModule]
})
export class TiposMantenimientoRoutingModule { }
