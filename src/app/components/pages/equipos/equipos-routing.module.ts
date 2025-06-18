import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EquiposListComponent } from './equipos-list.component';

const routes: Routes = [
  { path: '', component: EquiposListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EquiposRoutingModule { }