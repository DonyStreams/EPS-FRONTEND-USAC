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
    if (filtro.inventario) params = params.set('numeroInventario', filtro.inventario);
    if (filtro.serie) params = params.set('numeroSerie', filtro.serie);
    if (filtro.area) params = params.set('area', filtro.area);
    if (filtro.estado) params = params.set('estado', filtro.estado);
    return this.http.get<Equipo[]>(this.apiUrl, { params });
  }

  crearEquipo(equipo: Equipo): Observable<Equipo> {
    const formData = new FormData();
    for (const key in equipo) {
      if (equipo[key] !== null && equipo[key] !== undefined) {
        formData.append(key, equipo[key]);
      }
    }
    return this.http.post<Equipo>(this.apiUrl, formData);
  }

  eliminarEquipo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}