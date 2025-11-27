import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EquiposListComponent } from './equipos-list.component';
import { HistorialEquiposComponent } from './historial-equipos/historial-equipos.component';

const routes: Routes = [
  { path: '', component: EquiposListComponent },
  { path: 'historial', component: HistorialEquiposComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EquiposRoutingModule { }