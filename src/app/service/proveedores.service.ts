import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Proveedor {
    idProveedor?: number;
    nit: string;
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
export class ProveedoresService {
    private apiUrl = `${environment.apiUrl}/proveedores`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Proveedor[]> {
        return this.http.get<Proveedor[]>(this.apiUrl);
    }

    getActivos(): Observable<Proveedor[]> {
        return this.http.get<Proveedor[]>(`${this.apiUrl}/activos`);
    }

    getById(id: number): Observable<Proveedor> {
        return this.http.get<Proveedor>(`${this.apiUrl}/${id}`);
    }

    create(proveedor: Proveedor): Observable<Proveedor> {
        return this.http.post<Proveedor>(this.apiUrl, proveedor);
    }

    update(id: number, proveedor: Proveedor): Observable<Proveedor> {
        return this.http.put<Proveedor>(`${this.apiUrl}/${id}`, proveedor);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
