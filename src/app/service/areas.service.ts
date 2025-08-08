import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Area {
    idArea?: number;
    codigoArea?: string;
    nombre: string;
    tipoArea: string;
    estado: boolean;
    fechaCreacion?: Date;
    fechaModificacion?: Date;
    usuarioCreacion?: number;
    usuarioModificacion?: number;
    
    // Propiedades para el formulario (snake_case si es necesario)
    id_area?: number;
    codigo_area?: string;
    tipo_area?: string;
    fecha_creacion?: Date;
    fecha_modificacion?: Date;
    usuario_creacion?: number;
    usuario_modificacion?: number;
}

@Injectable({
    providedIn: 'root'
})
export class AreasService {
    private apiUrl = `${environment.apiUrl}/areas`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Area[]> {
        return this.http.get<Area[]>(this.apiUrl);
    }

    getActivos(): Observable<Area[]> {
        return this.http.get<Area[]>(`${this.apiUrl}/activos`);
    }

    getById(id: number): Observable<Area> {
        return this.http.get<Area>(`${this.apiUrl}/${id}`);
    }

    create(area: Partial<Area>): Observable<Area> {
        return this.http.post<Area>(this.apiUrl, area);
    }

    update(id: number, area: Partial<Area>): Observable<Area> {
        return this.http.put<Area>(`${this.apiUrl}/${id}`, area);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
