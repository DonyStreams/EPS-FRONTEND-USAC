import { Component, OnInit, ViewChild } from '@angular/core';
import { EquiposService } from '../../../service/equipos.service';
import { FtpService } from '../../../service/ftp.service';
import { KeycloakService } from '../../../service/keycloak.service';
import { Equipo } from '../../../api/equipos';
import { FileUpload } from 'primeng/fileupload';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

interface EstadoOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-equipos-list',
  templateUrl: './equipos-list.component.html'
})
export class EquiposListComponent implements OnInit {
  @ViewChild('fileUpload') fileUpload!: FileUpload;
  @ViewChild('fileUploadEdit') fileUploadEdit!: FileUpload;
  
  equipos: Equipo[] = [];
  equiposSeleccionados: Equipo[] = [];
  filtro = {
    nombre: '',
    numeroSerie: '',
    marca: '',
    modelo: '',
    ubicacion: '',
    estado: ''
  };

  estados: EstadoOption[] = [
    { label: 'Todos', value: '' },
    { label: 'Activo', value: 'Activo' },
    { label: 'Inactivo', value: 'Inactivo' }
  ];

  mostrarModalNuevoEquipo = false;

  nuevoEquipo: Equipo = {
    numeroInventario: '',
    numeroSerie: '',
    nombre: '',
    codigoInacif: '',
    marca: '',
    modelo: '',
    ubicacion: '',
    magnitudMedicion: '',
    rangoCapacidad: '',
    manualFabricante: '',
    fotografia: null,
    softwareFirmware: '',
    condicionesOperacion: '',
    descripcion: '',
    estado: true,
    area: ''
  };

  areas = [
    // Debes cargar estas áreas desde tu servicio real
    { id: 1, nombre: 'Laboratorio' },
    { id: 2, nombre: 'Química' }
  ];

  previewUrl: string | null = null;
  mensaje: string | null = null;
  errorImagen: string | null = null;

  // Variables para el modal de edición
  previewUrlEdit: string | null = null;
  errorImagenEdit: string | null = null;

  mostrarModalEditarEquipo = false;
  equipoEditando: Equipo | null = null;

  constructor(
    private equiposService: EquiposService, 
    private ftpService: FtpService,
    private keycloakService: KeycloakService,
    private http: HttpClient
  ) {}

  // Métodos de permisos usando Keycloak
  get puedeCrearEquipos(): boolean {
    return this.keycloakService.canCreateEquipos();
  }

  get puedeEditarEquipos(): boolean {
    return this.keycloakService.canEditEquipos();
  }

  get puedeEliminarEquipos(): boolean {
    return this.keycloakService.canDeleteEquipos();
  }

  get puedeVerEquipos(): boolean {
    return this.keycloakService.canAccessEquipos();
  }

  get usuarioInfo() {
    return this.keycloakService.getUserInfo();
  }

  // Método helper para construir URLs de imágenes del FTP
  construirUrlImagen(rutaImagen: string | File | null): string | null {
    if (!rutaImagen || typeof rutaImagen !== 'string') {
      return null;
    }

    // Si la ruta empieza con /imagenes/equipos/, extraer solo el nombre del archivo
    if (rutaImagen.startsWith('/imagenes/equipos/')) {
      const filename = rutaImagen.substring('/imagenes/equipos/'.length);
      return `${environment.apiUrl}/imagenes/view/${filename}`;
    } else if (rutaImagen.startsWith('http')) {
      // Si ya es una URL completa, usarla directamente
      return rutaImagen;
    } else {
      // Asumir que es solo el nombre del archivo
      return `${environment.apiUrl}/imagenes/view/${rutaImagen}`;
    }
  }

  ngOnInit() {
    this.cargarEquipos();
  }

  cargarEquipos() {
    this.equiposService.getEquipos(this.filtro).subscribe(data => this.equipos = data);
  }

  aplicarFiltro() {
    this.cargarEquipos();
  }

  limpiarFiltros() {
    this.filtro = { nombre: '', numeroSerie: '', marca: '', modelo: '', ubicacion: '', estado: '' };
    this.cargarEquipos();
  }

  abrirModalNuevoEquipo() {
    this.resetearFormulario();
    this.mostrarModalNuevoEquipo = true;
  }

  cerrarModalNuevoEquipo() {
    this.mostrarModalNuevoEquipo = false;
    this.resetearFormulario();
  }

