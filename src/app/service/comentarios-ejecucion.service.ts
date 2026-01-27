import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ComentarioEjecucion {
    id?: number;
    idEjecucion?: number;
    usuarioId?: number;
    usuario?: string;
    tipoComentario?: string;
    comentario?: string;
    estadoAnterior?: string;
    estadoNuevo?: string;
    fechaCreacion?: string | Date;
}

export interface CrearComentarioRequest {
    idEjecucion: number;
    usuarioId?: number;
    tipoComentario: string;
    comentario: string;
    estadoAnterior?: string;
    estadoNuevo?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ComentariosEjecucionService {
    private apiUrl = `${environment.apiUrl}/comentarios-ejecucion`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<ComentarioEjecucion[]> {
        return this.http.get<ComentarioEjecucion[]>(this.apiUrl);
    }

    getById(id: number): Observable<ComentarioEjecucion> {
        return this.http.get<ComentarioEjecucion>(`${this.apiUrl}/${id}`);
    }

    getByEjecucion(idEjecucion: number): Observable<ComentarioEjecucion[]> {
        return this.http.get<ComentarioEjecucion[]>(`${this.apiUrl}/ejecucion/${idEjecucion}`);
    }

    create(request: CrearComentarioRequest): Observable<ComentarioEjecucion> {
        return this.http.post<ComentarioEjecucion>(this.apiUrl, request);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
