import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface EjecucionMantenimiento {
    idEjecucion?: number;
    fechaEjecucion?: Date;
    bitacora?: string;
    usuarioResponsable?: number;
    usuarioCreacion?: number;
    fechaCreacion?: Date;
    usuarioModificacion?: number;
    fechaModificacion?: Date;
    
    // Referencias (IDs)
    idContrato?: number;
    idEquipo?: number;
    
    // Objetos anidados para mostrar información relacionada
    contrato?: {
        idContrato?: number;
        descripcion?: string;
        fechaInicio?: Date;
        fechaFin?: Date;
        valorTotal?: number;
        estado?: string;
        proveedor?: {
            idProveedor?: number;
            nombre?: string;
            nit?: string;
        };
    };
    
    equipo?: {
        idEquipo?: number;
        nombre?: string;
        modelo?: string;
        serie?: string;
        estado?: string;
        codigoInacif?: string;
        ubicacion?: string;
        laboratorio?: {
            idLaboratorio?: number;
            nombre?: string;
        };
    };
    
    usuarioResponsableObj?: {
        id?: number;
        nombreCompleto?: string;
    };
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

    create(ejecucion: EjecucionMantenimiento): Observable<EjecucionMantenimiento> {
        return this.http.post<EjecucionMantenimiento>(this.apiUrl, ejecucion);
    }

    update(id: number, ejecucion: EjecucionMantenimiento): Observable<EjecucionMantenimiento> {
        return this.http.put<EjecucionMantenimiento>(`${this.apiUrl}/${id}`, ejecucion);
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
}
