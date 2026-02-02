import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';
import { KeycloakService } from '../service/keycloak.service';

/**
 * Interfaz para definir items del menú con soporte de roles
 */
interface MenuItem {
    label: string;
    icon?: string;
    routerLink?: string[];
    items?: MenuItem[];
    roles?: string[];  // Roles permitidos para ver este item
    separator?: boolean;
}

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

    model: any[] = [];

    constructor(
        public layoutService: LayoutService,
        private keycloakService: KeycloakService
    ) { }

    ngOnInit() {
        // Definir menú completo con roles
        const fullMenu: MenuItem[] = [
            {
                label: 'Inicio',
                items: [
                    { 
                        label: 'Dashboard', 
                        icon: 'pi pi-fw pi-home', 
                        routerLink: ['/administracion/dashboard'],
                        roles: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'TECNICO_EQUIPOS', 'USER']
                    }
                ]
            },
            {
                label: 'Gestión de Equipos',
                icon: 'pi pi-fw pi-desktop',
                roles: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'TECNICO_EQUIPOS', 'USER'],
                items: [
                    { 
                        label: 'Equipos', 
                        icon: 'pi pi-fw pi-server', 
                        routerLink: ['/administracion/equipos'],
                        roles: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'TECNICO_EQUIPOS', 'USER']
                    },
                    { 
                        label: 'Categorías de Equipo', 
                        icon: 'pi pi-fw pi-tags', 
                        routerLink: ['/administracion/categorias-equipos'],
                        roles: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'TECNICO_EQUIPOS', 'USER']
                    },
                    { 
                        label: 'Bitácora/Historial', 
                        icon: 'pi pi-fw pi-history', 
                        routerLink: ['/administracion/equipos/historial'],
                        roles: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'TECNICO_EQUIPOS', 'USER']
                    }
                ]
            },
            {
                label: 'Gestión de Mantenimientos',
                icon: 'pi pi-fw pi-cog',
                roles: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'USER'],  // TECNICO_EQUIPOS no tiene acceso
                items: [
                    { 
                        label: 'Calendario', 
                        icon: 'pi pi-fw pi-calendar', 
                        routerLink: ['/administracion/mantenimientos'],
                        roles: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'USER']
                    },
                    { 
                        label: 'Programaciones', 
                        icon: 'pi pi-fw pi-clock', 
                        routerLink: ['/administracion/programaciones'],
                        roles: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'USER']
                    },
                    { 
                        label: 'Ejecuciones', 
                        icon: 'pi pi-fw pi-check-circle', 
                        routerLink: ['/administracion/ejecuciones'],
                        roles: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'USER']
                    },
                    { 
                        label: 'Tipos de Mantenimiento', 
                        icon: 'pi pi-fw pi-list', 
                        routerLink: ['/administracion/tipos-mantenimiento'],
                        roles: ['ADMIN', 'SUPERVISOR']
                    },
                    { 
                        label: 'Bitácora/Historial', 
                        icon: 'pi pi-fw pi-history', 
                        routerLink: ['/administracion/historial-programaciones'],
                        roles: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'USER']
                    }
                ]
            },
            {
                label: 'Tickets',
                icon: 'pi pi-fw pi-ticket',
                roles: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'TECNICO_EQUIPOS', 'USER'],
                items: [
                    { 
                        label: 'Todos los Tickets', 
                        icon: 'pi pi-fw pi-inbox', 
                        routerLink: ['/administracion/tickets'],
                        roles: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'TECNICO_EQUIPOS', 'USER']
                    },
                    { 
                        label: 'Bitácora/Historial', 
                        icon: 'pi pi-fw pi-history', 
                        routerLink: ['/administracion/tickets/historial'],
                        roles: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'TECNICO_EQUIPOS', 'USER']
                    }
                ]
            },
            {
                label: 'Contratos',
                icon: 'pi pi-fw pi-file',
                roles: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'USER'],  // TECNICO_EQUIPOS no tiene acceso
                items: [
                    { 
                        label: 'Contratos', 
                        icon: 'pi pi-fw pi-file', 
                        routerLink: ['/administracion/contratos'],
                        roles: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'USER']
                    },
                    { 
                        label: 'Proveedores', 
                        icon: 'pi pi-fw pi-users', 
                        routerLink: ['/administracion/proveedores'],
                        roles: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'USER']
                    }
                ]
            },
            {
                label: 'Administración',
                icon: 'pi pi-fw pi-cog',
                roles: ['ADMIN', 'SUPERVISOR'],  // Solo ADMIN y SUPERVISOR
                items: [
                    { 
                        label: 'Áreas', 
                        icon: 'pi pi-fw pi-sitemap', 
                        routerLink: ['/administracion/areas'],
                        roles: ['ADMIN', 'SUPERVISOR']
                    },
                    { 
                        label: 'Usuarios', 
                        icon: 'pi pi-fw pi-users', 
                        routerLink: ['/administracion/usuarios'],
                        roles: ['ADMIN']  // Solo ADMIN puede gestionar usuarios
                    }
                ]
            },
            {
                label: 'Notificaciones',
                icon: 'pi pi-fw pi-bell',
                roles: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'TECNICO_EQUIPOS', 'USER'],
                items: [
                    { 
                        label: 'Panel de Notificaciones', 
                        icon: 'pi pi-fw pi-bell', 
                        routerLink: ['/administracion/notificaciones'],
                        roles: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'TECNICO_EQUIPOS', 'USER']
                    }
                ]
            },
            {
                label: 'Reportes',
                icon: 'pi pi-fw pi-chart-bar',
                roles: ['ADMIN', 'SUPERVISOR'],  // Solo ADMIN y SUPERVISOR
                items: [
                    { 
                        label: 'Reportes Técnicos', 
                        icon: 'pi pi-fw pi-chart-line', 
                        routerLink: ['/administracion/reportes'],
                        roles: ['ADMIN', 'SUPERVISOR']
                    },
                    {
                        label: 'Configuración de correos',
                        icon: 'pi pi-fw pi-envelope',
                        routerLink: ['/administracion/configuracion-correos'],
                        roles: ['ADMIN']
                    }
                ]
            }
        ];

        // Filtrar menú según roles del usuario
        this.model = this.filterMenuByRoles(fullMenu);
    }

    /**
     * Filtra el menú recursivamente según los roles del usuario
     */
    private filterMenuByRoles(items: MenuItem[]): any[] {
        return items
            .filter(item => this.hasAccess(item.roles))
            .map(item => {
                const filteredItem: any = { ...item };
                
                // Si tiene subitems, filtrarlos también
                if (item.items && item.items.length > 0) {
                    filteredItem.items = this.filterMenuByRoles(item.items);
                    
                    // Si después de filtrar no quedan items, ocultar el grupo
                    if (filteredItem.items.length === 0) {
                        return null;
                    }
                }
                
                return filteredItem;
            })
            .filter(item => item !== null);
    }

    /**
     * Verifica si el usuario tiene acceso basado en los roles requeridos
     */
    private hasAccess(roles?: string[]): boolean {
        // Si no hay roles definidos, permitir acceso
        if (!roles || roles.length === 0) {
            return true;
        }
        
        // Verificar si el usuario tiene al menos uno de los roles requeridos
        return this.keycloakService.hasAnyRole(roles);
    }
}
