import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Contrato {
    id?: number;
    fechaInicio?: Date;
    fechaFin?: Date;
    descripcion: string;
    estado: boolean;
    estadoDescriptivo?: string;
    proveedor?: string; // Opcional para creación
    idProveedor: number;
    fechaCreacion?: Date;
    usuarioCreacion?: string;
    vigente?: boolean;
    proximoAVencer?: boolean;
    archivos?: any[];
    totalArchivos?: number;
}

export interface EstadisticasContratos {
    total: number;
    vigentes: number;
    porVencer: number;
    vencidos: number;
    inactivos: number;
}

@Injectable({
    providedIn: 'root'
})
export class ContratoService {
    
    private apiUrl = `${environment.apiUrl}/contratos`;
    
    constructor(private http: HttpClient) { 
    }
    
    private getHttpOptions() {
        return {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
    }
    
    // � MÉTODO AUXILIAR PARA CONVERSIÓN DE FECHAS
    
    private parseDate(dateString: string | Date | null | undefined): Date | undefined {
        if (!dateString) {
            return undefined;
        }
        if (dateString instanceof Date) {
            return dateString;
        }
        
        try {
            // Limpiar el formato específico de Java que incluye [UTC] al final
            let cleanDateString = dateString.toString();
            
            // Remover [UTC] si está presente
            if (cleanDateString.includes('[UTC]')) {
                cleanDateString = cleanDateString.replace('[UTC]', '');
            }
            
            const date = new Date(cleanDateString);
            const isValid = !isNaN(date.getTime());
            return isValid ? date : undefined;
        } catch (error) {
            return undefined;
        }
    }
    
    private convertirFechas(contrato: any): Contrato {
        const fechaInicio = this.parseDate(contrato.fechaInicio);
        const fechaFin = this.parseDate(contrato.fechaFin);
        const fechaCreacion = this.parseDate(contrato.fechaCreacion);
        
        return {
            ...contrato,
            fechaInicio: fechaInicio,
            fechaFin: fechaFin,
            fechaCreacion: fechaCreacion
        };
    }
    
    // �📋 MÉTODOS CRUD
    
    getAll(): Observable<Contrato[]> {
        return this.http.get<Contrato[]>(this.apiUrl, this.getHttpOptions())
            .pipe(
                map(contratos => {
                    return contratos.map(contrato => this.convertirFechas(contrato));
                }),
                catchError(this.handleError)
            );
    }
    
    getById(id: number): Observable<Contrato> {
        return this.http.get<Contrato>(`${this.apiUrl}/${id}`, this.getHttpOptions())
            .pipe(
                map(contrato => this.convertirFechas(contrato)),
                catchError(this.handleError)
            );
    }
    
    create(contrato: Contrato): Observable<Contrato> {
        // Enviar el contrato tal como viene, sin formatear fechas
        // Las fechas ya vienen formateadas del componente
        return this.http.post<Contrato>(this.apiUrl, contrato, this.getHttpOptions())
            .pipe(
                map(contrato => this.convertirFechas(contrato)),
                catchError(this.handleError)
            );
    }
    
    update(id: number, contrato: Contrato): Observable<Contrato> {
        // Enviar el contrato tal como viene, sin formatear fechas
        // Las fechas ya vienen formateadas del componente
        return this.http.put<Contrato>(`${this.apiUrl}/${id}`, contrato, this.getHttpOptions())
            .pipe(
                map(contrato => this.convertirFechas(contrato)),
                catchError(this.handleError)
            );
    }
    
    delete(id: number): Observable<{message: string, success: boolean}> {
        return this.http.delete<{message: string, success: boolean}>(`${this.apiUrl}/${id}`, this.getHttpOptions())
            .pipe(
                catchError(this.handleError)
            );
    }
    
    // 🔍 MÉTODOS DE CONSULTA ESPECIALIZADA
    
    getVigentes(): Observable<Contrato[]> {
        return this.http.get<Contrato[]>(`${this.apiUrl}/vigentes`, this.getHttpOptions())
            .pipe(
                map(contratos => contratos.map(contrato => ({
                    ...contrato,
                    fechaInicio: new Date(contrato.fechaInicio),
                    fechaFin: new Date(contrato.fechaFin)
                }))),
                catchError(this.handleError)
            );
    }
    
    getPorVencer(): Observable<Contrato[]> {
        return this.http.get<Contrato[]>(`${this.apiUrl}/por-vencer`, this.getHttpOptions())
            .pipe(
                map(contratos => contratos.map(contrato => ({
                    ...contrato,
                    fechaInicio: new Date(contrato.fechaInicio),
                    fechaFin: new Date(contrato.fechaFin)
                }))),
                catchError(this.handleError)
            );
    }
    
    getVencidos(): Observable<Contrato[]> {
        return this.http.get<Contrato[]>(`${this.apiUrl}/vencidos`, this.getHttpOptions())
            .pipe(
                map(contratos => contratos.map(contrato => ({
                    ...contrato,
                    fechaInicio: new Date(contrato.fechaInicio),
                    fechaFin: new Date(contrato.fechaFin)
                }))),
                catchError(this.handleError)
            );
    }
    
    // 📊 ESTADÍSTICAS
    
    getStats(): Observable<EstadisticasContratos> {
        return this.http.get<EstadisticasContratos>(`${this.apiUrl}/stats`, this.getHttpOptions())
            .pipe(
                catchError(this.handleError)
            );
    }
    
    // 📎 GESTIÓN DE ARCHIVOS (por implementar)
    
    uploadFile(contratoId: number, file: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('contratoId', contratoId.toString());
        
        return this.http.post(`${this.apiUrl}/${contratoId}/archivos`, formData)
            .pipe(catchError(this.handleError));
    }
    
    downloadFile(contratoId: number, archivoId: number): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/${contratoId}/archivos/${archivoId}/download`, 
            { responseType: 'blob' })
            .pipe(catchError(this.handleError));
    }
    
    deleteFile(contratoId: number, archivoId: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${contratoId}/archivos/${archivoId}`, this.getHttpOptions())
            .pipe(catchError(this.handleError));
    }
    
    // 🔧 MÉTODOS AUXILIARES
    
    private formatDate(date: Date): string {
        if (!date) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    private handleError(error: any): Observable<never> {
        let errorMessage = 'Ha ocurrido un error inesperado';
        
        if (error.error) {
            if (typeof error.error === 'string') {
                try {
                    const errorObj = JSON.parse(error.error);
                    errorMessage = errorObj.error || errorObj.mensaje || errorMessage;
                } catch {
                    errorMessage = error.error;
                }
            } else if (error.error.error || error.error.mensaje) {
                errorMessage = error.error.error || error.error.mensaje;
            }
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        return throwError(() => new Error(errorMessage));
    }
}
