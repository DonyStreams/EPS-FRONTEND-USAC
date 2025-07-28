import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FtpService {
  private ftpApiUrl = 'http://localhost:8080/MantenimientosBackend/api/ftp/upload';

  constructor(private http: HttpClient) {}

  subirArchivo(file: File): Observable<any> {
    // Leer el archivo como ArrayBuffer y enviarlo como binario
    return new Observable(observer => {
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        // Forzar el tipo application/octet-stream para el backend
        const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
        this.http.post(this.ftpApiUrl, blob, {
          headers: new HttpHeaders({
            'X-Filename': file.name,
            'Content-Type': 'application/octet-stream'
          }),
          observe: 'body',
          responseType: 'text'
        }).subscribe({
          next: resp => observer.next(resp),
          error: err => observer.error(err),
          complete: () => observer.complete()
        });
      };
      reader.onerror = err => observer.error(err);
      reader.readAsArrayBuffer(file);
    });
  }
}
