import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ArchivoResponse {
    success: boolean;
    message: string;
    fileName: string;
    originalName: string;
    size: number;
    downloadUrl: string;
}

export interface ArchivoInfo {
    nombre: string;
    nombreOriginal: string;
    tamano: number;
    fechaSubida: Date;
    iconoCss: string;
    tamanoFormateado: string;
}

@Injectable({
    providedIn: 'root'
})
export class ArchivosService {

    private apiUrl = `${environment.apiUrl}/archivos`;

    constructor(private http: HttpClient) { }

    /**
     * Sube un archivo al servidor usando el sistema local
     */
    subirArchivo(file: File, contratoId: number): Observable<ArchivoResponse> {
        console.log('📤 Subiendo archivo:', file.name, 'para contrato:', contratoId);
        
        const headers = new HttpHeaders({
            'X-Filename': file.name
        });
        
        return this.http.post<ArchivoResponse>(
            `${this.apiUrl}/upload/${contratoId}`, 
            file, 
            { headers: headers }
        );
    }

    /**
     * Descarga un archivo del servidor
     */
    descargarArchivo(fileName: string): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/download/${fileName}`, {
            responseType: 'blob'
        });
    }

    /**
     * Prueba el sistema de archivos
     */
    probarSistema(): Observable<any> {
        return this.http.get(`${this.apiUrl}/test`);
    }

    /**
     * Obtiene el conteo de archivos para un contrato
     */
    contarArchivosPorContrato(contratoId: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/contrato/${contratoId}/count`);
    }

    /**
     * Obtiene la lista de archivos para un contrato
     */
    listarArchivosPorContrato(contratoId: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/contrato/${contratoId}/list`);
    }

    /**
     * Obtiene el icono CSS basado en la extensión del archivo
     */
    getIconoArchivo(nombreArchivo: string): string {
        if (!nombreArchivo) return 'pi pi-file';
        
        const extension = nombreArchivo.toLowerCase().split('.').pop();
        
        switch (extension) {
            case 'pdf':
                return 'pi pi-file-pdf text-red-500';
            case 'doc':
            case 'docx':
                return 'pi pi-file-word text-blue-500';
            case 'xls':
            case 'xlsx':
                return 'pi pi-file-excel text-green-500';
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return 'pi pi-image text-purple-500';
            default:
                return 'pi pi-file text-gray-500';
        }
    }

    /**
     * Formatea el tamaño del archivo
     */
    formatearTamano(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Valida si el archivo es válido para contratos
     */
    esArchivoValidoContrato(file: File): boolean {
        const extensionesPermitidas = ['pdf', 'doc', 'docx'];
        const extension = file.name.toLowerCase().split('.').pop();
        return extensionesPermitidas.includes(extension || '');
    }

    /**
     * Valida el tamaño máximo del archivo (10MB)
     */
    validarTamano(file: File, maxSizeMB: number = 10): boolean {
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        return file.size <= maxSizeBytes;
    }

    /**
     * Obtiene la lista de archivos de un contrato específico
     */
    getListaArchivosPorContrato(contratoId: number): Observable<any> {
        console.log('📋 Obteniendo lista de archivos para contrato:', contratoId);
        
        return this.http.get<any>(`${this.apiUrl}/contrato/${contratoId}/list`);
    }

    /**
     * Obtiene el conteo de archivos de un contrato específico
     */
    getConteoArchivosPorContrato(contratoId: number): Observable<any> {
        console.log('📊 Obteniendo conteo de archivos para contrato:', contratoId);
        
        return this.http.get<any>(`${this.apiUrl}/contrato/${contratoId}/count`);
    }

    /**
     * Obtiene la URL de descarga de un archivo
     */
    getUrlDescarga(nombreArchivo: string): string {
        return `${this.apiUrl}/download/${nombreArchivo}`;
    }

    /**
     * Elimina un archivo del servidor
     */
    eliminarArchivo(nombreSistema: string): Observable<any> {
        console.log('🗑️ Eliminando archivo:', nombreSistema);
        // Codificar el nombre del archivo para manejar caracteres especiales
        const encodedFileName = encodeURIComponent(nombreSistema);
        return this.http.delete(`${this.apiUrl}/delete/${encodedFileName}`);
    }
}
