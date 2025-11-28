import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface HistorialEquipo {
    idHistorial?: number;
    idEquipo?: number;
    equipoNombre?: string;
    equipoNumeroSerie?: string;
    fechaRegistro?: Date;
    descripcion?: string;
    tipoCambio?: string;        // NUEVO
    usuarioId?: number;         // NUEVO
    usuarioNombre?: string;     // NUEVO
}

@Injectable({
    providedIn: 'root'
})
export class HistorialEquiposService {
    private apiUrl = `${environment.apiUrl}/historial-equipos`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<HistorialEquipo[]> {
        return this.http.get<HistorialEquipo[]>(this.apiUrl);
    }

    getById(id: number): Observable<HistorialEquipo> {
        return this.http.get<HistorialEquipo>(`${this.apiUrl}/${id}`);
    }

    create(historial: HistorialEquipo): Observable<HistorialEquipo> {
        return this.http.post<HistorialEquipo>(this.apiUrl, historial);
    }

    update(id: number, historial: HistorialEquipo): Observable<HistorialEquipo> {
        return this.http.put<HistorialEquipo>(`${this.apiUrl}/${id}`, historial);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    deleteMultiple(ids: number[]): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/batch`, {
            body: { ids }
        });
    }
}
