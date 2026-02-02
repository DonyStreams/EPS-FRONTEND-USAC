import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { environment } from '../../../../environments/environment';
import { ConfiguracionCorreo } from './configuracion-correos.model';

@Component({
    selector: 'app-configuracion-correos',
    templateUrl: './configuracion-correos.component.html',
    styleUrls: ['./configuracion-correos.component.scss'],
    providers: [MessageService]
})
export class ConfiguracionCorreosComponent implements OnInit {
    private apiUrl = environment.apiUrl;

    configuraciones: ConfiguracionCorreo[] = [];
    cargando = false;
    guardando = false;

    constructor(
        private http: HttpClient,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.cargarConfiguraciones();
    }

    cargarConfiguraciones(): void {
        this.cargando = true;
        this.http.get<ConfiguracionCorreo[]>(`${this.apiUrl}/configuracion-correos`).subscribe({
            next: (data) => {
                this.configuraciones = data || [];
                this.cargando = false;
            },
            error: () => {
                this.cargando = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo cargar la configuración de correos'
                });
            }
        });
    }

    guardarConfiguracion(item: ConfiguracionCorreo): void {
        const payload = { correos: item.correos || '' };
        this.http.put(`${this.apiUrl}/configuracion-correos/${item.tipoAlerta}`, payload).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Configuración actualizada'
                });
                this.cargarConfiguraciones();
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo actualizar la configuración'
                });
            }
        });
    }

    guardarTodo(): void {
        if (!this.configuraciones.length) {
            return;
        }

        const invalidos = this.configuraciones
            .flatMap((item) => this.extraerCorreos(item.correos))
            .filter((correo) => !this.esCorreoValido(correo));

        if (invalidos.length) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Correos inválidos',
                detail: `Verifica los correos: ${invalidos.join(', ')}`
            });
            return;
        }

        this.guardando = true;
        const requests = this.configuraciones.map((item) => {
            const payload = { correos: item.correos || '' };
            return this.http.put(`${this.apiUrl}/configuracion-correos/${item.tipoAlerta}`, payload).pipe(
                catchError(() => of(null))
            );
        });

        forkJoin(requests).subscribe({
            next: () => {
                this.guardando = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Configuraciones actualizadas'
                });
                this.cargarConfiguraciones();
            },
            error: () => {
                this.guardando = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudieron actualizar las configuraciones'
                });
            }
        });
    }

    private extraerCorreos(valor?: string): string[] {
        if (!valor) {
            return [];
        }
        return valor
            .split(/[;,\n\r]+/)
            .map((parte) => parte.trim())
            .filter((parte) => parte.length > 0);
    }

    private esCorreoValido(correo: string): boolean {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(correo);
    }

    obtenerCorreosInvalidos(valor?: string): string[] {
        return this.extraerCorreos(valor).filter((correo) => !this.esCorreoValido(correo));
    }

    esCorreosValidos(valor?: string): boolean {
        const correos = this.extraerCorreos(valor);
        if (!correos.length) {
            return true;
        }
        return correos.every((correo) => this.esCorreoValido(correo));
    }
}
