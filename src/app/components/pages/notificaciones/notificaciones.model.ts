/**
 * Interfaces para el módulo de Notificaciones
 */

export interface Notificacion {
    idNotificacion: number;
    tipoNotificacion: string;
    titulo: string;
    mensaje: string;
    entidadRelacionada: string;
    entidadId: number;
    prioridad: string;
    leida: boolean;
    fechaCreacion: string;
    fechaLectura: string | null;
}

export interface Contadores {
    total: number;
    criticas: number;
    alertas: number;
    informativas: number;
}

export interface EstadoScheduler {
    habilitado: boolean;
    horaEjecucion: number;
    minutoEjecucion: number;
    horaProgramada: string;
    ultimaEjecucion: string;
    ultimoResultado: string;
    horaActual: string;
}

export interface ConfiguracionAlerta {
    idConfiguracion: number;
    nombre: string;
    descripcion: string;
    tipoAlerta: string;
    diasAnticipacion: number;
    activa: boolean;
}
