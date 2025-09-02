import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Usuario {
    id: number;
    keycloakId: string;
    nombreCompleto: string;
    correo: string;
    activo: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class UsuariosService {
    private apiUrl = `${environment.apiUrl}/usuarios`;

    constructor(private http: HttpClient) { }

    /**
     * Obtiene todos los usuarios
     */
    getAll(): Observable<Usuario[]> {
        return this.http.get<Usuario[]>(this.apiUrl);
    }

    /**
     * Obtiene solo usuarios activos
     */
    getActivos(): Observable<Usuario[]> {
        return this.http.get<Usuario[]>(`${this.apiUrl}/activos`);
    }

    /**
     * Obtiene un usuario por ID
     */
    getById(id: number): Observable<Usuario> {
        return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
    }

    /**
     * Obtiene un usuario por Keycloak ID
     */
    getByKeycloakId(keycloakId: string): Observable<Usuario> {
        return this.http.get<Usuario>(`${this.apiUrl}/keycloak/${keycloakId}`);
    }
}
