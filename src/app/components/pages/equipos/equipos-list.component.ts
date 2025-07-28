import { Component, OnInit } from '@angular/core';
import { EquiposService } from '../../../service/equipos.service';
import { FtpService } from '../../../service/ftp.service';
import { Equipo } from '../../../api/equipos';

interface EstadoOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-equipos-list',
  templateUrl: './equipos-list.component.html'
})
export class EquiposListComponent implements OnInit {
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

  mostrarModalEditarEquipo = false;
  equipoEditando: Equipo | null = null;

  constructor(private equiposService: EquiposService, private ftpService: FtpService) {}

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

  registrarEquipo() {
    this.mensaje = null;
    this.errorImagen = null;
    if (this.nuevoEquipo.fotografia instanceof File) {
      this.ftpService.subirArchivo(this.nuevoEquipo.fotografia).subscribe({
        next: (resp) => {
          let ruta = '';
          try {
            ruta = JSON.parse(resp).ruta;
          } catch {
            ruta = resp;
          }
          this.nuevoEquipo.fotografia = ruta;
          this.guardarEquipo(this.nuevoEquipo);
        },
        error: (err) => {
          if (err.status === 409) {
            this.errorImagen = 'Ya existe una imagen con ese nombre. Cambia el nombre o selecciona otra imagen.';
          } else {
            this.errorImagen = 'Error al subir la imagen al servidor FTP.';
          }
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
    this.previewUrl = typeof equipo.fotografia === 'string' ? equipo.fotografia : null;
  }

  guardarEdicionEquipo() {
    if (this.equipoEditando?.fotografia instanceof File) {
      this.ftpService.subirArchivo(this.equipoEditando.fotografia).subscribe({
        next: (url) => {
          this.equipoEditando!.fotografia = url;
          this.actualizarEquipo(this.equipoEditando!);
        },
        error: () => {
          alert('Error al subir la imagen al servidor FTP');
        }
      });
    } else {
      this.actualizarEquipo(this.equipoEditando!);
    }
  }

  actualizarEquipo(equipo: Equipo) {
    // Aquí deberías llamar a un método de edición en el servicio (debes implementarlo)
    // this.equiposService.editarEquipo(equipo).subscribe(...)
    this.mostrarModalEditarEquipo = false;
    this.cargarEquipos();
    this.equipoEditando = null;
    this.previewUrl = null;
  }

  onFileSelected(event: any) {
    const file = event.files?.[0];
    this.nuevoEquipo.fotografia = file;
    this.errorImagen = null;
    if (file) {
      const reader = new FileReader();
      reader.onload = e => this.previewUrl = typeof reader.result === 'string' ? reader.result : null;
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

  eliminarSeleccionados() {
    if (!this.equiposSeleccionados.length) return;
    if (confirm('¿Está seguro de eliminar los equipos seleccionados?')) {
      const eliminaciones = this.equiposSeleccionados.map(equipo =>
        this.equiposService.eliminarEquipo(equipo.idEquipo!).toPromise()
      );
      Promise.all(eliminaciones).then(() => {
        this.cargarEquipos();
        this.equiposSeleccionados = [];
      }).catch(() => {
        alert('Ocurrió un error al eliminar uno o más equipos.');
      });
    }
  }
}

