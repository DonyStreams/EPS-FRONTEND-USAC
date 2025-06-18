import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [RouterModule.forChild([        
        { path: 'usuarios', loadChildren: () => import('./usuarios/usuarios.module').then(m => m.CrudModule) },                
        { path: 'participantes', loadChildren: () => import('./participantes/participantes.module').then(m => m.CrudModule) },                
        { path: 'mantenimientos', loadChildren: () => import('./mantenimientos/mantenimientos.module').then(m => m.CrudModule) },                
        { path: 'dashboard', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule) },                
        { path: 'equipos', loadChildren: () => import('./equipos/equipos.module').then(m => m.EquiposModule) },                
        { path: '**', redirectTo: '/notfound' }
    ])],
    exports: [RouterModule]
})
export class PagesRoutingModule { }
