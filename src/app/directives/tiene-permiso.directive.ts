import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { KeycloakService } from '../service/keycloak.service';

/**
 * Tipos de permisos disponibles en el sistema
 */
export type PermisoTipo = 'ver' | 'crear' | 'editar' | 'eliminar' | 'ejecutar' | 'aprobar' | 'exportar' | 'configurar';

/**
 * Módulos del sistema
 */
export type ModuloTipo = 'equipos' | 'categorias' | 'mantenimientos' | 'programaciones' | 'ejecuciones' | 
                         'tickets' | 'contratos' | 'proveedores' | 'areas' | 'usuarios' | 'reportes' | 'notificaciones';

/**
 * Configuración de permiso
 */
interface PermisoConfig {
    modulo: ModuloTipo;
    accion: PermisoTipo;
}

/**
 * Matriz de permisos por módulo y acción
 * Define qué roles tienen acceso a cada acción en cada módulo
 */
const MATRIZ_PERMISOS: Record<ModuloTipo, Record<PermisoTipo, string[]>> = {
    equipos: {
        ver: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'TECNICO_EQUIPOS', 'USER'],
        crear: ['ADMIN', 'SUPERVISOR', 'TECNICO_EQUIPOS'],
        editar: ['ADMIN', 'SUPERVISOR', 'TECNICO_EQUIPOS'],
        eliminar: ['ADMIN'],
        ejecutar: [],
        aprobar: [],
        exportar: ['ADMIN', 'SUPERVISOR'],
        configurar: ['ADMIN']
    },
    categorias: {
        ver: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'TECNICO_EQUIPOS', 'USER'],
        crear: ['ADMIN', 'SUPERVISOR'],
        editar: ['ADMIN', 'SUPERVISOR'],
        eliminar: ['ADMIN'],
        ejecutar: [],
        aprobar: [],
        exportar: ['ADMIN', 'SUPERVISOR'],
        configurar: ['ADMIN']
    },
    mantenimientos: {
        ver: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'USER'],
        crear: ['ADMIN', 'SUPERVISOR'],
        editar: ['ADMIN', 'SUPERVISOR'],
        eliminar: ['ADMIN'],
        ejecutar: ['ADMIN', 'SUPERVISOR', 'TECNICO'],
        aprobar: ['ADMIN', 'SUPERVISOR'],
        exportar: ['ADMIN', 'SUPERVISOR'],
        configurar: ['ADMIN', 'SUPERVISOR']
    },
    programaciones: {
        ver: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'USER'],
        crear: ['ADMIN', 'SUPERVISOR'],
        editar: ['ADMIN', 'SUPERVISOR'],
        eliminar: ['ADMIN'],
        ejecutar: [],
        aprobar: ['ADMIN', 'SUPERVISOR'],
        exportar: ['ADMIN', 'SUPERVISOR'],
        configurar: ['ADMIN', 'SUPERVISOR']
    },
    ejecuciones: {
        ver: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'USER'],
        crear: ['ADMIN', 'SUPERVISOR', 'TECNICO'],
        editar: ['ADMIN', 'SUPERVISOR', 'TECNICO'],
        eliminar: ['ADMIN'],
        ejecutar: ['ADMIN', 'SUPERVISOR', 'TECNICO'],
        aprobar: ['ADMIN', 'SUPERVISOR'],
        exportar: ['ADMIN', 'SUPERVISOR'],
        configurar: []
    },
    tickets: {
        ver: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'TECNICO_EQUIPOS', 'USER'],
        crear: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'TECNICO_EQUIPOS', 'USER'],
        editar: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'TECNICO_EQUIPOS'],
        eliminar: ['ADMIN'],
        ejecutar: ['ADMIN', 'SUPERVISOR', 'TECNICO'],  // Resolver ticket
        aprobar: ['ADMIN', 'SUPERVISOR'],  // Cerrar ticket
        exportar: ['ADMIN', 'SUPERVISOR'],
        configurar: ['ADMIN']
    },
    contratos: {
        ver: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'USER'],
        crear: ['ADMIN', 'SUPERVISOR'],
        editar: ['ADMIN', 'SUPERVISOR'],
        eliminar: ['ADMIN'],
        ejecutar: [],
        aprobar: [],
        exportar: ['ADMIN', 'SUPERVISOR'],
        configurar: ['ADMIN']
    },
    proveedores: {
        ver: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'USER'],
        crear: ['ADMIN', 'SUPERVISOR'],
        editar: ['ADMIN', 'SUPERVISOR'],
        eliminar: ['ADMIN'],
        ejecutar: [],
        aprobar: [],
        exportar: ['ADMIN', 'SUPERVISOR'],
        configurar: ['ADMIN']
    },
    areas: {
        ver: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'TECNICO_EQUIPOS', 'USER'],
        crear: ['ADMIN', 'SUPERVISOR'],
        editar: ['ADMIN', 'SUPERVISOR'],
        eliminar: ['ADMIN'],
        ejecutar: [],
        aprobar: [],
        exportar: ['ADMIN', 'SUPERVISOR'],
        configurar: ['ADMIN']
    },
    usuarios: {
        ver: ['ADMIN'],
        crear: ['ADMIN'],  // Los usuarios se crean desde Keycloak
        editar: ['ADMIN'],
        eliminar: ['ADMIN'],
        ejecutar: [],
        aprobar: [],
        exportar: ['ADMIN'],
        configurar: ['ADMIN']
    },
    reportes: {
        ver: ['ADMIN', 'SUPERVISOR'],
        crear: [],
        editar: [],
        eliminar: [],
        ejecutar: [],
        aprobar: [],
        exportar: ['ADMIN', 'SUPERVISOR'],
        configurar: ['ADMIN']
    },
    notificaciones: {
        ver: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'TECNICO_EQUIPOS', 'USER'],
        crear: ['ADMIN', 'SUPERVISOR'],
        editar: ['ADMIN', 'SUPERVISOR'],
        eliminar: ['ADMIN'],
        ejecutar: ['ADMIN', 'SUPERVISOR'],
        aprobar: [],
        exportar: [],
        configurar: ['ADMIN', 'SUPERVISOR']
    }
};

