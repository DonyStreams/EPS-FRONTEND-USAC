import { Component, OnInit } from '@angular/core';
import { EquiposService } from '../../../service/equipos.service';
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
    area: '',
    estado: '',
    inventario: '',
    serie: ''
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

  previewUrl: string | ArrayBuffer | null = null;

  constructor(private equiposService: EquiposService) {}

  ngOnInit() {
    this.cargarEquipos();
  }

  cargarEquipos() {
    this.equiposService.getEquipos(this.filtro).subscribe(data => this.equipos = data);
  }

  limpiarFiltros() {
    this.filtro = { area: '', estado: '', inventario: '', serie: '' };
    this.cargarEquipos();
  }

  registrarEquipo() {
    this.equiposService.crearEquipo(this.nuevoEquipo).subscribe({
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
      },
      error: (err) => {
        // Aquí puedes mostrar un mensaje de error
        alert('Error al registrar el equipo');
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.files?.[0];
    this.nuevoEquipo.fotografia = file;
    if (file) {
      const reader = new FileReader();
      reader.onload = e => this.previewUrl = reader.result;
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

