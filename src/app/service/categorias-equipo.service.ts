import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CategoriaEquipo {
    id?: number;
    nombre: string;
    descripcion?: string;
    idPadre?: number | null;
    padreNombre?: string | null;
    estado?: boolean;
    totalEquipos?: number;
    createdAt?: string | Date | null;
    updatedAt?: string | Date | null;
    subcategorias?: CategoriaEquipo[];
}

@Injectable({ providedIn: 'root' })
export class CategoriasEquipoService {
    private readonly apiUrl = `${environment.apiUrl}/categorias-equipos`;

    constructor(private http: HttpClient) { }

    getAll(options?: { soloActivas?: boolean }): Observable<CategoriaEquipo[]> {
        let params = new HttpParams();
        if (options?.soloActivas) {
            params = params.set('soloActivas', 'true');
        }
        return this.http.get<CategoriaEquipo[]>(this.apiUrl, { params });
    }

    getTree(options?: { soloActivas?: boolean }): Observable<CategoriaEquipo[]> {
        let params = new HttpParams();
        if (options?.soloActivas === false) {
            params = params.set('soloActivas', 'false');
        }
        return this.http.get<CategoriaEquipo[]>(`${this.apiUrl}/tree`, { params });
    }

    getById(id: number): Observable<CategoriaEquipo> {
        return this.http.get<CategoriaEquipo>(`${this.apiUrl}/${id}`);
    }

    create(payload: CategoriaEquipo): Observable<CategoriaEquipo> {
        return this.http.post<CategoriaEquipo>(this.apiUrl, payload);
    }

    update(id: number, payload: CategoriaEquipo): Observable<CategoriaEquipo> {
        return this.http.put<CategoriaEquipo>(`${this.apiUrl}/${id}`, payload);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