/**
 * Directiva estructural para mostrar/ocultar elementos según permisos granulares
 * 
 * Uso básico:
 * <button *tienePermiso="{ modulo: 'equipos', accion: 'crear' }">Nuevo Equipo</button>
 * 
 * Uso con else:
 * <button *tienePermiso="{ modulo: 'equipos', accion: 'eliminar' }; else sinPermiso">Eliminar</button>
 * <ng-template #sinPermiso><span>Sin permisos</span></ng-template>
 */
@Directive({
    selector: '[tienePermiso]'
})
export class TienePermisoDirective implements OnInit {
    private permiso: PermisoConfig | null = null;
    private elseTemplate: TemplateRef<any> | null = null;
    private hasView = false;

    @Input() set tienePermiso(config: PermisoConfig) {
        this.permiso = config;
        this.updateView();
    }

    @Input() set tienePermisoElse(template: TemplateRef<any>) {
        this.elseTemplate = template;
        this.updateView();
    }

    constructor(
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef,
        private keycloakService: KeycloakService
    ) {}

    ngOnInit() {
        this.updateView();
    }

    private updateView() {
        const tieneAcceso = this.verificarPermiso();
        
        if (tieneAcceso && !this.hasView) {
            this.viewContainer.clear();
            this.viewContainer.createEmbeddedView(this.templateRef);
            this.hasView = true;
        } else if (!tieneAcceso) {
            this.viewContainer.clear();
            if (this.elseTemplate) {
                this.viewContainer.createEmbeddedView(this.elseTemplate);
            }
            this.hasView = false;
        }
    }

    private verificarPermiso(): boolean {
        if (!this.permiso) {
            return true;
        }

        const { modulo, accion } = this.permiso;
        
        // Obtener roles permitidos para esta acción en este módulo
        const moduloPermisos = MATRIZ_PERMISOS[modulo];
        if (!moduloPermisos) {
            return false;
        }

        const rolesPermitidos = moduloPermisos[accion];
        if (!rolesPermitidos || rolesPermitidos.length === 0) {
            return false;
        }

        // Verificar si el usuario tiene alguno de los roles permitidos
        return this.keycloakService.hasAnyRole(rolesPermitidos);
    }
}

/**
 * Servicio helper para verificar permisos programáticamente
 * Útil cuando se necesita verificar permisos en código TypeScript
 */
export class PermisosHelper {
    static tienePermiso(keycloakService: KeycloakService, modulo: ModuloTipo, accion: PermisoTipo): boolean {
        const moduloPermisos = MATRIZ_PERMISOS[modulo];
        if (!moduloPermisos) return false;
        
        const rolesPermitidos = moduloPermisos[accion];
        if (!rolesPermitidos || rolesPermitidos.length === 0) return false;
        
        return keycloakService.hasAnyRole(rolesPermitidos);
    }

    static getPermisosModulo(keycloakService: KeycloakService, modulo: ModuloTipo): Record<PermisoTipo, boolean> {
        const permisos: Record<PermisoTipo, boolean> = {
            ver: false,
            crear: false,
            editar: false,
            eliminar: false,
            ejecutar: false,
            aprobar: false,
            exportar: false,
            configurar: false
        };

        const acciones: PermisoTipo[] = ['ver', 'crear', 'editar', 'eliminar', 'ejecutar', 'aprobar', 'exportar', 'configurar'];
        
        acciones.forEach(accion => {
            permisos[accion] = this.tienePermiso(keycloakService, modulo, accion);
        });

        return permisos;
    }
}
