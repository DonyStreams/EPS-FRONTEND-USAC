import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ProgramacionMantenimiento {
    idProgramacion?: number;
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
    fechaProximoMantenimiento?: Date;
    diasAlertaPrevia?: number;
    activa?: boolean;
    observaciones?: string;
    estadoAlerta?: string;
    diasRestantes?: number;
    
    // Propiedades para el formulario (snake_case)
    id_programacion?: number;
    id_equipo?: number;
    id_tipo_mantenimiento?: number;
    frecuencia_dias?: number;
    fecha_ultimo_mantenimiento?: Date;
    fecha_proximo_mantenimiento?: Date;
    dias_alerta_previa?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ProgramacionesService {
    private apiUrl = `${environment.apiUrl}/programaciones`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<ProgramacionMantenimiento[]> {
        return this.http.get<ProgramacionMantenimiento[]>(this.apiUrl);
    }

    getById(id: number): Observable<ProgramacionMantenimiento> {
        return this.http.get<ProgramacionMantenimiento>(`${this.apiUrl}/${id}`);
    }

    create(programacion: ProgramacionMantenimiento): Observable<ProgramacionMantenimiento> {
        return this.http.post<ProgramacionMantenimiento>(this.apiUrl, programacion);
    }

    update(id: number, programacion: ProgramacionMantenimiento): Observable<ProgramacionMantenimiento> {
        return this.http.put<ProgramacionMantenimiento>(`${this.apiUrl}/${id}`, programacion);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getByEquipo(equipoId: number): Observable<ProgramacionMantenimiento[]> {
        return this.http.get<ProgramacionMantenimiento[]>(`${this.apiUrl}/equipo/${equipoId}`);
    }

    calcularProximaFecha(id: number): Observable<ProgramacionMantenimiento> {
        return this.http.post<ProgramacionMantenimiento>(`${this.apiUrl}/${id}/calcular`, {});
    }
}
