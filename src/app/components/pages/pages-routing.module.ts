import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [RouterModule.forChild([        
        // Dashboard
        { path: 'dashboard', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule) },
        
        // Gestión de Equipos
        { path: 'equipos', loadChildren: () => import('./equipos/equipos.module').then(m => m.EquiposModule) },
        
        // Gestión de Mantenimientos
        { path: 'mantenimientos', loadChildren: () => import('./mantenimientos/mantenimientos.module').then(m => m.MantenimientosModule) },
        { path: 'ejecuciones', loadChildren: () => import('./ejecuciones/ejecuciones.module').then(m => m.EjecucionesModule) },
        { path: 'tipos-mantenimiento', loadChildren: () => import('./tipos-mantenimiento/tipos-mantenimiento.module').then(m => m.TiposMantenimientoModule) },
        { path: 'proveedores', loadChildren: () => import('./proveedores/proveedores.module').then(m => m.ProveedoresModule) },
        
        // Tickets - TEMPORALMENTE COMENTADO MIENTRAS SE ARREGLA EL MÓDULO
        // { path: 'tickets', loadChildren: () => import('./tickets/tickets.module').then(m => m.TicketsModule) },
        
        // Contratos
        { path: 'contratos', loadChildren: () => import('./contratos/contratos.module').then(m => m.ContratosModule) },
        
        // Reportes
        { path: 'reportes', loadChildren: () => import('./reportes/reportes.module').then(m => m.ReportesModule) },
        
        // Administración
        { path: 'areas', loadChildren: () => import('./areas/areas.module').then(m => m.AreasModule) },
        { path: 'usuarios', loadChildren: () => import('./usuarios/usuarios.module').then(m => m.CrudModule) },
        
        // Notificaciones
        { path: 'notificaciones', loadChildren: () => import('./notificaciones/notificaciones.module').then(m => m.NotificacionesModule) },
        
        // Programaciones (Nueva funcionalidad)
        { path: 'programaciones', loadChildren: () => import('./programaciones/programaciones.module').then(m => m.ProgramacionesModule) },
        
        { path: '**', redirectTo: '/notfound' }
    ])],
    exports: [RouterModule]
})
export class PagesRoutingModule { }
