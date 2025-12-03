import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
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
        console.log('🔧 ContratoService: API URL configurada:', this.apiUrl);
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
            console.log('📅 parseDate: Fecha vacía o null:', dateString);
            return undefined;
        }
        if (dateString instanceof Date) {
            console.log('📅 parseDate: Ya es Date:', dateString);
            return dateString;
        }
        
        try {
            console.log('📅 parseDate: Intentando parsear:', dateString, 'tipo:', typeof dateString);
            
            // Limpiar el formato específico de Java que incluye [UTC] al final
            let cleanDateString = dateString.toString();
            
            // Remover [UTC] si está presente
            if (cleanDateString.includes('[UTC]')) {
                cleanDateString = cleanDateString.replace('[UTC]', '');
                console.log('📅 parseDate: Fecha limpiada:', cleanDateString);
            }
            
            const date = new Date(cleanDateString);
            const isValid = !isNaN(date.getTime());
            console.log('📅 parseDate: Resultado:', date, 'válida:', isValid);
            return isValid ? date : undefined;
        } catch (error) {
            console.warn('❌ Error parsing date:', dateString, error);
            return undefined;
        }
    }
    
    private convertirFechas(contrato: any): Contrato {
        const fechaInicio = this.parseDate(contrato.fechaInicio);
        const fechaFin = this.parseDate(contrato.fechaFin);
        const fechaCreacion = this.parseDate(contrato.fechaCreacion);
        
        console.log('🔧 ConvertirFechas - Contrato:', contrato.id, {
            original: {
                fechaInicio: contrato.fechaInicio,
                fechaFin: contrato.fechaFin,
                fechaCreacion: contrato.fechaCreacion
            },
            convertido: {
                fechaInicio: fechaInicio,
                fechaFin: fechaFin,
                fechaCreacion: fechaCreacion
            }
        });
        
        return {
            ...contrato,
            fechaInicio: fechaInicio,
            fechaFin: fechaFin,
            fechaCreacion: fechaCreacion
        };
    }
    
    // �📋 MÉTODOS CRUD
    
    getAll(): Observable<Contrato[]> {
        console.log('🔍 ContratoService: Obteniendo todos los contratos...');
        return this.http.get<Contrato[]>(this.apiUrl, this.getHttpOptions())
            .pipe(
                tap(contratos => {
                    console.log('✅ ContratoService: Contratos obtenidos:', contratos.length);
                    console.log('📋 Datos crudos del backend:', contratos);
                }),
                map(contratos => {
                    const contratosConvertidos = contratos.map(contrato => {
                        console.log('🔧 Convirtiendo contrato:', contrato.id, 'Fechas originales:', {
                            fechaInicio: contrato.fechaInicio,
                            fechaFin: contrato.fechaFin,
                            tipoFechaInicio: typeof contrato.fechaInicio,
                            tipoFechaFin: typeof contrato.fechaFin
                        });
                        return this.convertirFechas(contrato);
                    });
                    console.log('✅ Contratos convertidos:', contratosConvertidos);
                    return contratosConvertidos;
                }),
                catchError(this.handleError)
            );
    }
    
    getById(id: number): Observable<Contrato> {
        console.log('🔍 ContratoService: Obteniendo contrato por ID:', id);
        return this.http.get<Contrato>(`${this.apiUrl}/${id}`, this.getHttpOptions())
            .pipe(
                tap(contrato => console.log('✅ ContratoService: Contrato obtenido:', contrato)),
                map(contrato => this.convertirFechas(contrato)),
                catchError(this.handleError)
            );
    }
    
    create(contrato: Contrato): Observable<Contrato> {
        console.log('📝 ContratoService: Creando contrato:', contrato);
        
        // Enviar el contrato tal como viene, sin formatear fechas
        // Las fechas ya vienen formateadas del componente
        return this.http.post<Contrato>(this.apiUrl, contrato, this.getHttpOptions())
            .pipe(
                tap(contratoCreado => console.log('✅ ContratoService: Contrato creado:', contratoCreado)),
                map(contrato => this.convertirFechas(contrato)),
                catchError(this.handleError)
            );
    }
    
    update(id: number, contrato: Contrato): Observable<Contrato> {
        console.log('📝 ContratoService: Actualizando contrato:', id, contrato);
        
        // Enviar el contrato tal como viene, sin formatear fechas
        // Las fechas ya vienen formateadas del componente
        return this.http.put<Contrato>(`${this.apiUrl}/${id}`, contrato, this.getHttpOptions())
            .pipe(
                tap(contratoActualizado => console.log('✅ ContratoService: Contrato actualizado:', contratoActualizado)),
                map(contrato => this.convertirFechas(contrato)),
                catchError(this.handleError)
            );
    }
    
    delete(id: number): Observable<{message: string, success: boolean}> {
        console.log('🗑️ ContratoService: Eliminando contrato:', id);
        return this.http.delete<{message: string, success: boolean}>(`${this.apiUrl}/${id}`, this.getHttpOptions())
            .pipe(
                tap(response => console.log('✅ ContratoService: Contrato eliminado:', response)),
                catchError(this.handleError)
            );
    }
    
    // 🔍 MÉTODOS DE CONSULTA ESPECIALIZADA
    
    getVigentes(): Observable<Contrato[]> {
        console.log('🔍 ContratoService: Obteniendo contratos vigentes...');
        return this.http.get<Contrato[]>(`${this.apiUrl}/vigentes`, this.getHttpOptions())
            .pipe(
                tap(contratos => console.log('✅ ContratoService: Contratos vigentes:', contratos.length)),
                map(contratos => contratos.map(contrato => ({
                    ...contrato,
                    fechaInicio: new Date(contrato.fechaInicio),
                    fechaFin: new Date(contrato.fechaFin)
                }))),
                catchError(this.handleError)
            );
    }
    
    getPorVencer(): Observable<Contrato[]> {
        console.log('⚠️ ContratoService: Obteniendo contratos por vencer...');
        return this.http.get<Contrato[]>(`${this.apiUrl}/por-vencer`, this.getHttpOptions())
            .pipe(
                tap(contratos => console.log('✅ ContratoService: Contratos por vencer:', contratos.length)),
                map(contratos => contratos.map(contrato => ({
                    ...contrato,
                    fechaInicio: new Date(contrato.fechaInicio),
                    fechaFin: new Date(contrato.fechaFin)
                }))),
                catchError(this.handleError)
            );
    }
    
    getVencidos(): Observable<Contrato[]> {
        console.log('🔴 ContratoService: Obteniendo contratos vencidos...');
        return this.http.get<Contrato[]>(`${this.apiUrl}/vencidos`, this.getHttpOptions())
            .pipe(
                tap(contratos => console.log('✅ ContratoService: Contratos vencidos:', contratos.length)),
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
        console.log('📊 ContratoService: Obteniendo estadísticas...');
        return this.http.get<EstadisticasContratos>(`${this.apiUrl}/stats`, this.getHttpOptions())
            .pipe(
                tap(stats => console.log('✅ ContratoService: Estadísticas obtenidas:', stats)),
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
        console.error('Error en ContratoService:', error);
        
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
