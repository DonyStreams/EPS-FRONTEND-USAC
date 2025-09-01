import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

    model: any[] = [];

    constructor(public layoutService: LayoutService) { }

    ngOnInit() {
        this.model = [
            {
                label: 'Inicio',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/administracion/dashboard'] }
                ]
            },
            {
                label: 'Gestión de Equipos',
                icon: 'pi pi-fw pi-desktop',
                items: [
                    { label: 'Equipos', icon: 'pi pi-fw pi-server', routerLink: ['/administracion/equipos'] },                    
                ]
            },
            {
                label: 'Gestión de Mantenimientos',
                icon: 'pi pi-fw pi-cog',
                items: [
                    { label: 'Mantenimientos', icon: 'pi pi-fw pi-calendar-plus', routerLink: ['/administracion/mantenimientos'] },
                    { label: 'Programaciones', icon: 'pi pi-fw pi-clock', routerLink: ['/administracion/programaciones'] },
                    { label: 'Ejecuciones', icon: 'pi pi-fw pi-check-circle', routerLink: ['/administracion/ejecuciones'] },
                    { label: 'Tipos de Mantenimiento', icon: 'pi pi-fw pi-list', routerLink: ['/administracion/tipos-mantenimiento'] },
                    { label: 'Proveedores', icon: 'pi pi-fw pi-users', routerLink: ['/administracion/proveedores'] }
                ]
            },
            {
                label: 'Tickets',
                icon: 'pi pi-fw pi-ticket',
                items: [
                    { label: 'Todos los Tickets', icon: 'pi pi-fw pi-inbox', routerLink: ['/administracion/tickets'] },
                    { label: 'Crear Ticket', icon: 'pi pi-fw pi-plus', routerLink: ['/administracion/tickets/nuevo'] },
                    { label: 'Prioridades', icon: 'pi pi-fw pi-exclamation-triangle', routerLink: ['/administracion/tickets/prioridades'] }
                ]
            },
            {
                label: 'Contratos',
                icon: 'pi pi-fw pi-file',
                items: [
                    { label: 'Contratos', icon: 'pi pi-fw pi-file', routerLink: ['/administracion/contratos'] },
                    { label: 'Gestión de Archivos', icon: 'pi pi-fw pi-folder', routerLink: ['/administracion/contratos/archivos'] }
                ]
            },
            {
                label: 'Reportes',
                icon: 'pi pi-fw pi-chart-bar',
                items: [
                    { label: 'Reportes Técnicos', icon: 'pi pi-fw pi-chart-line', routerLink: ['/administracion/reportes'] }
                ]
            },
            {
                label: 'Administración',
                icon: 'pi pi-fw pi-cog',
                items: [
                    { label: 'Áreas', icon: 'pi pi-fw pi-sitemap', routerLink: ['/administracion/areas'] },
                    { label: 'Usuarios', icon: 'pi pi-fw pi-users', routerLink: ['/administracion/usuarios'] }
                ]
            },
            {
                label: 'Notificaciones',
                icon: 'pi pi-fw pi-bell',
                items: [
                    { label: 'Panel de Notificaciones', icon: 'pi pi-fw pi-bell', routerLink: ['/administracion/notificaciones'] }
                ]
            }
        ];
    }
}
