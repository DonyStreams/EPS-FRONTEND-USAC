import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Ticket {
    id?: number;
    equipoId: number;
    usuarioCreadorId: number;
    usuarioAsignadoId?: number;
    descripcion: string;
    prioridad: 'Baja' | 'Media' | 'Alta' | 'Crítica';
    estado: 'Abierto' | 'Asignado' | 'En Proceso' | 'Resuelto' | 'Cerrado';
    fechaCreacion?: Date;
    fechaModificacion?: Date;
    fechaCierre?: Date;
    usuarioCreacion?: number;
    usuarioModificacion?: number;
    
    // Objetos anidados para mostrar información relacionada
    equipo?: {
        idEquipo?: number;
        nombre?: string;
        codigoInacif?: string;
        ubicacion?: string;
    };
    
    usuarioCreador?: {
        id?: number;
        nombreCompleto?: string;
    };
    
    usuarioAsignado?: {
        id?: number;
        nombreCompleto?: string;
    };
    
    // Propiedades para el formulario (snake_case si es necesario)
    equipo_id?: number;
    usuario_creador_id?: number;
    usuario_asignado_id?: number;
    fecha_creacion?: Date;
    fecha_modificacion?: Date;
    fecha_cierre?: Date;
    usuario_creacion?: number;
    usuario_modificacion?: number;
}

export interface ComentarioTicket {
    id?: number;
    ticketId: number;
    usuarioId: number;
    tipoComentarioId: number;
    comentario: string;
    fechaCreacion?: Date;
    
    // Objetos anidados
    usuario?: {
        id?: number;
        nombreCompleto?: string;
    };
    
    tipoComentario?: {
        idTipo?: number;
        nombre?: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class TicketsService {
    private apiUrl = `${environment.apiUrl}/tickets`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Ticket[]> {
        return this.http.get<Ticket[]>(this.apiUrl);
    }

    getAbiertos(): Observable<Ticket[]> {
        return this.http.get<Ticket[]>(`${this.apiUrl}/abiertos`);
    }

    getById(id: number): Observable<Ticket> {
        return this.http.get<Ticket>(`${this.apiUrl}/${id}`);
    }

    getByEquipo(equipoId: number): Observable<Ticket[]> {
        return this.http.get<Ticket[]>(`${this.apiUrl}/equipo/${equipoId}`);
    }

    create(ticket: Partial<Ticket>): Observable<Ticket> {
        return this.http.post<Ticket>(this.apiUrl, ticket);
    }

    update(id: number, ticket: Partial<Ticket>): Observable<Ticket> {
        return this.http.put<Ticket>(`${this.apiUrl}/${id}`, ticket);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    asignar(id: number, usuarioId: number): Observable<Ticket> {
        return this.http.put<Ticket>(`${this.apiUrl}/${id}/asignar`, { usuarioAsignadoId: usuarioId });
    }

    cerrar(id: number): Observable<Ticket> {
        return this.http.put<Ticket>(`${this.apiUrl}/${id}/cerrar`, {});
    }

    // Servicios para comentarios
    getComentarios(ticketId: number): Observable<ComentarioTicket[]> {
        return this.http.get<ComentarioTicket[]>(`${this.apiUrl}/${ticketId}/comentarios`);
    }

    addComentario(ticketId: number, comentario: Partial<ComentarioTicket>): Observable<ComentarioTicket> {
        return this.http.post<ComentarioTicket>(`${this.apiUrl}/${ticketId}/comentarios`, comentario);
    }
}
