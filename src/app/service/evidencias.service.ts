import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEventType } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Evidencia {
    id?: number;
    nombreArchivo?: string;
    nombreOriginal?: string;
    tipoArchivo?: string;
    tamanio?: number;
    descripcion?: string;
    archivoUrl?: string;
    fechaCreacion?: Date | string;
    usuarioCreacionNombre?: string;
}

export interface UploadProgress {
    status: 'progress' | 'complete' | 'error';
    progress?: number;
    evidencia?: Evidencia;
    error?: string;
}

@Injectable({
    providedIn: 'root'
})
export class EvidenciasService {

    private apiUrl = `${environment.apiUrl}/ejecuciones-mantenimiento`;

    constructor(private http: HttpClient) { }

    /**
     * Obtiene todas las evidencias de una ejecución
     */
    getByEjecucion(ejecucionId: number): Observable<Evidencia[]> {
        return this.http.get<Evidencia[]>(`${this.apiUrl}/${ejecucionId}/evidencias`);
    }

    /**
     * Sube un archivo como evidencia
     */
    upload(ejecucionId: number, file: File, descripcion?: string): Observable<UploadProgress> {
        const headers = new HttpHeaders({
            'X-Filename': encodeURIComponent(file.name),
            'X-Descripcion': descripcion ? encodeURIComponent(descripcion) : ''
        });

        return this.http.post<Evidencia>(
            `${this.apiUrl}/${ejecucionId}/evidencias/upload`,
            file,
            {
                headers,
                reportProgress: true,
                observe: 'events'
            }
        ).pipe(
            map(event => {
                switch (event.type) {
                    case HttpEventType.UploadProgress:
                        const progress = event.total ? Math.round(100 * event.loaded / event.total) : 0;
                        return { status: 'progress' as const, progress };
                    case HttpEventType.Response:
                        return { status: 'complete' as const, evidencia: event.body as Evidencia };
                    default:
                        return { status: 'progress' as const, progress: 0 };
                }
            })
        );
    }

    /**
     * Descarga un archivo como Blob
     */
    descargarArchivo(ejecucionId: number, nombreArchivo: string): Observable<Blob> {
        // NO codificar aquí, el nombre ya viene como está guardado
        return this.http.get(
            `${this.apiUrl}/${ejecucionId}/evidencias/download/${nombreArchivo}`,
            { responseType: 'blob' }
        );
    }

    /**
     * Actualiza la descripción de una evidencia
     */
    updateDescripcion(ejecucionId: number, evidenciaId: number, descripcion: string): Observable<Evidencia> {
        return this.http.put<Evidencia>(
            `${this.apiUrl}/${ejecucionId}/evidencias/${evidenciaId}`,
            { descripcion }
        );
    }

    /**
     * Elimina una evidencia
     */
    delete(ejecucionId: number, evidenciaId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${ejecucionId}/evidencias/${evidenciaId}`);
    }

    /**
     * Formatea el tamaño del archivo a formato legible
     */
    formatFileSize(bytes?: number): string {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Verifica si el archivo es una imagen
     */
    isImage(evidencia: Evidencia): boolean {
        const tipo = evidencia.tipoArchivo?.toLowerCase() || '';
        return tipo.startsWith('image/');
    }

    /**
     * Obtiene el icono apropiado para el tipo de archivo
     */
    getFileIcon(evidencia: Evidencia): string {
        const tipo = evidencia.tipoArchivo?.toLowerCase() || '';
        const nombre = evidencia.nombreOriginal?.toLowerCase() || '';
        
        if (tipo.startsWith('image/')) return 'pi pi-image text-purple-500';
        if (tipo.includes('pdf') || nombre.endsWith('.pdf')) return 'pi pi-file-pdf text-red-500';
        // Verificar Excel ANTES que Word (porque spreadsheetdocument contiene "doc")
        if (tipo.includes('excel') || tipo.includes('spreadsheet') || nombre.endsWith('.xls') || nombre.endsWith('.xlsx')) {
            return 'pi pi-file-excel text-green-500';
        }
        if (tipo.includes('word') || tipo.includes('msword') || nombre.endsWith('.doc') || nombre.endsWith('.docx')) {
            return 'pi pi-file-word text-blue-500';
        }
        return 'pi pi-file text-gray-500';
    }
}
