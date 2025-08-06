import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Contrato {
    idContrato?: number;
    fechaInicio: Date;
    fechaFin: Date;
    descripcion: string;
    frecuencia: string;
    estado: boolean;
    proveedor?: {
        idProveedor: number;
        nombre: string;
        nit: string;
    };
    equipos?: Array<{
        idEquipo: number;
        nombre: string;
        codigoInacif: string;
    }>;
    tiposMantenimiento?: Array<{
        idTipo: number;
        nombre: string;
    }>;
    fechaCreacion?: Date;
    fechaModificacion?: Date;
    
    // Propiedades para el formulario (snake_case)
    id_contrato?: number;
    fecha_inicio?: Date;
    fecha_fin?: Date;
    id_proveedor?: number;
    fecha_creacion?: Date;
    fecha_modificacion?: Date;
    usuario_creacion?: number;
    usuario_modificacion?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ContratosService {
    private apiUrl = `${environment.apiUrl}/contratos`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Contrato[]> {
        return this.http.get<Contrato[]>(this.apiUrl);
    }

    getActivos(): Observable<Contrato[]> {
        return this.http.get<Contrato[]>(`${this.apiUrl}/activos`);
    }

    getById(id: number): Observable<Contrato> {
        return this.http.get<Contrato>(`${this.apiUrl}/${id}`);
    }

    create(contrato: Contrato): Observable<Contrato> {
        return this.http.post<Contrato>(this.apiUrl, contrato);
    }

    update(id: number, contrato: Contrato): Observable<Contrato> {
        return this.http.put<Contrato>(`${this.apiUrl}/${id}`, contrato);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getByProveedor(idProveedor: number): Observable<Contrato[]> {
        return this.http.get<Contrato[]>(`${this.apiUrl}/proveedor/${idProveedor}`);
    }
}
