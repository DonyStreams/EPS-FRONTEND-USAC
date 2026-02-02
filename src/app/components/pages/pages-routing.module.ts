import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../guards/auth.guard';

@NgModule({
    imports: [RouterModule.forChild([        
        // Dashboard - Todos los roles pueden acceder
        { 
            path: 'dashboard', 
            loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
            canActivate: [AuthGuard],
            data: { roles: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'TECNICO_EQUIPOS', 'USER'] }
        },
        
        // Gestión de Equipos - Todos pueden ver, permisos granulares en componentes
        { 
            path: 'equipos', 
            loadChildren: () => import('./equipos/equipos.module').then(m => m.EquiposModule),
            canActivate: [AuthGuard],
            data: { roles: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'TECNICO_EQUIPOS', 'USER'] }
        },
        
        // Gestión de Mantenimientos - TECNICO_EQUIPOS no tiene acceso
        { 
            path: 'mantenimientos', 
            loadChildren: () => import('./mantenimientos/mantenimientos.module').then(m => m.MantenimientosModule),
            canActivate: [AuthGuard],
            data: { roles: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'USER'] }
        },
        { 
            path: 'ejecuciones', 
            loadChildren: () => import('./ejecuciones/ejecuciones.module').then(m => m.EjecucionesModule),
            canActivate: [AuthGuard],
            data: { roles: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'USER'] }
        },
        { 
            path: 'tipos-mantenimiento', 
            loadChildren: () => import('./tipos-mantenimiento/tipos-mantenimiento.module').then(m => m.TiposMantenimientoModule),
            canActivate: [AuthGuard],
            data: { roles: ['ADMIN', 'SUPERVISOR'] }
        },
        { 
            path: 'proveedores', 
            loadChildren: () => import('./proveedores/proveedores.module').then(m => m.ProveedoresModule),
            canActivate: [AuthGuard],
            data: { roles: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'USER'] }
        },
        
        // Tickets - Todos tienen acceso
        { 
            path: 'tickets', 
            loadChildren: () => import('./tickets/tickets.module').then(m => m.TicketsModule),
            canActivate: [AuthGuard],
            data: { roles: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'TECNICO_EQUIPOS', 'USER'] }
        },
        
        // Contratos - TECNICO_EQUIPOS no tiene acceso
        { 
            path: 'contratos', 
            loadChildren: () => import('./contratos/contratos.module').then(m => m.ContratosModule),
            canActivate: [AuthGuard],
            data: { roles: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'USER'] }
        },
        
        // Reportes - Solo ADMIN y SUPERVISOR
        { 
            path: 'reportes', 
            loadChildren: () => import('./reportes/reportes.module').then(m => m.ReportesModule),
            canActivate: [AuthGuard],
            data: { roles: ['ADMIN', 'SUPERVISOR'] }
        },

        // Configuración de correos - Solo ADMIN
        {
            path: 'configuracion-correos',
            loadChildren: () => import('./configuracion-correos/configuracion-correos.module').then(m => m.ConfiguracionCorreosModule),
            canActivate: [AuthGuard],
            data: { roles: ['ADMIN'] }
        },
        
        // Administración - Áreas para ADMIN/SUPERVISOR, Usuarios solo ADMIN
        { 
            path: 'areas', 
            loadChildren: () => import('./areas/areas.module').then(m => m.AreasModule),
            canActivate: [AuthGuard],
            data: { roles: ['ADMIN', 'SUPERVISOR'] }
        },
        { 
            path: 'categorias-equipos', 
            loadChildren: () => import('./categorias-equipo/categorias-equipo.module').then(m => m.CategoriasEquipoModule),
            canActivate: [AuthGuard],
            data: { roles: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'TECNICO_EQUIPOS', 'USER'] }
        },
        { 
            path: 'usuarios', 
            loadChildren: () => import('./usuarios/usuarios.module').then(m => m.UsuariosModule),
            canActivate: [AuthGuard],
            data: { roles: ['ADMIN'] }  // Solo ADMIN puede gestionar usuarios
        },
        
        // Notificaciones - Todos tienen acceso
        { 
            path: 'notificaciones', 
            loadChildren: () => import('./notificaciones/notificaciones.module').then(m => m.NotificacionesModule),
            canActivate: [AuthGuard],
            data: { roles: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'TECNICO_EQUIPOS', 'USER'] }
        },
        
        // Programaciones - TECNICO_EQUIPOS no tiene acceso
        { 
            path: 'programaciones', 
            loadChildren: () => import('./programaciones/programaciones.module').then(m => m.ProgramacionesModule),
            canActivate: [AuthGuard],
            data: { roles: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'USER'] }
        },
        
        // Historial de Programaciones
        { 
            path: 'historial-programaciones', 
            loadChildren: () => import('./historial-programaciones/historial-programaciones.module').then(m => m.HistorialProgramacionesModule),
            canActivate: [AuthGuard],
            data: { roles: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'USER'] }
        },
        
        { path: '**', redirectTo: '/notfound' }
    ])],
    exports: [RouterModule]
})
export class PagesRoutingModule { }
