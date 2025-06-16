import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [RouterModule.forChild([        
        { path: 'usuarios', loadChildren: () => import('./usuarios/usuarios.module').then(m => m.CrudModule) },                
        { path: 'participantes', loadChildren: () => import('./participantes/participantes.module').then(m => m.CrudModule) },                
        { path: 'mantenimientos', loadChildren: () => import('./mantenimientos/mantenimientos.module').then(m => m.CrudModule) },                
        { path: '**', redirectTo: '/notfound' }
    ])],
    exports: [RouterModule]
})
export class PagesRoutingModule { }
