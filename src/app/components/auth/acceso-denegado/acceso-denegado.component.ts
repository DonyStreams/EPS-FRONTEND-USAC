import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { KeycloakService } from '../../../service/keycloak.service';

@Component({
    selector: 'app-acceso-denegado',
    templateUrl: './acceso-denegado.component.html'
})
export class AccesoDenegadoComponent implements OnInit {
    
    nombreUsuario: string = '';
    motivo: string = '';

    constructor(
        private route: ActivatedRoute,
        private keycloakService: KeycloakService
    ) {}

    ngOnInit(): void {
        // Obtener parámetros de la URL
        this.route.queryParams.subscribe(params => {
            this.motivo = params['motivo'] || 'acceso-denegado';
            this.nombreUsuario = params['usuario'] || this.keycloakService.getUsername();
        });

        console.log('🚫 Acceso denegado para usuario:', this.nombreUsuario);
        console.log('📋 Motivo:', this.motivo);
    }

    logout(): void {
        console.log('🔓 Cerrando sesión...');
        this.keycloakService.logout();
    }

    contactarSoporte(): void {
        // Abrir cliente de correo con información pre-llenada
        const asunto = encodeURIComponent('Solicitud de reactivación de cuenta - Sistema INACIF');
        const cuerpo = encodeURIComponent(`
Estimado Administrador del Sistema,

Solicito la reactivación de mi cuenta en el Sistema de Mantenimientos INACIF.

Detalles:
- Usuario: ${this.nombreUsuario}
- Motivo de desactivación: Usuario desactivado por administrador
- Fecha de solicitud: ${new Date().toLocaleDateString()}

Quedo atento a su respuesta.

Saludos cordiales.
        `.trim());

        const mailtoLink = `mailto:admin@inacif.gob.gt?subject=${asunto}&body=${cuerpo}`;
        window.open(mailtoLink, '_self');
    }
}
