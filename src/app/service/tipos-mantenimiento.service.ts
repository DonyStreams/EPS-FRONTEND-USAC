import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TipoMantenimiento {
    idTipo?: number;
    codigo: string;
    nombre: string;
    estado?: boolean;
    fechaCreacion?: Date;
    fechaModificacion?: Date;
    usuarioCreacion?: number;
    usuarioModificacion?: number;
}

@Injectable({
    providedIn: 'root'
})
export class TiposMantenimientoService {
    private apiUrl = `${environment.apiUrl}/tipos-mantenimiento`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<TipoMantenimiento[]> {
        return this.http.get<TipoMantenimiento[]>(this.apiUrl);
    }

    getById(id: number): Observable<TipoMantenimiento> {
        return this.http.get<TipoMantenimiento>(`${this.apiUrl}/${id}`);
    }

    create(tipo: TipoMantenimiento): Observable<TipoMantenimiento> {
        return this.http.post<TipoMantenimiento>(this.apiUrl, tipo);
    }

    update(id: number, tipo: TipoMantenimiento): Observable<TipoMantenimiento> {
        return this.http.put<TipoMantenimiento>(`${this.apiUrl}/${id}`, tipo);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getActivos(): Observable<TipoMantenimiento[]> {
        return this.http.get<TipoMantenimiento[]>(`${this.apiUrl}/activos`);
    }
}
