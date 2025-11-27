import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface EjecucionMantenimiento {
    idEjecucion?: number;
    fechaEjecucion?: string | Date;
    fechaInicioTrabajo?: string | Date | null;
    fechaCierre?: string | Date | null;
    estado?: 'PROGRAMADO' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO';
    bitacora?: string;

    idContrato?: number;
    contratoDescripcion?: string;
    proveedorNombre?: string;

    idEquipo?: number;
    equipoNombre?: string;
    equipoCodigo?: string;
    equipoUbicacion?: string;

    idProgramacion?: number;
    frecuenciaDias?: number;
    fechaProximoProgramado?: string | Date | null;

    usuarioResponsableId?: number;
    usuarioResponsableNombre?: string;
}

export interface GuardarEjecucionRequest {
    idContrato?: number;
    idEquipo?: number;
    idProgramacion?: number;
    usuarioResponsableId?: number;
    fechaEjecucion?: Date | string;
    fechaInicioTrabajo?: Date | string | null;
    fechaCierre?: Date | string | null;
    estado?: string;
    bitacora?: string;
}

export interface CambioEstadoRequest {
    estado: 'PROGRAMADO' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO';
    bitacora?: string;
    fechaReferencia?: Date | string | null;
    fechaInicio?: Date | string | null;
}

@Injectable({
    providedIn: 'root'
})
export class EjecucionesService {
    private apiUrl = `${environment.apiUrl}/ejecuciones-mantenimiento`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<EjecucionMantenimiento[]> {
        return this.http.get<EjecucionMantenimiento[]>(this.apiUrl);
    }

    getById(id: number): Observable<EjecucionMantenimiento> {
        return this.http.get<EjecucionMantenimiento>(`${this.apiUrl}/${id}`);
    }

    create(request: GuardarEjecucionRequest): Observable<EjecucionMantenimiento> {
        return this.http.post<EjecucionMantenimiento>(this.apiUrl, request);
    }

    update(id: number, request: GuardarEjecucionRequest): Observable<EjecucionMantenimiento> {
        return this.http.put<EjecucionMantenimiento>(`${this.apiUrl}/${id}`, request);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getByContrato(idContrato: number): Observable<EjecucionMantenimiento[]> {
        return this.http.get<EjecucionMantenimiento[]>(`${this.apiUrl}/contrato/${idContrato}`);
    }

    getByEquipo(idEquipo: number): Observable<EjecucionMantenimiento[]> {
        return this.http.get<EjecucionMantenimiento[]>(`${this.apiUrl}/equipo/${idEquipo}`);
    }

    actualizarEstado(id: number, payload: CambioEstadoRequest): Observable<EjecucionMantenimiento> {
        return this.http.patch<EjecucionMantenimiento>(`${this.apiUrl}/${id}/estado`, payload);
    }
}
