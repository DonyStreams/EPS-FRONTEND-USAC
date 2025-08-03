import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AlertaMantenimiento {
    idProgramacion: number;
    equipo?: {
        idEquipo: number;
        nombre: string;
        codigoInacif: string;
        ubicacion: string;
    };
    tipoMantenimiento?: {
        idTipo: number;
        nombre: string;
    };
    frecuenciaDias: number;
    fechaUltimoMantenimiento?: Date;
    fechaProximoMantenimiento: Date;
    diasAlertaPrevia: number;
    diasRestantes: number;
    estadoAlerta: 'NORMAL' | 'ALERTA' | 'VENCIDO';
    observaciones?: string;
    fechaCreacion: Date;
    activa: boolean;
}

export interface DashboardAlertas {
    total_programaciones_activas: number;
    total_vencidas: number;
    total_alertas: number;
    vencidas: AlertaMantenimiento[];
    alertas: AlertaMantenimiento[];
}

@Injectable({
    providedIn: 'root'
})
export class AlertasService {
    private apiUrl = `${environment.apiUrl}/alertas-mantenimiento`;

    constructor(private http: HttpClient) { }

    getDashboard(): Observable<DashboardAlertas> {
        return this.http.get<DashboardAlertas>(`${this.apiUrl}/dashboard`);
    }

    getAlertas(): Observable<AlertaMantenimiento[]> {
        return this.http.get<AlertaMantenimiento[]>(`${this.apiUrl}/proximidad`);
    }

    getVencidas(): Observable<AlertaMantenimiento[]> {
        return this.http.get<AlertaMantenimiento[]>(`${this.apiUrl}/vencidas`);
    }

    getByFechas(fechaInicio: string, fechaFin: string): Observable<AlertaMantenimiento[]> {
        return this.http.get<AlertaMantenimiento[]>(`${this.apiUrl}/rango`, {
            params: { fechaInicio, fechaFin }
        });
    }
}
