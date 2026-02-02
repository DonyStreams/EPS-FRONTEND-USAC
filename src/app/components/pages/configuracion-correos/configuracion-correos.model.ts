export interface ConfiguracionCorreo {
    tipoAlerta: string;
    nombre: string;
    descripcion: string;
    correos: string;
    idConfiguracion?: number | null;
}
