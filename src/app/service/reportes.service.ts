import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ReportesService {
    private apiUrl = `${environment.apiUrl}/reportes`;

    constructor(private http: HttpClient) {}

    generarReporte(params: any): Observable<Blob> {
        let httpParams = new HttpParams();
        
        if (params.fechaInicio) {
            httpParams = httpParams.set('fechaInicio', params.fechaInicio.toISOString());
        }
        if (params.fechaFin) {
            httpParams = httpParams.set('fechaFin', params.fechaFin.toISOString());
        }
        if (params.idArea) {
            httpParams = httpParams.set('idArea', params.idArea.toString());
        }

        const url = `${this.apiUrl}/${params.tipo}/${params.formato}`;
        
        return this.http.get(url, {
            params: httpParams,
            responseType: 'blob'
        });
    }
}
