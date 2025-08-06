import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface EjecucionMantenimiento {
    idEjecucion?: number;
    fechaEjecucion?: Date;
    fechaInicio?: Date;
    fechaFin?: Date;
    costo?: number;
    estado?: string;
    observaciones?: string;
    bitacora?: string;
    usuarioCreacion?: number;
    fechaCreacion?: Date;
    usuarioModificacion?: number;
    fechaModificacion?: Date;
    
    // Referencias
    idContrato?: number;
    idEquipo?: number;
    idTipoMantenimiento?: number;
    
    // Objetos anidados
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
    
    tipoMantenimiento?: {
        idTipoMantenimiento?: number;
        nombre?: string;
        descripcion?: string;
    };
    
    usuarioResponsable?: {
        id?: number;
        nombreCompleto?: string;
    };
    
    // Propiedades para el formulario (snake_case si es necesario)
    id_ejecucion?: number;
    fecha_ejecucion?: Date;
    fecha_inicio?: Date;
    fecha_fin?: Date;
    id_contrato?: number;
    id_equipo?: number;
    id_tipo_mantenimiento?: number;
    usuario_creacion?: number;
    fecha_creacion?: Date;
    usuario_modificacion?: number;
    fecha_modificacion?: Date;
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
