import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FtpService {
  private ftpApiUrl = 'http://localhost:8080/MantenimientosBackend/api/ftp/upload'; // Ajusta la URL según tu backend

  constructor(private http: HttpClient) {}

  subirArchivo(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<string>(this.ftpApiUrl, formData);
  }
}
