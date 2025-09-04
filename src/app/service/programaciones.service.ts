import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Interfaces
export interface ProgramacionMantenimiento {
    idProgramacion?: number;
    equipoId: number;
    tipoMantenimientoId: number;
    contratoId: number;
    frecuenciaDias: number;
    fechaUltimoMantenimiento?: Date;
    fechaProximoMantenimiento?: Date;
    diasAlertaPrevia: number;
    activa: boolean;
    observaciones?: string;
    fechaCreacion?: Date;
    fechaModificacion?: Date;
    usuarioCreacion?: number;
    usuarioModificacion?: number;

    // Objetos anidados para mostrar información relacionada
    equipo?: {
        idEquipo?: number;
        nombre?: string;
        codigoInacif?: string;
        ubicacion?: string;
    };
    
    tipoMantenimiento?: {
        idTipo?: number;
        nombre?: string;
    };
    
    contrato?: {
        idContrato?: number;
        descripcion?: string;
        descripcionCompleta?: string;
        fechaInicio?: Date;
        fechaFin?: Date;
        proveedor?: {
            nombre?: string;
        };
    };
}

export interface Equipo {
    idEquipo: number;
    nombre: string;
    codigoInacif: string;
    ubicacion?: string;
}

export interface TipoMantenimiento {
    idTipo: number;
    nombre: string;
}

export interface Contrato {
    idContrato: number;
    descripcion: string;
    descripcionCompleta?: string;
    fechaInicio: Date;
    fechaFin: Date;
    estado: string;
    proveedor?: {
        nombre?: string;
    };
}

export interface EstadisticasProgramaciones {
    total: number;
    activas: number;
    proximas: number;
    vencidas: number;
}

@Injectable({
    providedIn: 'root'
})
export class ProgramacionesService {

    private apiUrl = environment.production ? 
        'http://localhost:8081/MantenimientosBackend/api' : 
        'http://localhost:8081/MantenimientosBackend/api';

    constructor(private http: HttpClient) {}

    /**
     * Obtiene todas las programaciones
     */
    getAll(): Observable<ProgramacionMantenimiento[]> {
        return this.http.get<ProgramacionMantenimiento[]>(`${this.apiUrl}/programaciones`);
    }

    /**
     * Obtiene una programación por ID
     */
    getById(id: number): Observable<ProgramacionMantenimiento> {
        return this.http.get<ProgramacionMantenimiento>(`${this.apiUrl}/programaciones/${id}`);
    }

    /**
     * Crea una nueva programación
     */
    create(programacion: ProgramacionMantenimiento): Observable<ProgramacionMantenimiento> {
        return this.http.post<ProgramacionMantenimiento>(`${this.apiUrl}/programaciones`, programacion);
    }

    /**
     * Actualiza una programación existente
     */
    update(id: number, programacion: ProgramacionMantenimiento): Observable<ProgramacionMantenimiento> {
        return this.http.put<ProgramacionMantenimiento>(`${this.apiUrl}/programaciones/${id}`, programacion);
    }

    /**
     * Elimina una programación
     */
    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/programaciones/${id}`);
    }

    /**
     * Obtiene estadísticas de programaciones
     */
    getEstadisticas(): Observable<EstadisticasProgramaciones> {
        return this.http.get<EstadisticasProgramaciones>(`${this.apiUrl}/programaciones/estadisticas`);
    }

    /**
     * Obtiene contratos vigentes que cubran un equipo y tipo de mantenimiento específicos
     */
    getContratosDisponibles(equipoId?: number, tipoMantenimientoId?: number): Observable<Contrato[]> {
        let params = new HttpParams();
        if (equipoId) {
            params = params.set('equipoId', equipoId.toString());
        }
        if (tipoMantenimientoId) {
            params = params.set('tipoMantenimientoId', tipoMantenimientoId.toString());
        }
        
        return this.http.get<Contrato[]>(`${this.apiUrl}/contratos/vigentes`, { params });
    }

    /**
     * Obtiene todos los equipos
     */
    getEquipos(): Observable<Equipo[]> {
        return this.http.get<Equipo[]>(`${this.apiUrl}/equipos`);
    }

    /**
     * Obtiene todos los tipos de mantenimiento
     */
    getTiposMantenimiento(): Observable<TipoMantenimiento[]> {
        return this.http.get<TipoMantenimiento[]>(`${this.apiUrl}/tipos-mantenimiento`);
    }

    /**
     * Activa o desactiva una programación
     */
    toggleActiva(id: number, activa: boolean): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/programaciones/${id}/toggle-activa`, { activa });
    }

    /**
     * Crea un mantenimiento desde una programación
     */
    crearMantenimiento(programacionId: number): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/programaciones/${programacionId}/crear-mantenimiento`, {});
    }
}
