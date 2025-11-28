import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Equipo } from '../api/equipos';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor() { }

  async generarFichaTecnica(equipo: Equipo): Promise<void> {
    try {
      console.log('📄 Generando ficha técnica para:', equipo.nombre);

      // Cargar la plantilla desde assets
      const response = await fetch('assets/plantillas/FOR-DG-GAC-029.xlsx');
      const arrayBuffer = await response.arrayBuffer();

      // Crear workbook desde la plantilla
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);

      // Obtener la primera hoja
      const worksheet = workbook.getWorksheet(1);

      if (!worksheet) {
        throw new Error('No se pudo cargar la hoja de trabajo');
      }

      // Rellenar los datos del equipo según la plantilla
      // Columna G (G8-G18): Datos principales del equipo
      worksheet.getCell('G8').value = equipo.nombre || '';                    // Nombre del equipo
      worksheet.getCell('G9').value = equipo.codigoInacif || '';             // Código del INACIF
      worksheet.getCell('G10').value = equipo.marca || '';                   // Marca
      worksheet.getCell('G11').value = equipo.modelo || '';                  // Modelo
      worksheet.getCell('G12').value = equipo.numeroSerie || '';             // No. de serie
      worksheet.getCell('G13').value = equipo.ubicacion || '';               // Ubicación
      worksheet.getCell('G14').value = equipo.magnitudMedicion || '';        // Magnitud de medición
      worksheet.getCell('G15').value = equipo.rangoCapacidad || '';          // Rango o capacidad
      worksheet.getCell('G16').value = equipo.manualFabricante || '';        // Código y nombre del manual
      worksheet.getCell('G18').value = equipo.softwareFirmware || '';        // Software/Firmware
      
      // Área/Laboratorio (si existe campo en la plantilla, agrégalo)
      // worksheet.getCell('G19').value = equipo.areaNombre || '';           // Descomentar si hay campo para área
      
      // Condiciones de operación (área combinada G20)
      worksheet.getCell('G20').value = equipo.condicionesOperacion || '';    // Condiciones de operación
      
      // Descripción del equipo (área combinada A19:D21)
      worksheet.getCell('A19').value = equipo.descripcion || '';             // Descripción del equipo

      // Insertar fotografía del equipo si existe
      if (equipo.fotografia && typeof equipo.fotografia === 'string') {
        try {
          // Construir la URL completa de la imagen usando environment
          const imageUrl = `${environment.apiUrl}/imagenes/view/${equipo.fotografia}`;
          
          // Descargar la imagen
          const imageResponse = await fetch(imageUrl);
          if (imageResponse.ok) {
            const imageBuffer = await imageResponse.arrayBuffer();
            
            // Determinar la extensión de la imagen
            const extension = equipo.fotografia.toLowerCase().endsWith('.png') ? 'png' : 'jpeg';
            
            // Agregar la imagen al workbook
            const imageId = workbook.addImage({
              buffer: imageBuffer,
              extension: extension
            });
            
            // Insertar la imagen en el área A8:D16 (fotografía)
            // Usando la notación simplificada de ExcelJS
            worksheet.addImage(imageId, 'A8:D16');
            
            console.log('✅ Imagen insertada en el Excel');
          } else {
            console.warn('⚠️ No se pudo cargar la imagen del equipo');
          }
        } catch (error) {
          console.error('❌ Error al insertar imagen:', error);
          // No fallar si la imagen no se puede cargar
        }
      }

      // Generar el archivo Excel
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });

      // Descargar el archivo
      const nombreArchivo = `Ficha_Tecnica_${equipo.codigoInacif || equipo.nombre}_${new Date().getTime()}.xlsx`;
      saveAs(blob, nombreArchivo);

      console.log('✅ Ficha técnica generada:', nombreArchivo);

    } catch (error) {
      console.error('❌ Error al generar ficha técnica:', error);
      throw error;
    }
  }

  /**
   * Método auxiliar para formatear fechas
   */
  private formatearFecha(fecha: Date | string | undefined): string {
    if (!fecha) return '';
    const date = fecha instanceof Date ? fecha : new Date(fecha);
    return date.toLocaleDateString('es-GT', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  }
}
