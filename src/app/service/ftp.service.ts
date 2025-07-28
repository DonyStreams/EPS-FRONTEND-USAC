import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FtpService {
  private ftpApiUrl = 'http://localhost:8080/MantenimientosBackend/api/ftp/upload';

  constructor(private http: HttpClient) {}

  subirArchivo(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    // ❗NO enviar headers manuales de Content-Type para FormData
    return this.http.post(this.ftpApiUrl, formData, {
      observe: 'body', // podría cambiar a 'events' si quieres progreso
      responseType: 'text' // porque tu backend responde con texto plano
    });
  }
}
