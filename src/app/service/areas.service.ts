import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Area {
    idArea?: number;
    codigoArea?: string;
    nombre: string;
    tipoArea: string;
    estado?: boolean;
    fechaCreacion?: Date;
    fechaModificacion?: Date;
    usuarioCreacion?: number;
    usuarioModificacion?: number;
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

    create(area: Area): Observable<Area> {
        return this.http.post<Area>(this.apiUrl, area);
    }

    update(id: number, area: Area): Observable<Area> {
        return this.http.put<Area>(`${this.apiUrl}/${id}`, area);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