  resetearFormulario() {
    this.nuevoEquipo = {
      numeroInventario: '',
      numeroSerie: '',
      nombre: '',
      codigoInacif: '',
      marca: '',
      modelo: '',
      ubicacion: '',
      magnitudMedicion: '',
      rangoCapacidad: '',
      manualFabricante: '',
      fotografia: null,
      softwareFirmware: '',
      condicionesOperacion: '',
      descripcion: '',
      estado: true,
      area: ''
    };
    this.previewUrl = null;
    this.errorImagen = null;
    this.mensaje = null;
    
    // Resetear el componente fileUpload
    if (this.fileUpload) {
      this.fileUpload.clear();
    }
  }

  registrarEquipo() {
    this.mensaje = null;
    this.errorImagen = null;
    
    if (this.nuevoEquipo.fotografia instanceof File) {
      // 🆕 USAR SISTEMA LOCAL DE IMÁGENES en lugar de FTP
      this.subirImagenLocal(this.nuevoEquipo.fotografia).then((nombreArchivo) => {
        this.nuevoEquipo.fotografia = nombreArchivo;
        this.guardarEquipo(this.nuevoEquipo);
      }).catch((error) => {
        // Resetear el componente fileUpload para permitir seleccionar otra imagen
        if (this.fileUpload) {
          this.fileUpload.clear();
        }
        
        // Limpiar la previsualización y el archivo del modelo
        this.previewUrl = null;
        this.nuevoEquipo.fotografia = null;
        
        if (error.status === 409) {
          this.errorImagen = 'Ya existe una imagen con ese nombre. Cambia el nombre o selecciona otra imagen.';
        } else {
          this.errorImagen = `Error al subir la imagen: ${error.message || 'Error desconocido'}`;
        }
      });
    } else {
      this.guardarEquipo(this.nuevoEquipo);
    }
  }

  guardarEquipo(equipo: Equipo) {
    this.equiposService.crearEquipo(equipo).subscribe({
      next: () => {
        this.mostrarModalNuevoEquipo = false;
        this.cargarEquipos();
        this.resetearFormulario();
        this.mensaje = 'Equipo registrado correctamente.';
        setTimeout(() => this.mensaje = null, 3500);
      },
      error: () => {
        this.mensaje = null;
        alert('Error al registrar el equipo');
      }
    });
  }

  editarEquipo(equipo: Equipo) {
    this.equipoEditando = { ...equipo };
    this.mostrarModalEditarEquipo = true;
    
    // Manejar la previsualización de la imagen existente
    this.previewUrlEdit = this.construirUrlImagen(equipo.fotografia);
    
    this.errorImagenEdit = null;
    this.mensaje = null;
  }

  cerrarModalEditarEquipo() {
    this.mostrarModalEditarEquipo = false;
    this.equipoEditando = null;
    this.previewUrlEdit = null;
    this.errorImagenEdit = null;
    this.mensaje = null;
    
    // Resetear el componente fileUpload de edición
    if (this.fileUploadEdit) {
      this.fileUploadEdit.clear();
    }
  }

