import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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

// Interface para comentarios que vienen del backend (estructura plana)
export interface ComentarioTicketResponse {
    id: number;
    comentario: string;
    fechaCreacion: string;
    usuario: string;       // nombre_completo del usuario
    tipoComentario: string; // nombre del tipo de comentario
}

@Injectable({
    providedIn: 'root'
})
export class TicketsService {
    private apiUrl = `${environment.apiUrl}/tickets`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Ticket[]> {
        return this.http.get<{tickets: Ticket[], total: number, success: boolean}>(this.apiUrl)
            .pipe(
                map(response => response.tickets || [])
            );
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

    create(ticket: Partial<Ticket>): Observable<{message: string, success: boolean}> {
        return this.http.post<{message: string, success: boolean}>(this.apiUrl, ticket);
    }

    update(id: number, ticket: Partial<Ticket>): Observable<Ticket> {
        return this.http.put<Ticket>(`${this.apiUrl}/${id}`, ticket);
    }

    delete(id: number): Observable<{message: string, success: boolean}> {
        return this.http.delete<{message: string, success: boolean}>(`${this.apiUrl}/${id}`);
    }

    asignar(id: number, usuarioId: number): Observable<Ticket> {
        return this.http.put<Ticket>(`${this.apiUrl}/${id}/asignar`, { usuarioAsignadoId: usuarioId });
    }

    cerrar(id: number): Observable<Ticket> {
        return this.http.put<Ticket>(`${this.apiUrl}/${id}/cerrar`, {});
    }

    // Servicios para comentarios
    getComentarios(ticketId: number): Observable<ComentarioTicketResponse[]> {
        return this.http.get<{comentarios: ComentarioTicketResponse[], total: number, success: boolean}>(`${this.apiUrl}/${ticketId}/comentarios`)
            .pipe(
                map(response => response.comentarios || [])
            );
    }

    addComentario(ticketId: number, data: {comentario: string, tipoComentario?: string, nuevoEstado?: string}): Observable<{message: string, success: boolean}> {
        return this.http.post<{message: string, success: boolean}>(`${this.apiUrl}/${ticketId}/comentarios`, data);
    }

    // Servicios para evidencias
    getEvidencias(ticketId: number): Observable<{evidencias: any[], success: boolean}> {
        return this.http.get<{evidencias: any[], success: boolean}>(`${this.apiUrl}/${ticketId}/evidencias`);
    }

    addEvidencia(ticketId: number, evidencia: {archivoUrl: string, descripcion?: string}): Observable<{message: string, success: boolean}> {
        return this.http.post<{message: string, success: boolean}>(`${this.apiUrl}/${ticketId}/evidencias`, evidencia);
    }

    deleteEvidencia(ticketId: number, evidenciaId: number): Observable<{message: string, success: boolean}> {
        return this.http.delete<{message: string, success: boolean}>(`${this.apiUrl}/${ticketId}/evidencias/${evidenciaId}`);
    }
}
