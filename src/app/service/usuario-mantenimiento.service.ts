import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UsuarioMantenimiento {
    id?: number;
    keycloakId?: string;
    nombreCompleto?: string;
    correo?: string;
    activo?: boolean;
    
    // Campos adicionales para mostrar información de Keycloak
    username?: string;
    roles?: string[];
    ultimoLogin?: Date;
    createdTimestamp?: number;
    enabled?: boolean;
}

export interface EstadisticasUsuarios {
    total: number;
    activos: number;
    inactivos: number;
}

@Injectable({
    providedIn: 'root'
})
export class UsuarioMantenimientoService {
    private apiUrl = `${environment.apiUrl}/usuarios`;

    constructor(private http: HttpClient) { }

    // Métodos para usuarios locales
    getAll(): Observable<UsuarioMantenimiento[]> {
        return this.http.get<UsuarioMantenimiento[]>(this.apiUrl);
    }

    getActivos(): Observable<UsuarioMantenimiento[]> {
        return this.http.get<UsuarioMantenimiento[]>(`${this.apiUrl}/activos`);
    }

    getById(id: number): Observable<UsuarioMantenimiento> {
        return this.http.get<UsuarioMantenimiento>(`${this.apiUrl}/${id}`);
    }

    getByKeycloakId(keycloakId: string): Observable<UsuarioMantenimiento> {
        return this.http.get<UsuarioMantenimiento>(`${this.apiUrl}/keycloak/${keycloakId}`);
    }

    syncFromKeycloak(usuario: UsuarioMantenimiento): Observable<UsuarioMantenimiento> {
        return this.http.post<UsuarioMantenimiento>(`${this.apiUrl}/sync`, usuario);
    }

    // Métodos de AUTO-SINCRONIZACIÓN
    autoSyncCurrentUser(): Observable<UsuarioMantenimiento> {
        return this.http.post<UsuarioMantenimiento>(`${this.apiUrl}/auto-sync`, {});
    }

    getCurrentUser(): Observable<UsuarioMantenimiento> {
        return this.http.get<UsuarioMantenimiento>(`${this.apiUrl}/me`);
    }

    /**
     * Cambia el estado activo/inactivo de un usuario
     * 🛡️ NOTA: No se implementa eliminación física para preservar 
     * integridad referencial y trazabilidad del sistema
     */
    toggleEstado(id: number): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${id}/estado`, {});
    }

    getStats(): Observable<EstadisticasUsuarios> {
        return this.http.get<EstadisticasUsuarios>(`${this.apiUrl}/stats`);
    }
}
