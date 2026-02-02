import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Mantenimiento {
  idContrato?: number;
  fechaInicio: Date | string;
  fechaFin: Date | string;
  descripcion: string;
  frecuencia: string;
  estado?: boolean;
  proveedor?: Proveedor;
  idProveedor?: number;
  nombreProveedor?: string;
  proveedorNombre?: string;
  equipos?: number[]; // Array de IDs de equipos seleccionados para envío al backend
  equiposCompletos?: Equipo[]; // Array de objetos Equipo completos recibidos del backend
  tiposMantenimiento?: TipoMantenimiento[];
  fechaCreacion?: Date;
  fechaModificacion?: Date;
  usuarioCreacion?: Usuario;
  usuarioModificacion?: Usuario;
}

export interface GuardarMantenimientoPayload {
  descripcion: string;
  fechaInicio: Date | string | null;
  fechaFin: Date | string | null;
  frecuencia: string;
  estado: boolean;
  idProveedor?: number;
  idEstado?: number;
}

export interface Equipo {
  idEquipo: number;
  nombre: string;
  codigoInacif: string;
  marca: string;
  modelo: string;
  numeroSerie: string;
  ubicacion: string;
  magnitudMedicion?: string;
  rangoCapacidad?: string;
  manualFabricante?: string;
  softwareFirmware?: string;
  fotografia?: string;
  condicionesOperacion?: string;
  descripcion?: string;
}

export interface Proveedor {
  idProveedor: number;
  nit: string;
  nombre: string;
  estado: boolean;
}

export interface TipoMantenimiento {
  idTipo: number;
  codigo: string;
  nombre: string;
  estado: boolean;
}

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
export class MantenimientoService {

  private apiUrl = `${environment.apiUrl}/mantenimientos`;

  constructor(private http: HttpClient) { }

  /**
   * Obtener todos los mantenimientos
   */
  getMantenimientos(): Observable<Mantenimiento[]> {
    return this.http.get<Mantenimiento[]>(this.apiUrl);
  }

  /**
   * Obtener mantenimiento por ID
   */
  getMantenimientoById(id: number): Observable<Mantenimiento> {
    return this.http.get<Mantenimiento>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear nuevo mantenimiento
   */
  createMantenimiento(mantenimiento: GuardarMantenimientoPayload): Observable<Mantenimiento> {
    return this.http.post<Mantenimiento>(this.apiUrl, mantenimiento);
  }

  /**
   * Actualizar mantenimiento
   */
  updateMantenimiento(id: number, mantenimiento: GuardarMantenimientoPayload): Observable<Mantenimiento> {
    return this.http.put<Mantenimiento>(`${this.apiUrl}/${id}`, mantenimiento);
  }

  /**
   * Eliminar mantenimiento
   */
  deleteMantenimiento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtener equipos disponibles
   */
  getEquiposDisponibles(): Observable<Equipo[]> {
    return this.http.get<Equipo[]>(`${this.apiUrl}/equipos-disponibles`);
  }

  /**
   * Obtener proveedores disponibles
   */
  getProveedoresDisponibles(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(`${this.apiUrl}/proveedores-disponibles`);
  }

  /**
   * Obtener tipos de mantenimiento disponibles
   */
  getTiposDisponibles(): Observable<TipoMantenimiento[]> {
    return this.http.get<TipoMantenimiento[]>(`${this.apiUrl}/tipos-disponibles`);
  }

  /**
   * Obtener mantenimientos activos
   */
  getMantenimientosActivos(): Observable<Mantenimiento[]> {
    return this.http.get<Mantenimiento[]>(`${this.apiUrl}/activos`);
  }

  /**
   * Obtener mantenimientos por proveedor
   */
  getMantenimientosByProveedor(proveedorId: number): Observable<Mantenimiento[]> {
    return this.http.get<Mantenimiento[]>(`${this.apiUrl}/proveedor/${proveedorId}`);
  }

  /**
   * Obtener equipos asociados a un contrato específico
   */
  getEquiposByContrato(contratoId: number): Observable<Equipo[]> {
    const contratoUrl = `${environment.apiUrl}/contratos`;
    return this.http.get<Equipo[]>(`${contratoUrl}/${contratoId}/equipos`);
  }
}
