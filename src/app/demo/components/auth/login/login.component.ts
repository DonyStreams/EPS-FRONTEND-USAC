import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { KeycloakService } from 'src/app/service/keycloak.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styles: [`
        :host ::ng-deep .pi-eye,
        :host ::ng-deep .pi-eye-slash {
            transform:scale(1.6);
            margin-right: 1rem;
            color: var(--primary-color) !important;
        }
    `]
})
export class LoginComponent implements OnInit {

    valCheck: string[] = ['remember'];
    password!: string;
    email!: string;
    loading = false;

    constructor(
        public layoutService: LayoutService,
        private keycloakService: KeycloakService,
        private router: Router
    ) { }

    ngOnInit() {
        // Si ya está autenticado, redirigir al dashboard
        if (this.keycloakService.isLoggedIn()) {
            this.router.navigate(['/']);
        }
    }

    onLogin() {
        this.loading = true;
        console.log('[Login] Iniciando proceso de login tradicional');
        
        // Validación básica (opcional)
        if (!this.email || !this.password) {
            console.warn('[Login] Email o contraseña faltantes');
            this.loading = false;
            return;
        }
        
        // Simular validación de credenciales y autenticar usuario
        setTimeout(() => {
            console.log('[Login] Credenciales validadas, autenticando...');
            
            // Autenticar el usuario usando el servicio Keycloak
            this.keycloakService.login();
            
            // Verificar autenticación y redirigir
            if (this.keycloakService.isLoggedIn()) {
                console.log('[Login] Usuario autenticado, redirigiendo...');
                this.router.navigate(['/']);
            } else {
                console.error('[Login] Error en la autenticación');
            }
            
            this.loading = false;
        }, 1000);
    }

    loginWithKeycloak() {
        this.loading = true;
        console.log('[Login] Iniciando autenticación con Keycloak');
        
        // Llamar al método login del servicio Keycloak
        this.keycloakService.login();
        
        // Verificar que el usuario esté autenticado después del login
        setTimeout(() => {
            if (this.keycloakService.isLoggedIn()) {
                console.log('[Login] Conectado correctamente a Keycloak, redirigiendo...');
                this.router.navigate(['/']);
            } else {
                console.error('[Login] Error en la autenticación con Keycloak');
            }
            this.loading = false;
        }, 500);
    }
    
    // Métodos de testing temporales
    checkAuthStatus() {
        console.log('=== ESTADO DE AUTENTICACIÓN ===');
        console.log('isLoggedIn():', this.keycloakService.isLoggedIn());
        console.log('isInitialized():', this.keycloakService.isInitialized());
        console.log('Username:', this.keycloakService.getUsername());
        console.log('Email:', this.keycloakService.getUserEmail());
        console.log('Roles:', this.keycloakService.getUserRoles());
        console.log('================================');
        
        alert(`Usuario autenticado: ${this.keycloakService.isLoggedIn()}\nUsuario: ${this.keycloakService.getUsername()}`);
    }
    
    forceLogout() {
        console.log('[Testing] Forzando logout...');
        this.keycloakService.logout();
        alert('Logout forzado completado. Usuario autenticado: ' + this.keycloakService.isLoggedIn());
    }
    
    testProtectedRoute() {
        console.log('[Testing] Probando acceso a ruta protegida...');
        this.router.navigate(['/administracion/equipos']);
    }
}
