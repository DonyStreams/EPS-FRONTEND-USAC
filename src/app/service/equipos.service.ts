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
    return this.http.post<Equipo>(this.apiUrl, equipo);
  }

  editarEquipo(equipo: Equipo): Observable<Equipo> {
    return this.http.put<Equipo>(`${this.apiUrl}/${equipo.idEquipo}`, equipo);
  }

  eliminarEquipo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}