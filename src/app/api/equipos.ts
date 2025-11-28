export interface Equipo {
    idEquipo?: number;
    numeroInventario?: string;
    numeroSerie?: string;
    nombre?: string;
    codigoInacif?: string;
    marca?: string;
    modelo?: string;
    ubicacion?: string;
    magnitudMedicion?: string;
    rangoCapacidad?: string;
    manualFabricante?: string;
    fotografia?: File | string | null;
    softwareFirmware?: string;
    condicionesOperacion?: string;
    descripcion?: string;
    estado?: boolean | string;
    idArea?: number;        // ID del área
    areaNombre?: string;    // Nombre del área (para mostrar)
}
