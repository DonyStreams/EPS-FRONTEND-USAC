import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EquiposService {
  getEquipos(filtro: any): Observable<any[]> {
    // Simulación de datos, reemplaza con llamada HTTP real
    const equipos = [
      { inventario: 'EQ-001', serie: 'SN123', descripcion: 'Microscopio', estado: 'Activo', area: 'Laboratorio' },
      { inventario: 'EQ-002', serie: 'SN124', descripcion: 'Centrífuga', estado: 'Inactivo', area: 'Química' }
    ];
    // Aquí puedes filtrar según el filtro recibido
    return of(equipos);
  }
}