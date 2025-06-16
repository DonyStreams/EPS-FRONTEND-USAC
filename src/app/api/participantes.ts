export interface Participantes {
    id_empresa?: number;         // Autoincremental, por lo que puede ser opcional
    razon_social: string;        // No puede ser nulo
    nit: string;                 // Único y requerido
    direccion?: string;          // Opcional
    telefono?: string;           // Opcional
    estado?: boolean;            // Booleano, por defecto true
    fecha_creacion?: string;     // Timestamp con formato ISO
}
