import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { EquiposService } from '../../../service/equipos.service';
import { KeycloakService } from '../../../service/keycloak.service';
import { ExcelService } from '../../../service/excel.service';
import { AreasService, Area } from '../../../service/areas.service';
import { CategoriasEquipoService, CategoriaEquipo } from '../../../service/categorias-equipo.service';
import { Equipo } from '../../../api/equipos';
import { FileUpload } from 'primeng/fileupload';
import { Menu } from 'primeng/menu';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { MessageService, MenuItem } from 'primeng/api';

interface EstadoOption {
  label: string;
  value: string;
  icon?: string;
  severity?: string;
}

@Component({
  selector: 'app-equipos-list',
  templateUrl: './equipos-list.component.html'
})
export class EquiposListComponent implements OnInit {
  @ViewChild('fileUpload') fileUpload!: FileUpload;
  @ViewChild('fileUploadEdit') fileUploadEdit!: FileUpload;
  @ViewChild('formEquipo') formEquipo: any;
  @ViewChild('formEditarEquipo') formEditarEquipo: any;
  @ViewChild('menuAcciones') menuAcciones!: Menu;
  
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
    { label: 'Inactivo', value: 'Inactivo' },
    { label: 'Crítico', value: 'Critico' }
  ];

  // Opciones de estado para los formularios de crear/editar
  estadosFormulario: EstadoOption[] = [
    { label: 'Activo', value: 'Activo', icon: 'pi pi-check-circle', severity: 'success' },
    { label: 'Inactivo', value: 'Inactivo', icon: 'pi pi-minus-circle', severity: 'secondary' },
    { label: 'Crítico', value: 'Critico', icon: 'pi pi-exclamation-triangle', severity: 'danger' }
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
    estado: 'Activo',
    idArea: undefined,
    idCategoria: undefined
  };

  areas: Area[] = [];
  categorias: CategoriaEquipo[] = [];

  previewUrl: string | null = null;
  mensaje: string | null = null;
  errorImagen: string | null = null;

  // Variables para el modal de edición
  previewUrlEdit: string | null = null;
  errorImagenEdit: string | null = null;

  mostrarModalEditarEquipo = false;
  equipoEditando: Equipo | null = null;
  
  // Variable para el menú de acciones
  equipoSeleccionadoMenu: Equipo | null = null;
  menuItemsAcciones: MenuItem[] = [];
  
  // Variable para detectar cambio a estado crítico
  estadoAnteriorEquipo: string | null = null;

  constructor(
    private equiposService: EquiposService, 
    private keycloakService: KeycloakService,
    private http: HttpClient,
    private messageService: MessageService,
    private router: Router,
    private excelService: ExcelService,
    private areasService: AreasService,
    private categoriasService: CategoriasEquipoService
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

  // Métodos para conteo por estado
  get equiposActivos(): number {
    return this.equipos?.filter(e => e.estado === 'Activo').length || 0;
  }

  get equiposInactivos(): number {
    return this.equipos?.filter(e => e.estado === 'Inactivo').length || 0;
  }

  get equiposCriticos(): number {
    return this.equipos?.filter(e => e.estado === 'Critico').length || 0;
  }

  // Método helper para obtener clase de severidad según estado
  getSeveridadEstado(estado: string): string {
    switch (estado) {
      case 'Activo': return 'success';
      case 'Inactivo': return 'secondary';
      case 'Critico': return 'danger';
      default: return 'info';
    }
  }

  // Método helper para obtener icono según estado
  getIconoEstado(estado: string): string {
    switch (estado) {
      case 'Activo': return 'pi pi-check-circle';
      case 'Inactivo': return 'pi pi-minus-circle';
      case 'Critico': return 'pi pi-exclamation-triangle';
      default: return 'pi pi-question-circle';
    }
  }

  // Método para generar los items del menú de acciones
  getMenuItems(equipo: Equipo): MenuItem[] {
    return [
      {
        label: 'Editar equipo',
        icon: 'pi pi-pencil',
        command: () => this.editarEquipo(equipo),
        visible: this.puedeEditarEquipos
      },
      {
        label: 'Historial de cambios',
        icon: 'pi pi-history',
        command: () => this.verHistorial(equipo)
      },
      {
        label: 'Programaciones',
        icon: 'pi pi-wrench',
        command: () => this.verMantenimientos(equipo)
      },
      {
        label: 'Descargar ficha técnica',
        icon: 'pi pi-download',
        command: () => this.descargarFicha(equipo)
      },
      { separator: true },
      {
        label: 'Eliminar equipo',
        icon: 'pi pi-trash',
        styleClass: 'text-red-500',
        command: () => this.eliminarEquipo(equipo),
        visible: this.puedeEliminarEquipos
      }
    ];
  }

  // Método para abrir el menú de acciones
  abrirMenuAcciones(event: Event, equipo: Equipo) {
    this.equipoSeleccionadoMenu = equipo;
    this.menuItemsAcciones = this.getMenuItems(equipo);
    this.menuAcciones.toggle(event);
  }

  // Método helper para construir URLs de imágenes (sistema local)
  construirUrlImagen(rutaImagen: string | File | null): string | null {
    if (!rutaImagen || typeof rutaImagen !== 'string') {
      return null;
    }

    // Limpiar la ruta para obtener solo el nombre del archivo
    let filename = rutaImagen;
    
    // Si la ruta empieza con /imagenes/equipos/, extraer solo el nombre del archivo
    if (rutaImagen.startsWith('/imagenes/equipos/')) {
      filename = rutaImagen.substring('/imagenes/equipos/'.length);
    } else if (rutaImagen.includes('/')) {
      // Si tiene alguna otra ruta, tomar solo el nombre del archivo
      filename = rutaImagen.substring(rutaImagen.lastIndexOf('/') + 1);
    }
    
    // Si ya es una URL completa, usarla directamente
    if (rutaImagen.startsWith('http')) {
      return rutaImagen;
    }
    
    // Codificar el nombre del archivo para URLs con caracteres especiales
    const encodedFilename = encodeURIComponent(filename);
    return `${environment.apiUrl}/imagenes/view/${encodedFilename}`;
  }

  ngOnInit() {
    this.cargarEquipos();
    this.cargarAreas();
    this.cargarCategorias();
  }

  cargarEquipos() {
    this.equiposService.getEquipos(this.filtro).subscribe(data => this.equipos = data);
  }

  cargarAreas() {
    // Usar el método getActivos() que ya filtra por áreas activas
    this.areasService.getActivos().subscribe({
      next: (areas) => {
        this.areas = areas;
      },
      error: (error) => {
        console.error('Error al cargar áreas:', error);
      }
    });
  }

  cargarCategorias() {
    this.categoriasService.getAll({ soloActivas: true }).subscribe({
      next: (categorias) => {
        this.categorias = categorias;
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
      }
    });
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
      estado: 'Activo',
      idArea: undefined,
      idCategoria: undefined
    };
    this.previewUrl = null;
    this.errorImagen = null;
    this.mensaje = null;
    
    // Resetear el componente fileUpload
    if (this.fileUpload) {
      this.fileUpload.clear();
    }
    
    // Resetear el estado del formulario para que no muestre errores de validación
    if (this.formEquipo) {
      this.formEquipo.resetForm();
    }
  }

  registrarEquipo() {
    this.mensaje = null;
    this.errorImagen = null;
    
    if (this.nuevoEquipo.fotografia instanceof File) {
      // Subir imagen al sistema local de almacenamiento
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
      error: (error) => {
        this.mensaje = null;
        if (error.status === 409) {
          // Error 409 = Conflict (código duplicado)
          alert('Error: Ya existe un equipo con ese código INACIF. Por favor, use un código diferente.');
        } else {
          alert('Error al registrar el equipo');
        }
      }
    });
  }

  editarEquipo(equipo: Equipo) {
    this.equipoEditando = { ...equipo };
    this.estadoAnteriorEquipo = equipo.estado || null; // Guardar estado anterior para detectar cambio a crítico
    this.mostrarModalEditarEquipo = true;
    
    // Manejar la previsualización de la imagen existente
    this.previewUrlEdit = this.construirUrlImagen(equipo.fotografia);
    
    this.errorImagenEdit = null;
    this.mensaje = null;
  }

  cerrarModalEditarEquipo() {
    // Primero ocultar el modal para evitar errores de ngModel al acceder a equipoEditando
    this.mostrarModalEditarEquipo = false;
    
    // Resetear otros estados primero
    this.previewUrlEdit = null;
    this.errorImagenEdit = null;
    this.mensaje = null;
    
    // Resetear el componente fileUpload de edición
    if (this.fileUploadEdit) {
      this.fileUploadEdit.clear();
    }
    
    // Usar setTimeout para limpiar equipoEditando después de que Angular procese el cierre del modal
    // NO llamar a resetForm() ya que dispara eventos ngModelChange que intentan escribir a equipoEditando
    // El *ngIf="equipoEditando" en el template destruirá el formulario automáticamente
    setTimeout(() => {
      this.equipoEditando = null;
    }, 0);
  }

  onFileSelectedEdit(event: any) {
    const file = event.files?.[0];
    
    // Validar tamaño del archivo (10MB = 10,485,760 bytes)
    const maxSize = 10485760; // 10MB
    if (file && file.size > maxSize) {
      this.errorImagenEdit = `El archivo es muy grande (${(file.size / 1048576).toFixed(2)} MB). El tamaño máximo permitido es 10 MB.`;
      this.previewUrlEdit = null;
      if (this.equipoEditando) {
        this.equipoEditando.fotografia = null;
      }
      
      // Limpiar el input
      if (event.currentTarget) {
        event.currentTarget.value = '';
      }
      
      // Limpiar el FileUpload para permitir seleccionar de nuevo
      if (this.fileUploadEdit) {
        this.fileUploadEdit.clear();
      }
      return;
    }
    
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
        this.errorImagenEdit = 'Error al cargar la vista previa de la imagen';
      };
      reader.readAsDataURL(file);
      
      // Limpiar el FileUpload para permitir seleccionar otra imagen después
      setTimeout(() => {
        if (this.fileUploadEdit) {
          this.fileUploadEdit.clear();
        }
      }, 100);
    } else {
      this.previewUrlEdit = null;
    }
  }

  actualizarEquipo() {
    if (!this.equipoEditando) return;

    this.mensaje = null;
    this.errorImagenEdit = null;

    if (this.equipoEditando.fotografia instanceof File) {
      // Subir imagen al sistema local de almacenamiento
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

    // Detectar si cambia a estado crítico
    const esCambioCritico = this.equipoEditando.estado === 'Critico' && this.estadoAnteriorEquipo !== 'Critico';

    this.equiposService.editarEquipo(this.equipoEditando).subscribe({
      next: () => {
        // Primero ocultar el modal
        this.mostrarModalEditarEquipo = false;
        this.cargarEquipos();
        
        // Limpiar estados de forma segura
        this.previewUrlEdit = null;
        this.errorImagenEdit = null;
        
        // Resetear el componente fileUpload de edición
        if (this.fileUploadEdit) {
          this.fileUploadEdit.clear();
        }
        
        // Usar setTimeout para limpiar equipoEditando después de que Angular procese el cierre
        setTimeout(() => {
          this.equipoEditando = null;
          this.estadoAnteriorEquipo = null;
        }, 0);
        
        // Mostrar notificación de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Equipo actualizado correctamente',
          life: 3000
        });
        
        // Mostrar mensaje adicional si se cambió a estado crítico
        if (esCambioCritico) {
          setTimeout(() => {
            this.messageService.add({
              severity: 'warn',
              summary: '📧 Notificación Enviada',
              detail: 'Se ha enviado un correo de alerta por estado CRÍTICO del equipo',
              life: 5000
            });
          }, 500);
        }
      },
      error: (error) => {
        console.error('Error al actualizar equipo:', error);
        if (error.status === 409) {
          // Error 409 = Conflict (código duplicado)
          this.messageService.add({
            severity: 'warn',
            summary: 'Código Duplicado',
            detail: 'Ya existe un equipo con ese código INACIF. Use un código diferente.',
            life: 5000
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el equipo',
            life: 3000
          });
        }
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.files?.[0];
    
    // Validar tamaño del archivo (10MB = 10,485,760 bytes)
    const maxSize = 10485760; // 10MB
    if (file && file.size > maxSize) {
      this.errorImagen = `El archivo es muy grande (${(file.size / 1048576).toFixed(2)} MB). El tamaño máximo permitido es 10 MB.`;
      this.previewUrl = null;
      this.nuevoEquipo.fotografia = null;
      
      // Limpiar el FileUpload para permitir seleccionar de nuevo
      if (this.fileUpload) {
        this.fileUpload.clear();
      }
      return;
    }
    
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
        this.errorImagen = 'Error al cargar la vista previa de la imagen';
      };
      reader.readAsDataURL(file);
      
      // Limpiar el FileUpload para permitir seleccionar otra imagen después
      setTimeout(() => {
        if (this.fileUpload) {
          this.fileUpload.clear();
        }
      }, 100);
    } else {
      this.previewUrl = null;
    }
  }

  limpiarImagen() {
    // Limpiar el FileUpload
    if (this.fileUpload) {
      this.fileUpload.clear();
    }
    
    // Limpiar variables
    this.previewUrl = null;
    this.nuevoEquipo.fotografia = null;
    this.errorImagen = null;
  }

  limpiarImagenEdit() {
    // Limpiar el FileUpload de edición
    if (this.fileUploadEdit) {
      this.fileUploadEdit.clear();
    }
    
    // Limpiar variables
    this.previewUrlEdit = null;
    if (this.equipoEditando) {
      this.equipoEditando.fotografia = null;
    }
    this.errorImagenEdit = null;
  }

  verHistorial(equipo: Equipo) {
    // Navegar al historial con el ID del equipo como parámetro de consulta
    this.router.navigate(['/administracion/equipos/historial'], { 
      queryParams: { equipoId: equipo.idEquipo, equipoNombre: equipo.nombre } 
    });
  }

  verMantenimientos(equipo: Equipo) {
    // Navegar a programaciones filtrado por equipo
    this.router.navigate(['/administracion/programaciones'], { 
      queryParams: { equipoId: equipo.idEquipo, equipoNombre: equipo.nombre } 
    });
  }

  async descargarFicha(equipo: Equipo) {
    try {
      await this.excelService.generarFichaTecnica(equipo);
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Ficha técnica descargada correctamente',
        life: 3000
      });
    } catch (error) {
      console.error('Error al generar ficha:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo generar la ficha técnica',
        life: 3000
      });
    }
  }

  async eliminarSeleccionados() {
    if (!this.equiposSeleccionados.length) return;
    
    if (confirm(`¿Está seguro de eliminar ${this.equiposSeleccionados.length} equipo(s) seleccionado(s)?`)) {
      const equiposEliminados: string[] = [];
      const equiposFallidos: {nombre: string, motivo: string}[] = [];
      
      for (const equipo of this.equiposSeleccionados) {
        try {
          await this.equiposService.eliminarEquipo(equipo.idEquipo!).toPromise();
          equiposEliminados.push(`${equipo.nombre} (${equipo.numeroSerie || 'Sin serie'})`);
        } catch (error: any) {
          let motivo = 'Error desconocido';
          if (error?.error?.error) {
            motivo = error.error.error;
          } else if (error?.message) {
            motivo = error.message;
          }
          equiposFallidos.push({
            nombre: `${equipo.nombre} (${equipo.numeroSerie || 'Sin serie'})`,
            motivo: motivo
          });
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
        mensaje += `❌ Equipos que no se pudieron eliminar (${equiposFallidos.length}):\n\n`;
        equiposFallidos.forEach(equipo => {
          mensaje += `• ${equipo.nombre}\n  Motivo: ${equipo.motivo}\n\n`;
        });
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

  async eliminarEquipo(equipo: any) {
    if (confirm(`¿Está seguro de eliminar el equipo "${equipo.nombre}"?`)) {
      try {
        await this.equiposService.eliminarEquipo(equipo.idEquipo!).toPromise();
        this.mensaje = `Equipo "${equipo.nombre}" eliminado correctamente.`;
        setTimeout(() => this.mensaje = null, 3500);
        this.cargarEquipos();
      } catch (error: any) {
        let motivo = 'Error desconocido';
        if (error?.error?.error) {
          motivo = error.error.error;
        } else if (error?.message) {
          motivo = error.message;
        }
        alert(`❌ No se pudo eliminar el equipo:\n\n${equipo.nombre}\n\nMotivo: ${motivo}`);
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

