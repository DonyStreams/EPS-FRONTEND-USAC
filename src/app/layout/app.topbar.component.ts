import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { LayoutService } from "./service/app.layout.service";
import { KeycloakService } from '../service/keycloak.service';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html',
    styles: [`
        .user-menu-container {
            position: relative;
            display: inline-flex;
            align-items: center;
        }
        
        .user-menu-container .layout-topbar-button {
            min-width: auto;
            white-space: nowrap;
            padding: 0 1rem;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            transition: all 0.2s;
        }
        
        .user-menu-container .layout-topbar-button span {
            display: inline-block;
            max-width: 120px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        
        .user-menu-container .layout-topbar-button:hover {
            background-color: var(--surface-hover);
        }
        
        /* Menú desplegable personalizado */
        .user-dropdown-menu {
            position: absolute;
            top: calc(100% + 8px);
            right: 0;
            min-width: 280px;
            background: var(--surface-card);
            border: 1px solid var(--surface-border);
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px);
            transition: all 0.2s ease;
        }
        
        .user-dropdown-menu.visible {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
        
        .user-info-section {
            padding: 1rem;
            background: var(--surface-100);
            border-radius: 8px 8px 0 0;
        }
        
        .user-info-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.5rem 0;
            color: var(--text-color-secondary);
            font-size: 0.9rem;
        }
        
        .user-info-item i {
            width: 16px;
            text-align: center;
            color: var(--primary-color);
        }
        
        .menu-separator {
            height: 1px;
            background: var(--surface-border);
            margin: 0.5rem 0;
        }
        
        .menu-actions {
            padding: 0.5rem 0;
        }
        
        .menu-action-item {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.875rem 1.25rem;
            border: none;
            background: transparent;
            color: var(--text-color);
            cursor: pointer;
            transition: all 0.2s;
            font-size: 0.9rem;
        }
        
        .menu-action-item:hover {
            background: var(--surface-hover);
        }
        
        .menu-action-item i {
            width: 16px;
            text-align: center;
        }
        
        .menu-action-item.logout-item {
            color: var(--red-600);
        }
        
        .menu-action-item.logout-item:hover {
            background: var(--red-50);
            color: var(--red-700);
        }
        
        .menu-action-item.logout-item i {
            color: var(--red-600);
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
            .user-menu-container .layout-topbar-button span {
                display: none;
            }
            
            .user-menu-container .layout-topbar-button {
                min-width: 3rem;
                padding: 0;
            }
            
            .user-dropdown-menu {
                right: -20px;
                min-width: 260px;
            }
        }
    `]
})
export class AppTopBarComponent {

    items!: MenuItem[];
    userMenuItems: MenuItem[] = [];
    userMenuVisible: boolean = false;

    @ViewChild('menubutton') menuButton!: ElementRef;

    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

    @ViewChild('topbarmenu') menu!: ElementRef;

    constructor(
        public layoutService: LayoutService,
        private keycloakService: KeycloakService,
        private router: Router
    ) { 
        this.initUserMenu();
        
        // Cerrar menú cuando se hace clic fuera
        document.addEventListener('click', (event) => {
            this.userMenuVisible = false;
        });
    }

    initUserMenu() {
        this.userMenuItems = [
            {
                label: `${this.getUserFullName()}`,
                icon: 'pi pi-user',
                styleClass: 'user-info-item',
                disabled: true
            },
            {
                label: `${this.getUserEmail()}`,
                icon: 'pi pi-envelope',
                styleClass: 'user-info-item',
                disabled: true
            },
            {separator: true},
            {
                label: 'Perfil',
                icon: 'pi pi-user-edit',
                command: () => {
                    console.log('[Topbar] Accediendo a perfil...');
                    // Aquí podrías navegar a la página de perfil
                    // this.router.navigate(['/profile']);
                }
            },
            {
                label: 'Configuración',
                icon: 'pi pi-cog',
                command: () => {
                    console.log('[Topbar] Accediendo a configuración...');
                    // Aquí podrías navegar a la página de configuración
                    // this.router.navigate(['/settings']);
                }
            },
            {separator: true},
            {
                label: 'Cerrar Sesión',
                icon: 'pi pi-sign-out',
                styleClass: 'logout-item',
                command: () => this.logout()
            }
        ];
    }

    toggleUserMenu(event: Event) {
        event.stopPropagation();
        this.userMenuVisible = !this.userMenuVisible;
    }

    openProfile() {
        console.log('[Topbar] Accediendo a perfil...');
        this.userMenuVisible = false;
        // Aquí podrías navegar a la página de perfil
        // this.router.navigate(['/profile']);
    }

    openSettings() {
        console.log('[Topbar] Accediendo a configuración...');
        this.userMenuVisible = false;
        // Aquí podrías navegar a la página de configuración
        // this.router.navigate(['/settings']);
    }

    logout() {
        console.log('[Topbar] Iniciando logout...');
        
        // Cerrar el menú
        this.userMenuVisible = false;
        
        // Llamar al logout del servicio Keycloak
        this.keycloakService.logout();
        
        // Redirigir al login
        this.router.navigate(['/auth/login']);
        
        console.log('[Topbar] Logout completado, redirigiendo al login');
    }

    getUserName(): string {
        return this.keycloakService.getUsername() || 'Usuario';
    }

    getUserEmail(): string {
        return this.keycloakService.getUserEmail() || 'usuario@inacif.gob.gt';
    }

    getUserFullName(): string {
        return this.keycloakService.getUserFullName() || 'Usuario Sistema';
    }
}
