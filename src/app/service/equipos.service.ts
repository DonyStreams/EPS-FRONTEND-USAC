import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Equipo } from '../api/equipos';

@Injectable({ providedIn: 'root' })
export class EquiposService {
  private apiUrl = 'http://localhost:8080/MantenimientosBackend/api/equipos';

  constructor(private http: HttpClient) {}

  getEquipos(filtro: any): Observable<Equipo[]> {
    let params = new HttpParams();
    if (filtro.nombre) params = params.set('nombre', filtro.nombre);
    if (filtro.numeroSerie) params = params.set('numeroSerie', filtro.numeroSerie);
    if (filtro.marca) params = params.set('marca', filtro.marca);
    if (filtro.modelo) params = params.set('modelo', filtro.modelo);
    if (filtro.ubicacion) params = params.set('ubicacion', filtro.ubicacion);
    if (filtro.estado) params = params.set('estado', filtro.estado);
    return this.http.get<Equipo[]>(this.apiUrl, { params });
  }

  crearEquipo(equipo: Equipo): Observable<Equipo> {
    const formData = new FormData();
    // Solo los campos importantes
    if (equipo.nombre) formData.append('nombre', equipo.nombre);
    if (equipo.numeroSerie) formData.append('numeroSerie', equipo.numeroSerie);
    if (equipo.marca) formData.append('marca', equipo.marca);
    if (equipo.modelo) formData.append('modelo', equipo.modelo);
    if (equipo.ubicacion) formData.append('ubicacion', equipo.ubicacion);
    if (equipo.estado !== undefined && equipo.estado !== null) formData.append('estado', String(equipo.estado));
    if (equipo.fotografia) formData.append('fotografia', equipo.fotografia);
    if (equipo.descripcion) formData.append('descripcion', equipo.descripcion);
    return this.http.post<Equipo>(this.apiUrl, formData);
  }

  editarEquipo(equipo: Equipo): Observable<Equipo> {
    const formData = new FormData();
    if (equipo.nombre) formData.append('nombre', equipo.nombre);
    if (equipo.numeroSerie) formData.append('numeroSerie', equipo.numeroSerie);
    if (equipo.marca) formData.append('marca', equipo.marca);
    if (equipo.modelo) formData.append('modelo', equipo.modelo);
    if (equipo.ubicacion) formData.append('ubicacion', equipo.ubicacion);
    if (equipo.estado !== undefined && equipo.estado !== null) formData.append('estado', String(equipo.estado));
    if (equipo.fotografia) formData.append('fotografia', equipo.fotografia);
    if (equipo.descripcion) formData.append('descripcion', equipo.descripcion);
    return this.http.put<Equipo>(`${this.apiUrl}/${equipo.idEquipo}`, formData);
  }

  eliminarEquipo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}