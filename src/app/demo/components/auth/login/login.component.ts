import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { KeycloakService } from 'src/app/service/keycloak.service';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    providers: [MessageService],
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
    
    // 🆕 Propiedades para testing FTP
    testingFTP = false;
    testingUpload = false;
    private apiUrl = 'http://localhost:8081/MantenimientosBackend/api';

    constructor(
        public layoutService: LayoutService,
        private keycloakService: KeycloakService,
        private router: Router,
        private http: HttpClient,
        private messageService: MessageService
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
    
    // 🆕 MÉTODOS DE TESTING FTP
    testFTPConnection() {
        console.log('🔵 [FTP Test] Iniciando test de conexión FTP...');
        this.testingFTP = true;
        
        this.http.get(`${this.apiUrl}/ftp/test`, { responseType: 'text' })
            .subscribe({
                next: (response) => {
                    console.log('🟢 [FTP Test] Conexión exitosa:', response);
                    this.messageService.add({
                        severity: 'success',
                        summary: '✅ FTP Conexión OK',
                        detail: response,
                        life: 5000
                    });
                    this.testingFTP = false;
                },
                error: (error) => {
                    console.error('🔴 [FTP Test] Error de conexión:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: '❌ FTP Conexión Falló',
                        detail: `Error: ${error.error || error.message}`,
                        life: 8000
                    });
                    this.testingFTP = false;
                }
            });
    }
    
    testFTPUpload() {
        console.log('🔵 [FTP Test] Iniciando test de upload FTP...');
        this.testingUpload = true;
        
        // Crear un archivo de prueba simple
        const testContent = `Archivo de prueba FTP
Fecha: ${new Date().toISOString()}
Sistema: Mantenimientos INACIF`;
        
        const blob = new Blob([testContent], { type: 'text/plain' });
        const fileName = `test_${Date.now()}.txt`;
        
        // Preparar headers
        const headers = {
            'X-Filename': fileName
        };
        
        this.http.post(`${this.apiUrl}/ftp/upload`, blob, { 
            headers: headers,
            responseType: 'text'
        }).subscribe({
            next: (response) => {
                console.log('🟢 [FTP Test] Upload exitoso:', response);
                this.messageService.add({
                    severity: 'success',
                    summary: '✅ FTP Upload OK',
                    detail: `Archivo ${fileName} subido correctamente`,
                    life: 5000
                });
                this.testingUpload = false;
            },
            error: (error) => {
                console.error('🔴 [FTP Test] Error de upload:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: '❌ FTP Upload Falló',
                    detail: `Error: ${error.error || error.message}`,
                    life: 8000
                });
                this.testingUpload = false;
            }
        });
    }
}
