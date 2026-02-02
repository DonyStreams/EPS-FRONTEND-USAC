import { Component, ElementRef, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { LayoutService } from "./service/app.layout.service";
import { KeycloakService } from '../service/keycloak.service';
import { environment } from '../../environments/environment';
import { Contadores } from '../components/pages/notificaciones/notificaciones.model';
import { NotificacionBadgeService } from '../service/notificacion-badge.service';

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

        .topbar-notificaciones {
            position: relative;
        }

        .notification-badge {
            position: absolute;
            top: -4px;
            right: -2px;
            background: var(--red-500);
            color: #fff;
            border-radius: 999px;
            font-size: 0.7rem;
            min-width: 18px;
            height: 18px;
            line-height: 18px;
            text-align: center;
            padding: 0 4px;
            font-weight: 700;
            box-shadow: 0 0 0 2px var(--surface-card);
            display: inline-flex;
            align-items: center;
            justify-content: center;
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
export class AppTopBarComponent implements OnInit, OnDestroy {

    items!: MenuItem[];
    userMenuItems: MenuItem[] = [];
    userMenuVisible: boolean = false;
    isDarkMode: boolean = false;
    unreadNotificaciones: number = 0;
    private notificacionesSub?: Subscription;
    
    // Temas: light y dark
    private lightTheme = 'lara-light-indigo';
    private darkTheme = 'lara-dark-indigo';

    @ViewChild('menubutton') menuButton!: ElementRef;

    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

    @ViewChild('topbarmenu') menu!: ElementRef;

    constructor(
        public layoutService: LayoutService,
        private keycloakService: KeycloakService,
        private router: Router,
        private http: HttpClient,
        private notificacionBadgeService: NotificacionBadgeService
    ) { 
        this.initUserMenu();
        this.initDarkMode();
        
        // Cerrar menú cuando se hace clic fuera
        document.addEventListener('click', (event) => {
            this.userMenuVisible = false;
        });
    }

    ngOnInit(): void {
        this.notificacionBadgeService.count$.subscribe((count) => {
            this.unreadNotificaciones = count ?? 0;
        });
        this.cargarContadorNotificaciones();
        if (this.puedeVerNotificaciones()) {
            this.notificacionesSub = interval(60000).subscribe(() => {
                this.cargarContadorNotificaciones();
            });
        }
    }

    ngOnDestroy(): void {
        this.notificacionesSub?.unsubscribe();
    }

    initDarkMode() {
        // Cargar preferencia guardada
        const savedTheme = localStorage.getItem('darkMode');
        this.isDarkMode = savedTheme === 'true';
        
        if (this.isDarkMode) {
            this.applyTheme(this.darkTheme, 'dark');
        }
    }

    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        
        const theme = this.isDarkMode ? this.darkTheme : this.lightTheme;
        const colorScheme = this.isDarkMode ? 'dark' : 'light';
        
        this.applyTheme(theme, colorScheme);
        
        // Guardar preferencia
        localStorage.setItem('darkMode', String(this.isDarkMode));
    }

    puedeVerNotificaciones(): boolean {
        return this.keycloakService.canAccessNotificaciones();
    }

    cargarContadorNotificaciones(): void {
        if (!this.puedeVerNotificaciones()) {
            this.unreadNotificaciones = 0;
            return;
        }

        this.http.get<Contadores>(`${environment.apiUrl}/notificaciones/contadores`).subscribe({
            next: (data) => {
                const total = data?.total ?? 0;
                this.unreadNotificaciones = total;
                this.notificacionBadgeService.setCount(total);
            },
            error: () => {
                this.unreadNotificaciones = 0;
                this.notificacionBadgeService.setCount(0);
            }
        });
    }

    goToNotificaciones(): void {
        this.router.navigate(['/administracion/notificaciones']);
    }

    private applyTheme(theme: string, colorScheme: string) {
        this.layoutService.config.update((config) => ({
            ...config,
            theme: theme,
            colorScheme: colorScheme,
        }));
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
                    // Aquí podrías navegar a la página de perfil
                    // this.router.navigate(['/profile']);
                }
            },
            {
                label: 'Configuración',
                icon: 'pi pi-cog',
                command: () => {
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
        this.userMenuVisible = false;
        // Aquí podrías navegar a la página de perfil
        // this.router.navigate(['/profile']);
    }

    openSettings() {
        this.userMenuVisible = false;
        // Aquí podrías navegar a la página de configuración
        // this.router.navigate(['/settings']);
    }

    logout() {
        // Cerrar el menú
        this.userMenuVisible = false;
        
        // Llamar al logout del servicio Keycloak
        this.keycloakService.logout();
        
        // Redirigir al login
        this.router.navigate(['/auth/login']);
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