  onFileSelectedEdit(event: any) {
    const file = event.files?.[0];
    if (this.equipoEditando) {
      this.equipoEditando.fotografia = file;
    }
    this.errorImagenEdit = null;
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrlEdit = e.target.result;
      };
      reader.onerror = (error) => {
        console.error('Error al leer archivo (edición):', error);
        this.previewUrlEdit = null;
      };
      reader.readAsDataURL(file);
    } else {
      this.previewUrlEdit = null;
    }
  }

  actualizarEquipo() {
    if (!this.equipoEditando) return;

    this.mensaje = null;
    this.errorImagenEdit = null;

    if (this.equipoEditando.fotografia instanceof File) {
      // 🆕 USAR SISTEMA LOCAL DE IMÁGENES en lugar de FTP para edición
      this.subirImagenLocal(this.equipoEditando.fotografia).then((nombreArchivo) => {
        this.equipoEditando!.fotografia = nombreArchivo;
        this.guardarCambiosEquipo();
      }).catch((error) => {
        // Resetear el componente fileUpload para permitir seleccionar otra imagen
        if (this.fileUploadEdit) {
          this.fileUploadEdit.clear();
        }
        
        // Limpiar la previsualización y el archivo del modelo
        this.previewUrlEdit = null;
        this.equipoEditando!.fotografia = null;
        
        if (error.status === 409) {
          this.errorImagenEdit = 'Ya existe una imagen con ese nombre. Cambia el nombre o selecciona otra imagen.';
        } else {
          this.errorImagenEdit = `Error al subir la imagen: ${error.message || 'Error desconocido'}`;
        }
      });
    } else {
      // Si no hay nueva imagen, solo actualizar los datos
      this.guardarCambiosEquipo();
    }
  }

  guardarCambiosEquipo() {
    if (!this.equipoEditando) return;

    this.equiposService.editarEquipo(this.equipoEditando).subscribe({
      next: () => {
        this.mostrarModalEditarEquipo = false;
        this.cargarEquipos();
        this.equipoEditando = null;
        this.previewUrlEdit = null;
        this.errorImagenEdit = null;
        
        // Resetear el componente fileUpload de edición
        if (this.fileUploadEdit) {
          this.fileUploadEdit.clear();
        }
        
        this.mensaje = 'Equipo actualizado correctamente.';
        setTimeout(() => this.mensaje = null, 3500);
      },
      error: () => {
        this.mensaje = null;
        alert('Error al actualizar el equipo');
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.files?.[0];
    this.nuevoEquipo.fotografia = file;
    this.errorImagen = null;
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.onerror = (error) => {
        console.error('Error al leer archivo:', error);
        this.previewUrl = null;
      };
      reader.readAsDataURL(file);
    } else {
      this.previewUrl = null;
    }
  }

  descargarFicha(equipo: Equipo) {
    // Aquí irá la lógica para generar y descargar el PDF
    // Por ahora solo muestra un mensaje
    alert('Funcionalidad de descarga de ficha en PDF próximamente.');
  }

  async eliminarSeleccionados() {
    if (!this.equiposSeleccionados.length) return;
    
    if (confirm(`¿Está seguro de eliminar ${this.equiposSeleccionados.length} equipo(s) seleccionado(s)?`)) {
      const equiposEliminados: string[] = [];
      const equiposFallidos: string[] = [];
      
      for (const equipo of this.equiposSeleccionados) {
        try {
          await this.equiposService.eliminarEquipo(equipo.idEquipo!).toPromise();
          equiposEliminados.push(`${equipo.nombre} (${equipo.numeroSerie || 'Sin serie'})`);
        } catch (error) {
          equiposFallidos.push(`${equipo.nombre} (${equipo.numeroSerie || 'Sin serie'})`);
        }
      }
      
      // Recargar la lista siempre, sin importar si hubo errores
      this.cargarEquipos();
      this.equiposSeleccionados = [];
      
      // Mostrar resultado detallado
      let mensaje = '';
      if (equiposEliminados.length > 0) {
        mensaje += `✅ Equipos eliminados exitosamente (${equiposEliminados.length}):\n`;
        mensaje += equiposEliminados.map(eq => `• ${eq}`).join('\n');
      }
      
      if (equiposFallidos.length > 0) {
        if (mensaje) mensaje += '\n\n';
        mensaje += `❌ Equipos que no se pudieron eliminar (${equiposFallidos.length}):\n`;
        mensaje += equiposFallidos.map(eq => `• ${eq}`).join('\n');
        mensaje += '\n\nPosibles causas: El equipo tiene registros relacionados o no existe.';
      }
      
      if (mensaje) {
        alert(mensaje);
      }
      
      if (equiposFallidos.length === 0) {
        this.mensaje = `${equiposEliminados.length} equipo(s) eliminado(s) correctamente.`;
        setTimeout(() => this.mensaje = null, 3500);
      }
    }
  }

  // 🆕 MÉTODO PARA SUBIR IMÁGENES AL SISTEMA LOCAL
  private subirImagenLocal(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      console.log('📸 Subiendo imagen al sistema local:', file.name);
      
      const headers = {
        'Content-Type': 'application/octet-stream',
        'X-Filename': file.name
      };
      
      this.http.post(`${environment.apiUrl}/imagenes/upload`, file, { 
        headers: headers,
        responseType: 'text'
      }).subscribe({
        next: (response) => {
          console.log('✅ Imagen subida exitosamente:', response);
          try {
            const jsonResponse = JSON.parse(response);
            resolve(jsonResponse.fileName); // Devolver solo el nombre del archivo
          } catch (e) {
            // Si no es JSON válido, asumir que es el nombre del archivo directamente
            resolve(response);
          }
        },
        error: (error) => {
          console.error('❌ Error al subir imagen:', error);
          reject(error);
        }
      });
    });
  }
}

