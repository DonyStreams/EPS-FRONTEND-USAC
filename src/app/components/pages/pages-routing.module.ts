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
        
        // Tickets
        { path: 'tickets', loadChildren: () => import('./tickets/tickets.module').then(m => m.TicketsModule) },
        
        // Contratos
        { path: 'contratos', loadChildren: () => import('./contratos/contratos.module').then(m => m.ContratosModule) },
        
        // Reportes
        { path: 'reportes', loadChildren: () => import('./reportes/reportes.module').then(m => m.ReportesModule) },
        
        // Administración
        { path: 'areas', loadChildren: () => import('./areas/areas.module').then(m => m.AreasModule) },
        { path: 'categorias-equipos', loadChildren: () => import('./categorias-equipo/categorias-equipo.module').then(m => m.CategoriasEquipoModule) },
        { path: 'usuarios', loadChildren: () => import('./usuarios/usuarios.module').then(m => m.UsuariosModule) },
        
        // Notificaciones
        { path: 'notificaciones', loadChildren: () => import('./notificaciones/notificaciones.module').then(m => m.NotificacionesModule) },
        
        // Programaciones (Nueva funcionalidad)
        { path: 'programaciones', loadChildren: () => import('./programaciones/programaciones.module').then(m => m.ProgramacionesModule) },
        
        // Historial de Programaciones
        { path: 'historial-programaciones', loadChildren: () => import('./historial-programaciones/historial-programaciones.module').then(m => m.HistorialProgramacionesModule) },
        
        { path: '**', redirectTo: '/notfound' }
    ])],
    exports: [RouterModule]
})
export class PagesRoutingModule { }
