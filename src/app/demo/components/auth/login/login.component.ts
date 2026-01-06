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

    loginWithKeycloak() {
        this.loading = true;
        console.log('[Login] Iniciando autenticación con Keycloak');
        this.keycloakService.login();
    }
}
