import { Component, OnInit } from '@angular/core';
import { EquiposService } from '../../../service/equipos.service';

interface EstadoOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-equipos-list',
  templateUrl: './equipos-list.component.html'
})
export class EquiposListComponent implements OnInit {
  equipos: any[] = [];
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

  nuevoEquipo = {
    nombre: '',
    codigoInacif: '',
    marca: '',
    modelo: '',
    serie: '',
    ubicacion: '',
    magnitud: '',
    rango: '',
    manual: '',
    software: '',
    condiciones: '',
    descripcion: '',
    fotografia: null // archivo
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
    // Aquí va la lógica para guardar el equipo (llamada a servicio)
    // Luego de guardar:
    this.mostrarModalNuevoEquipo = false;
    this.cargarEquipos();
    // Limpia el formulario si lo deseas
    this.nuevoEquipo = { nombre: '', codigoInacif: '', marca: '', modelo: '', serie: '', ubicacion: '', magnitud: '', rango: '', manual: '', software: '', condiciones: '', descripcion: '', fotografia: null };
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
}

