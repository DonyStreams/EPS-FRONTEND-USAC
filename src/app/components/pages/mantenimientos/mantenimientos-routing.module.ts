import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MantenimientosComponent } from './mantenimientos.component';

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: MantenimientosComponent }
	])],
	exports: [RouterModule]
})
export class MantenimientosRoutingModule { }
