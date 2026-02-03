import { Component, OnInit } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { KeycloakService } from './service/keycloak.service';
import { UsuariosService } from './service/usuarios.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

    constructor(
        private primengConfig: PrimeNGConfig,
        private keycloakService: KeycloakService,
        private usuariosService: UsuariosService
    ) { }

    ngOnInit() {
        this.primengConfig.ripple = true;
        this.autoSyncUsuarioActual();
    }

    private autoSyncUsuarioActual(): void {
        const intervalMs = 500;
        const maxWaitMs = 15000;
        let elapsed = 0;

        const timer = setInterval(() => {
            elapsed += intervalMs;

            if (this.keycloakService.isInitialized()) {
                clearInterval(timer);

                if (this.keycloakService.isLoggedIn()) {
                    this.usuariosService.autoSyncCurrentUser().subscribe({
                        next: () => {
                        },
                        error: () => {
                        }
                    });
                }
                return;
            }

            if (elapsed >= maxWaitMs) {
                clearInterval(timer);
            }
        }, intervalMs);
    }
}
