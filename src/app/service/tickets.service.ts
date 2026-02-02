import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { KeycloakService } from './keycloak.service';
import { UsuariosService, Usuario } from './usuarios.service';

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

export interface EvidenciaTicket {
    id: number;
    nombreArchivo?: string;
    nombreOriginal?: string;
    tipoArchivo?: string;
    tamanio?: number;
    descripcion?: string;
    archivoUrl: string;
    fechaCreacion?: string;
}

@Injectable({
    providedIn: 'root'
})
export class TicketsService {
    private apiUrl = `${environment.apiUrl}/tickets`;
    private currentUsuario: Usuario | null = null;

    constructor(
        private http: HttpClient,
        private keycloakService: KeycloakService,
        private usuariosService: UsuariosService
    ) {
        // Cargar usuario actual al inicializar
        this.loadCurrentUser();
    }
    
    /**
     * Carga el usuario actual basado en el keycloakId
     */
    private loadCurrentUser(): void {
        const keycloakId = this.keycloakService.getUserId();
        if (keycloakId) {
            this.usuariosService.getByKeycloakId(keycloakId).subscribe({
                next: (usuario) => {
                    if (usuario) {
                        this.currentUsuario = usuario;
                        return;
                    }

                    this.currentUsuario = {
                        id: 1,
                        keycloakId: keycloakId,
                        nombreCompleto: this.keycloakService.getUserFullName() || 'Usuario',
                        correo: this.keycloakService.getUserEmail() || '',
                        activo: true
                    };
                },
                error: (err) => {
                    // Usar datos de Keycloak como fallback
                    this.currentUsuario = {
                        id: 1, // ID por defecto
                        keycloakId: keycloakId,
                        nombreCompleto: this.keycloakService.getUserFullName() || 'Usuario',
                        correo: this.keycloakService.getUserEmail() || '',
                        activo: true
                    };
                }
            });
        }
    }
    
    /**
     * Obtiene el usuario actual (ID y nombre)
     */
    getCurrentUser(): { id: number, nombre: string } {
        if (this.currentUsuario) {
            return { id: this.currentUsuario.id, nombre: this.currentUsuario.nombreCompleto };
        }
        // Fallback
        return { id: 1, nombre: this.keycloakService.getUserFullName() || 'Sistema' };
    }

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
        // Agregar información del usuario que modifica
        const currentUser = this.getCurrentUser();
        const ticketConUsuario = {
            ...ticket,
            usuarioModificadorId: currentUser.id,
            usuarioModificadorNombre: currentUser.nombre
        };
        return this.http.put<Ticket>(`${this.apiUrl}/${id}`, ticketConUsuario);
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
        return this.http.get(`${this.apiUrl}/${ticketId}/comentarios`, { responseType: 'text' })
            .pipe(
                map(text => {
                    try {
                        const response = JSON.parse(text);
                        return response.comentarios || [];
                    } catch (e) {
                        try {
                            // Limpiar varios patrones problemáticos
                            let cleanedText = text
                                .replace(/: "\\/g, ': "archivo')  // Comilla escapada
                                .replace(/: ""/g, ': "archivo"')  // Comillas vacías
                                .replace(/"""/g, '"')             // Triple comilla
                                .replace(/\\+"/g, '"')            // Backslash antes de comilla
                                .replace(/: "([^"]*)\\",/g, ': "$1",'); // Backslash al final
                            const response = JSON.parse(cleanedText);
                            return response.comentarios || [];
                        } catch (e2) {
                            return [];
                        }
                    }
                })
            );
    }

    addComentario(ticketId: number, data: {comentario: string, tipoComentario?: string, estadoAnterior?: string, nuevoEstado?: string}): Observable<{message: string, success: boolean}> {
        return this.http.post<{message: string, success: boolean}>(`${this.apiUrl}/${ticketId}/comentarios`, data);
    }

    // Servicios para evidencias
    getEvidencias(ticketId: number): Observable<{evidencias: EvidenciaTicket[], success: boolean}> {
        return this.http.get<{evidencias: EvidenciaTicket[], success: boolean}>(`${this.apiUrl}/${ticketId}/evidencias`);
    }

    addEvidencia(ticketId: number, evidencia: {archivoUrl: string, descripcion?: string}): Observable<{message: string, success: boolean}> {
        return this.http.post<{message: string, success: boolean}>(`${this.apiUrl}/${ticketId}/evidencias`, evidencia);
    }

    deleteEvidencia(ticketId: number, evidenciaId: number): Observable<{message: string, success: boolean}> {
        return this.http.delete<{message: string, success: boolean}>(`${this.apiUrl}/${ticketId}/evidencias/${evidenciaId}`);
    }

    uploadEvidenciaArchivo(ticketId: number, file: File, descripcion?: string): Observable<any> {
        const currentUser = this.getCurrentUser();
        let headers = new HttpHeaders({ 
            'X-Filename': file.name,
            'X-Usuario-Id': currentUser.id.toString(),
            'X-Usuario-Nombre': encodeURIComponent(currentUser.nombre)
        });
        if (descripcion && descripcion.trim().length > 0) {
            headers = headers.set('X-Descripcion', encodeURIComponent(descripcion.trim()));
        }
        return this.http.post(`${this.apiUrl}/${ticketId}/evidencias/upload`, file, { headers });
    }

    downloadEvidencia(ticketId: number, nombreArchivo: string): Observable<Blob> {
        return this.http.get<Blob>(`${this.apiUrl}/${ticketId}/evidencias/download/${nombreArchivo}`, {
            responseType: 'blob' as 'json'
        });
    }
}
