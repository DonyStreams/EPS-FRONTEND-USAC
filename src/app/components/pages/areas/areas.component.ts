import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { AreasService, Area } from 'src/app/service/areas.service';

@Component({
  templateUrl: './areas.component.html',
  providers: [MessageService]
})
export class AreasComponent implements OnInit {

  areas: Area[] = [];
  area: Area = { nombre: '', tipoArea: 'OPERATIVA', estado: true };
  selectedAreas: Area[] = [];
  areaDialog: boolean = false;
  deleteAreaDialog: boolean = false;
  deleteAreasDialog: boolean = false;
  submitted: boolean = false;
  cols: any[] = [];

  constructor(
    private areasService: AreasService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.loadAreas();
    
    this.cols = [
      { field: 'idArea', header: 'ID' },
      { field: 'codigoArea', header: 'Código' },
      { field: 'nombre', header: 'Nombre' },
      { field: 'tipoArea', header: 'Tipo' },
      { field: 'estado', header: 'Estado' }
    ];
  }

  loadAreas() {
    this.areasService.getAll().subscribe({
      next: (data) => {
        this.areas = data;
        console.log('Areas cargadas:', data);
      },
      error: (error) => {
        console.error('Error al cargar areas:', error);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'No se pudieron cargar las areas' 
        });
      }
    });
  }

  openNew() {
    this.area = { nombre: '', tipoArea: 'OPERATIVA', estado: true };
    this.submitted = false;
    this.areaDialog = true;
  }

  deleteSelectedAreas() {
    this.deleteAreasDialog = true;
  }

  editArea(area: Area) {
    this.area = { ...area };
    this.areaDialog = true;
  }

  deleteArea(area: Area) {
    this.deleteAreaDialog = true;
    this.area = { ...area };
  }

  confirmDeleteSelected() {
    this.deleteAreasDialog = false;
    const deletePromises = this.selectedAreas
      .filter(area => area.idArea)
      .map(area => this.areasService.delete(area.idArea!).toPromise());

    Promise.all(deletePromises).then(() => {
      this.areas = this.areas.filter(val => !this.selectedAreas.includes(val));
      this.selectedAreas = [];
      this.messageService.add({ 
        severity: 'success', 
        summary: 'Exitoso', 
        detail: 'Areas eliminadas', 
        life: 3000 
      });
    }).catch(error => {
      console.error('Error al eliminar areas:', error);
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'No se pudieron eliminar algunas areas' 
      });
    });
  }

  confirmDelete() {
    this.deleteAreaDialog = false;
    if (this.area.idArea) {
      this.areasService.delete(this.area.idArea).subscribe({
        next: () => {
          this.areas = this.areas.filter(val => val.idArea !== this.area.idArea);
          this.area = { nombre: '', tipoArea: 'OPERATIVA', estado: true };
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Exitoso', 
            detail: 'Area eliminada', 
            life: 3000 
          });
        },
        error: (error) => {
          console.error('Error al eliminar area:', error);
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'No se pudo eliminar el area' 
          });
        }
      });
    }
  }

  hideDialog() {
    this.areaDialog = false;
    this.submitted = false;
  }

  saveArea() {
    this.submitted = true;

    if (this.area.nombre?.trim()) {
      if (this.area.idArea) {
        // Actualizar area existente
        this.areasService.update(this.area.idArea, this.area).subscribe({
          next: (updatedArea) => {
            const index = this.areas.findIndex(a => a.idArea === this.area.idArea);
            if (index > -1) {
              this.areas[index] = updatedArea;
            }
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Exitoso', 
              detail: 'Area actualizada', 
              life: 3000 
            });
            this.areaDialog = false;
            this.area = { nombre: '', tipoArea: 'OPERATIVA', estado: true };
          },
          error: (error) => {
            console.error('Error al actualizar area:', error);
            this.messageService.add({ 
              severity: 'error', 
              summary: 'Error', 
              detail: 'No se pudo actualizar el area' 
            });
          }
        });
      } else {
        // Crear nueva area
        this.areasService.create(this.area).subscribe({
          next: (newArea) => {
            this.areas.push(newArea);
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Exitoso', 
              detail: 'Area creada', 
              life: 3000 
            });
            this.areaDialog = false;
            this.area = { nombre: '', tipoArea: 'OPERATIVA', estado: true };
          },
          error: (error) => {
            console.error('Error al crear area:', error);
            this.messageService.add({ 
              severity: 'error', 
              summary: 'Error', 
              detail: 'No se pudo crear el area' 
            });
          }
        });
      }
    }
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
