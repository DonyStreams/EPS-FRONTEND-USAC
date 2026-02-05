# 📖 Manual de Usuario - Sistema de Gestión de Mantenimientos INACIF

**Versión:** 2.2.0  
**Fecha:** Febrero 2026  
**Clasificación:** Manual para Usuarios Finales

---

## 📋 Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Inicio de Sesión](#2-inicio-de-sesión)
3. [Roles y Permisos](#3-roles-y-permisos)
4. [Dashboard](#4-dashboard)
5. [Gestión de Equipos](#5-gestión-de-equipos)
6. [Gestión de Mantenimientos](#6-gestión-de-mantenimientos)
7. [Sistema de Tickets](#7-sistema-de-tickets)
8. [Contratos y Proveedores](#8-contratos-y-proveedores)
9. [Administración](#9-administración)
10. [Notificaciones y Scheduler](#10-notificaciones-y-scheduler)
11. [Reportes](#11-reportes)
12. [Preguntas Frecuentes](#12-preguntas-frecuentes)

---

## 1. Introducción

### 1.1 ¿Qué es este Sistema?

El **Sistema de Gestión de Mantenimientos del INACIF** es una plataforma web diseñada para centralizar y controlar todas las actividades relacionadas con el mantenimiento de equipos de laboratorio. 

### 1.2 ¿Para qué sirve?

Este sistema permite:

| Función | Descripción |
|---------|-------------|
| **Control de Equipos** | Llevar un inventario detallado de todos los equipos del laboratorio, incluyendo sus especificaciones técnicas, ubicación y estado actual |
| **Programar Mantenimientos** | Crear calendarios de mantenimientos preventivos que se ejecutan automáticamente según la frecuencia definida |
| **Ejecutar y Documentar** | Registrar cada mantenimiento realizado con evidencias (fotos, documentos) y observaciones |
| **Reportar Fallas** | Crear tickets cuando un equipo presenta problemas, asignarlos a técnicos y dar seguimiento hasta su resolución |
| **Gestionar Contratos** | Controlar los contratos con proveedores externos que realizan mantenimientos o calibraciones |
| **Recibir Alertas** | El sistema avisa automáticamente cuando hay mantenimientos próximos a vencer, contratos por expirar o tickets críticos |

### 1.3 ¿Quién lo usa?

- **Supervisores de laboratorio** - Programan y aprueban mantenimientos
- **Técnicos de mantenimiento** - Ejecutan los trabajos y documentan
- **Técnicos de equipos** - Gestionan el inventario de equipos
- **Administradores** - Configuran el sistema y gestionan usuarios
- **Personal general** - Reportan fallas mediante tickets

---

## 2. Inicio de Sesión

### 2.1 Acceso al Sistema

1. Abre tu navegador (Chrome o Firefox recomendado)
2. Ingresa la URL del sistema proporcionada por tu administrador
3. Haz clic en **"Iniciar Sesión"**

### 2.2 Autenticación con Keycloak

El sistema utiliza **Keycloak** para la autenticación, lo que significa:

- ✅ **Una sola cuenta** para acceder a todas las aplicaciones institucionales
- ✅ **Sesiones seguras** con tokens que expiran automáticamente
- ✅ **Cambio de contraseña centralizado** desde el portal de Keycloak

**Para ingresar:**
1. Escribe tu **usuario institucional**
2. Escribe tu **contraseña**
3. Haz clic en **"Acceder"**

### 2.3 ¿Qué pasa si olvidé mi contraseña?

Contacta a tu administrador de sistemas o utiliza la opción "¿Olvidaste tu contraseña?" en la pantalla de Keycloak.

### 2.4 Cerrar Sesión

Siempre cierra sesión cuando termines:
1. Haz clic en tu **nombre** (esquina superior derecha)
2. Selecciona **"Cerrar Sesión"**

⚠️ **Importante:** En computadoras compartidas, siempre cierra sesión para proteger tu cuenta.

---

## 3. Roles y Permisos

El sistema tiene **5 roles**. Cada rol tiene permisos específicos según su función.

### 3.1 👑 ADMIN - Administrador del Sistema

**¿Quién tiene este rol?** Encargados de IT, Coordinadores de sistemas

**¿Qué puede hacer?**
- Acceso **completo** a todos los módulos
- **Eliminar** cualquier registro (equipos, contratos, tickets)
- Gestionar **usuarios** del sistema
- Configurar **correos automáticos**
- Ver todos los **reportes**
- Configurar el **scheduler** de alertas

---

### 3.2 📋 SUPERVISOR - Supervisor de Laboratorio

**¿Quién tiene este rol?** Jefes de laboratorio, Coordinadores de área

**¿Qué puede hacer?**
- Ver y gestionar **equipos** (crear, editar)
- **Programar mantenimientos** y definir frecuencias
- **Aprobar ejecuciones** de mantenimiento
- **Asignar tickets** a técnicos
- **Cerrar tickets** resueltos
- Ver **reportes** de su área
- Gestionar **contratos** y proveedores
- Administrar **áreas** del sistema

**¿Qué NO puede hacer?**
- ❌ Eliminar registros (para mantener trazabilidad)
- ❌ Gestionar usuarios
- ❌ Configurar correos automáticos

---

### 3.3 🔧 TECNICO - Técnico de Mantenimiento

**¿Quién tiene este rol?** Técnicos que ejecutan mantenimientos

**¿Qué puede hacer?**
- Ver **equipos** y su información técnica
- **Ejecutar mantenimientos** programados
- Cambiar estado de ejecuciones (Iniciar, Completar)
- **Resolver tickets** asignados
- Agregar **comentarios y evidencias**
- Ver **contratos** y proveedores (solo consulta)

**¿Qué NO puede hacer?**
- ❌ Crear o editar equipos
- ❌ Programar mantenimientos nuevos
- ❌ Asignar o cerrar tickets
- ❌ Ver reportes
- ❌ Acceder a Tipos de Mantenimiento

---

### 3.4 🖥️ TECNICO_EQUIPOS - Técnico de Equipos

**¿Quién tiene este rol?** Encargados de inventario

**¿Qué puede hacer?**
- **Crear y editar equipos** (gestión de inventario)
- Ver **categorías** de equipos
- **Crear tickets** de falla
- Ver el **historial** de cambios de equipos

**¿Qué NO puede hacer?**
- ❌ Acceder a **Mantenimientos** (programaciones, ejecuciones, calendario)
- ❌ Acceder a **Contratos** ni proveedores
- ❌ Resolver tickets
- ❌ Ver reportes

> 💡 **Nota:** Este rol está enfocado **únicamente** en la gestión del inventario de equipos, no en mantenimientos.

---

### 3.5 👁️ USER - Usuario de Solo Lectura

**¿Quién tiene este rol?** Personal administrativo, usuarios ocasionales

**¿Qué puede hacer?**
- Ver **equipos** (solo consulta)
- Ver **mantenimientos** programados y ejecuciones (solo consulta)
- **Crear tickets** para reportar fallas
- Ver sus **propios tickets** (los que creó)
- Recibir **notificaciones**

**¿Qué NO puede hacer?**
- ❌ Editar cualquier información
- ❌ Ejecutar mantenimientos
- ❌ Resolver tickets
- ❌ Ver reportes
- ❌ Acceder a administración

---

### 3.6 Tabla Resumen de Permisos

| Módulo | ADMIN | SUPERVISOR | TECNICO | TECNICO_EQUIPOS | USER |
|--------|:-----:|:----------:|:-------:|:---------------:|:----:|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Equipos - Ver | ✅ | ✅ | ✅ | ✅ | ✅ |
| Equipos - Crear/Editar | ✅ | ✅ | ❌ | ✅ | ❌ |
| Equipos - Eliminar | ✅ | ❌ | ❌ | ❌ | ❌ |
| Categorías | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Mantenimientos** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Programaciones** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Ejecuciones** | ✅ | ✅ | ✅ | ❌ | ✅ |
| Tipos Mantenimiento | ✅ | ✅ | ❌ | ❌ | ❌ |
| Tickets - Ver | ✅ | ✅ | ✅ | ✅ | ✅ |
| Tickets - Crear | ✅ | ✅ | ✅ | ✅ | ✅ |
| Tickets - Asignar | ✅ | ✅ | ❌ | ❌ | ❌ |
| Tickets - Resolver | ✅ | ✅ | ✅ | ❌ | ❌ |
| Tickets - Cerrar | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Contratos** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Proveedores** | ✅ | ✅ | ✅ | ❌ | ✅ |
| Áreas | ✅ | ✅ | ❌ | ❌ | ❌ |
| Usuarios | ✅ | ❌ | ❌ | ❌ | ❌ |
| Reportes | ✅ | ✅ | ❌ | ❌ | ❌ |
| Config. Correos | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 4. Dashboard

### 4.1 ¿Qué es el Dashboard?

El **Dashboard** es la página principal del sistema. Muestra un resumen visual de toda la información importante en tiempo real.

### 4.2 ¿Qué información muestra?

#### KPIs de Equipos
| Indicador | Significado |
|-----------|-------------|
| **Equipos Activos** | Equipos funcionando correctamente |
| **Equipos Críticos** | Equipos que requieren atención urgente |
| **Equipos Inactivos** | Equipos temporalmente fuera de servicio |

#### KPIs de Mantenimientos
| Indicador | Significado |
|-----------|-------------|
| **Total Programaciones** | Mantenimientos programados activos |
| **Vencidas** | Mantenimientos cuya fecha ya pasó sin ejecutarse |
| **Total Alertas** | Notificaciones pendientes de atención |

#### KPIs de Tickets
| Indicador | Significado |
|-----------|-------------|
| **Tickets Abiertos** | Tickets reportados sin resolver |
| **En Proceso** | Tickets siendo trabajados actualmente |
| **Tickets Críticos** | Tickets con prioridad "Crítica" |

#### KPIs de Contratos
| Indicador | Significado |
|-----------|-------------|
| **Contratos Activos** | Contratos vigentes |
| **Por Vencer** | Contratos que vencen en los próximos 30 días |
| **Vencidos** | Contratos cuya fecha de fin ya pasó |

### 4.3 Gráficos Disponibles

- **Equipos por Área** - ¿Cuántos equipos hay en cada laboratorio?
- **Equipos por Estado** - Distribución: Activos vs Inactivos vs Críticos
- **Tickets por Prioridad** - Baja, Media, Alta, Crítica
- **Tickets por Estado** - Abierto, Asignado, En Proceso, Resuelto, Cerrado
- **Ejecuciones por Estado** - Programado, En Proceso, Completado, Cancelado
- **Contratos por Estado** - Vigentes, Por Vencer, Vencidos
- **Tendencia de Mantenimientos** - Histórico mensual

### 4.4 Acciones Rápidas

Desde el Dashboard puedes ir directamente a:
- ➕ Crear nuevo equipo
- 📅 Programar mantenimiento
- ⚠️ Ver alertas
- 🎫 Crear ticket
- 📄 Ver contratos
- ✅ Ver ejecuciones

---

## 5. Gestión de Equipos

### 5.1 ¿Qué es un Equipo?

Un **equipo** es cualquier activo de laboratorio que requiere mantenimiento. Puede ser:
- Microscopios
- Balanzas de precisión
- Centrífugas
- Cromatógrafos
- Autoclaves
- Equipos de medición
- Cualquier instrumento técnico

### 5.2 Estados de un Equipo

Los equipos tienen **3 estados posibles**:

| Estado | Color | ¿Qué significa? | ¿Cuándo usarlo? |
|--------|-------|-----------------|-----------------|
| **Activo** | 🟢 Verde | Funciona correctamente | Equipo operativo y disponible |
| **Inactivo** | ⚫ Gris | Fuera de servicio temporal | Equipo en reparación o sin uso |
| **Crítico** | 🔴 Rojo | Requiere atención urgente | Equipo con fallas graves o vencido |

### 5.3 Información de un Equipo

Cada equipo tiene la siguiente información:

| Campo | Descripción |
|-------|-------------|
| **Número de Inventario** | Código interno del activo fijo |
| **Número de Serie** | Identificador del fabricante |
| **Nombre** | Nombre descriptivo del equipo |
| **Código INACIF** | Código único institucional |
| **Marca** | Fabricante del equipo |
| **Modelo** | Modelo específico |
| **Ubicación** | Dónde está físicamente |
| **Área** | Laboratorio o departamento |
| **Categoría** | Tipo de equipo (Microscopio, Balanza, etc.) |
| **Estado** | Activo, Inactivo o Crítico |
| **Magnitud de Medición** | Qué mide (si aplica) |
| **Rango/Capacidad** | Límites de operación |
| **Condiciones de Operación** | Temperatura, humedad, etc. |
| **Fotografía** | Imagen del equipo |

### 5.4 Acciones sobre Equipos

| Acción | ¿Qué hace? | ¿Quién puede? |
|--------|------------|---------------|
| **Ver detalle** | Muestra toda la información del equipo | Todos |
| **Editar** | Modificar información del equipo | ADMIN, SUPERVISOR, TECNICO_EQUIPOS |
| **Historial** | Ver todos los cambios realizados | Todos |
| **Programaciones** | Ver mantenimientos del equipo | Todos |
| **Ficha técnica** | Descargar PDF con información | Todos |
| **Eliminar** | Eliminar permanentemente | Solo ADMIN |

### 5.5 Categorías de Equipo

Las **categorías** permiten clasificar equipos en grupos. Por ejemplo:
- Microscopios
- Equipos de medición
- Equipos de esterilización
- Instrumentos de análisis

Se pueden crear categorías **jerárquicas** (categorías dentro de categorías).

### 5.6 Bitácora/Historial de Equipos

El sistema registra automáticamente todos los cambios:
- Quién hizo el cambio
- Cuándo se hizo
- Qué valor tenía antes
- Qué valor tiene ahora

Esto es útil para **auditorías** y **trazabilidad**.

---

## 6. Gestión de Mantenimientos

### 6.1 ¿Cómo funciona el Mantenimiento?

El sistema de mantenimientos funciona en **3 pasos**:

```
1. PROGRAMAR         2. EJECUTAR           3. DOCUMENTAR
   ↓                    ↓                     ↓
Se define qué      El técnico realiza    Se registra qué
equipo necesita    el trabajo físico     se hizo, con fotos
mantenimiento      en el equipo          y observaciones
y cada cuánto
```

### 6.2 Módulo: Calendario

**¿Qué es?** Vista de calendario que muestra todos los mantenimientos programados.

**¿Para qué sirve?** 
- Ver de un vistazo qué mantenimientos hay en el mes
- Identificar días con mucha carga de trabajo
- Planificar recursos

### 6.3 Módulo: Programaciones

**¿Qué es?** Aquí se definen los mantenimientos que deben realizarse.

**¿Para qué sirve?**
- Crear mantenimientos recurrentes (cada semana, mes, año, etc.)
- Definir alertas automáticas antes de la fecha
- Asociar mantenimientos a contratos con proveedores

#### Frecuencias Disponibles

| Frecuencia | Días | Ejemplo de uso |
|------------|------|----------------|
| **Único** | 0 | Mantenimiento especial, una sola vez |
| **Semanal** | 7 | Limpieza de equipos sensibles |
| **Quincenal** | 15 | Revisiones de rutina |
| **Mensual** | 30 | Mantenimiento preventivo estándar |
| **Bimestral** | 60 | Equipos de uso moderado |
| **Trimestral** | 90 | Calibraciones trimestrales |
| **Cuatrimestral** | 120 | Revisiones periódicas |
| **Semestral** | 180 | Mantenimientos mayores |
| **Anual** | 365 | Certificaciones anuales |
| **Personalizado** | N | Cualquier número de días |

#### Crear una Programación

1. Ir a **Gestión de Mantenimientos** → **Programaciones**
2. Clic en **"+ Nueva Programación"**
3. Completar:
   - **Equipo** - Seleccionar el equipo
   - **Tipo de Mantenimiento** - Preventivo, Correctivo, etc.
   - **Contrato** - Si aplica, asociar un contrato
   - **Frecuencia** - Cada cuánto se repite
   - **Días de Alerta** - Cuántos días antes avisar
   - **Observaciones** - Instrucciones especiales

4. Guardar

#### Estadísticas de Programaciones

| Indicador | Significado |
|-----------|-------------|
| **Total** | Todas las programaciones creadas |
| **Activas** | Programaciones habilitadas |
| **Próximas** | Mantenimientos por vencer pronto |
| **Vencidas** | Mantenimientos con fecha pasada sin ejecutar |
| **Contratos Vencidos** | Programaciones cuyo contrato ya expiró |

### 6.4 Módulo: Ejecuciones

**¿Qué es?** Aquí se registra que un mantenimiento fue **realmente realizado**.

**¿Para qué sirve?**
- Documentar el trabajo realizado
- Subir evidencias (fotos, documentos)
- Llevar historial de cada equipo

#### Estados de una Ejecución

| Estado | Significado |
|--------|-------------|
| **PROGRAMADO** | Mantenimiento planificado, aún no se inicia |
| **EN_PROCESO** | El técnico está trabajando en el equipo |
| **COMPLETADO** | Mantenimiento finalizado exitosamente |
| **CANCELADO** | Mantenimiento cancelado (con motivo) |

#### Flujo de una Ejecución

```
    PROGRAMADO
        ↓
    [Iniciar trabajo]
        ↓
    EN_PROCESO
        ↓
    [Completar] ─────o───── [Cancelar]
        ↓                       ↓
    COMPLETADO              CANCELADO
```

#### Gestionar una Ejecución

Al abrir una ejecución puedes:
- **Iniciar trabajo** - Marca que empezaste a trabajar
- **Completar** - Marca que terminaste
- **Cancelar** - Cancela con un motivo
- **Agregar comentarios** - Documenta observaciones
- **Subir evidencias** - Fotos, documentos, reportes

#### Tipos de Comentarios en Ejecuciones

| Tipo | ¿Cuándo usarlo? |
|------|-----------------|
| **Seguimiento** | Actualizaciones de avance |
| **Técnico** | Detalles técnicos del trabajo |
| **Observación** | Notas generales |
| **Resolución** | Descripción de cómo se completó |
| **Alerta** | Avisos importantes |

### 6.5 Módulo: Tipos de Mantenimiento

**¿Qué es?** Catálogo de los tipos de mantenimiento disponibles.

**Ejemplos:**
- Mantenimiento Preventivo
- Mantenimiento Correctivo
- Calibración
- Verificación
- Limpieza profunda

**¿Quién puede gestionarlo?** Solo ADMIN y SUPERVISOR

### 6.6 Bitácora de Mantenimientos

Registro histórico de todos los cambios en programaciones. Útil para auditorías.

---

## 7. Sistema de Tickets

### 7.1 ¿Qué es un Ticket?

Un **ticket** es un reporte de falla o problema con un equipo. Cualquier persona puede crear un ticket cuando detecta que algo no funciona.

### 7.2 Estados de un Ticket

| Estado | Significado | ¿Qué sigue? |
|--------|-------------|-------------|
| **Abierto** | Ticket recién creado | Espera ser asignado |
| **Asignado** | Ya tiene un técnico responsable | Técnico debe trabajar |
| **En Proceso** | Técnico trabajando activamente | Espera resolución |
| **Resuelto** | Problema solucionado | Supervisor debe cerrar |
| **Cerrado** | Ticket finalizado | Archivo histórico |

### 7.3 Flujo de un Ticket

```
Usuario reporta problema
        ↓
    [ABIERTO]
        ↓
Supervisor asigna técnico
        ↓
    [ASIGNADO]
        ↓
Técnico empieza a trabajar
        ↓
    [EN PROCESO]
        ↓
Técnico resuelve el problema
        ↓
    [RESUELTO]
        ↓
Supervisor verifica y cierra
        ↓
    [CERRADO]
```

### 7.4 Prioridades

| Prioridad | ¿Cuándo usar? | Tiempo de atención esperado |
|-----------|---------------|----------------------------|
| **Baja** | Problema menor, puede esperar | Días |
| **Media** | Problema moderado | 1-2 días |
| **Alta** | Problema importante | Horas |
| **Crítica** | Emergencia, equipo indispensable | Inmediato |

### 7.5 Crear un Ticket

**¿Quién puede?** Todos los usuarios

1. Ir a **Tickets** → **Todos los Tickets**
2. Clic en **"+ Nuevo Ticket"**
3. Completar:
   - **Equipo** - Cuál equipo tiene el problema
   - **Descripción** - Explicar claramente qué pasa
   - **Prioridad** - Qué tan urgente es

4. Clic en **"Crear"**

### 7.6 Gestionar Tickets

| Acción | ¿Qué hace? | ¿Quién puede? |
|--------|------------|---------------|
| **Ver detalles** | Ver toda la información | Todos |
| **Editar** | Modificar descripción, prioridad | ADMIN, SUPERVISOR, TECNICO, TECNICO_EQUIPOS |
| **Asignar** | Asignar un técnico responsable | ADMIN, SUPERVISOR |
| **Resolver** | Marcar como solucionado | ADMIN, SUPERVISOR, TECNICO |
| **Cerrar** | Finalizar el ticket | ADMIN, SUPERVISOR |
| **Eliminar** | Eliminar permanentemente | Solo ADMIN |

### 7.7 Comentarios en Tickets

| Tipo | ¿Cuándo usarlo? |
|------|-----------------|
| **Técnico** | Información técnica del problema |
| **Seguimiento** | Actualizaciones de estado |
| **Alerta** | Avisos importantes |
| **Resolución** | Descripción de cómo se solucionó |
| **General** | Comentarios generales |

### 7.8 Evidencias

Puedes adjuntar archivos a un ticket:
- 📷 Fotos del problema
- 📄 Documentos de diagnóstico
- 📊 Reportes técnicos

### 7.9 Mis Tickets

El sistema filtra automáticamente para mostrarte:
- **Tickets que creaste** - Los problemas que tú reportaste
- **Tickets asignados a ti** - Los que debes resolver

---

## 8. Contratos y Proveedores

### 8.1 ¿Qué es un Contrato?

Un **contrato** es un acuerdo con un proveedor externo para realizar mantenimientos o calibraciones. Ejemplos:
- Contrato anual de calibración de balanzas
- Contrato de mantenimiento preventivo de microscopios
- Contrato de soporte técnico

### 8.2 Información de un Contrato

| Campo | Descripción |
|-------|-------------|
| **Fecha de Inicio** | Cuándo empieza a tener vigencia |
| **Fecha de Fin** | Cuándo termina el contrato |
| **Descripción** | Qué cubre el contrato |
| **Proveedor** | Empresa que presta el servicio |
| **Estado** | Activo o Inactivo |
| **Archivos** | Documentos adjuntos (PDF del contrato) |

### 8.3 Estados de Contrato

Los estados se calculan **automáticamente**:

| Estado | Significado |
|--------|-------------|
| **Vigente** | La fecha actual está entre inicio y fin |
| **Por Vencer** | Vence en los próximos 30 días |
| **Vencido** | La fecha de fin ya pasó |
| **Inactivo** | Desactivado manualmente |

### 8.4 Proveedores

**¿Qué es?** Registro de empresas que prestan servicios de mantenimiento.

**Información de un proveedor:**
- NIT (número de identificación tributaria)
- Nombre/Razón social
- Estado (Activo/Inactivo)

---

## 9. Administración

### 9.1 Áreas

**¿Qué es?** Las áreas son los laboratorios o departamentos de la institución.

**Tipos de Área:**
- Operativa
- Administrativa
- Técnica
- Laboratorio
- Almacén

**¿Para qué sirve?**
- Organizar equipos por ubicación
- Generar reportes por área
- Asignar responsables

### 9.2 Usuarios

**Acceso:** Solo ADMIN

**¿Qué se hace aquí?**
- Ver usuarios registrados en el sistema
- **Sincronizar con Keycloak** - Importar usuarios de Keycloak
- Activar/Desactivar usuarios

> ⚠️ **Importante:** Las contraseñas y roles se gestionan en **Keycloak**, no en este módulo.

---

## 10. Notificaciones y Scheduler

### 10.1 ¿Qué son las Notificaciones?

Las **notificaciones** son alertas automáticas que el sistema genera cuando:
- Un mantenimiento está próximo a vencer
- Un mantenimiento ya venció sin ejecutarse
- Un contrato está por vencer
- Hay tickets críticos sin resolver

### 10.2 Panel de Notificaciones

**Acceso:** Menú → **Notificaciones** → **Panel de Notificaciones**

Aquí puedes:
- Ver todas tus notificaciones
- Filtrar por prioridad (Crítica, Alerta, Informativa)
- Marcar como leídas
- Eliminar notificaciones

### 10.3 🔔 El Scheduler (Programador Automático)

El **Scheduler** es un proceso automático que se ejecuta **todos los días** a una hora configurada (por defecto 8:00 AM).

#### ¿Qué hace el Scheduler?

Cada día, automáticamente:

1. **Revisa mantenimientos próximos**
   - Busca programaciones que vencen pronto
   - Crea notificaciones de alerta
   - Envía correos si está configurado

2. **Detecta mantenimientos vencidos**
   - Identifica programaciones con fecha pasada
   - Genera alertas críticas
   - Envía correos a responsables

3. **Revisa contratos**
   - Detecta contratos por vencer (30, 15, 7 días antes)
   - Genera notificaciones escalonadas
   - Alerta cuando un contrato vence

4. **Limpieza automática**
   - Elimina notificaciones leídas antiguas (>90 días)
   - Mantiene el sistema limpio

#### Configuración del Scheduler

| Parámetro | Valor por defecto | Descripción |
|-----------|-------------------|-------------|
| **Habilitado** | Sí | Si está activo o no |
| **Hora de ejecución** | 8:00 AM | Cuándo se ejecuta cada día |
| **Días alerta mantenimiento** | 7 días | Cuántos días antes alertar |
| **Días alerta contrato** | 30, 15, 7 días | Alertas escalonadas |
| **Envío de correos** | Sí | Si envía correos además de notificaciones |
| **Limpieza** | 90 días | Antigüedad para eliminar notificaciones leídas |

#### ¿Quién puede configurar el Scheduler?

Solo **ADMIN** puede modificar la configuración del scheduler desde:
- Panel de Notificaciones → Configuración
- Configuración de Correos

### 10.4 Configuración de Correos

**Acceso:** Solo ADMIN

Permite definir qué correos recibirán las alertas automáticas:
- Correos para alertas de mantenimiento
- Correos para alertas de contratos
- Correos para tickets críticos

---

## 11. Reportes

### 11.1 ¿Qué son los Reportes?

Los **reportes** son documentos que muestran información consolidada del sistema. Se pueden descargar en **PDF** o **Excel**.

### 11.2 Tipos de Reportes Disponibles

| Reporte | ¿Qué muestra? |
|---------|---------------|
| **Equipos** | Listado de equipos por área, estado, categoría |
| **Mantenimientos** | Mantenimientos ejecutados en un período |
| **Contratos** | Contratos vigentes, por vencer y vencidos |
| **Proveedores** | Lista de proveedores y sus servicios |
| **Programaciones** | Programaciones activas y próximas |
| **Tickets** | Tickets registrados y su estado |

### 11.3 Generar un Reporte

1. Ir a **Reportes** → **Reportes Técnicos**
2. Seleccionar el tipo de reporte
3. Configurar filtros (fechas, área, etc.)
4. Clic en **"Generar"**
5. Se descarga el archivo

---

## 12. Preguntas Frecuentes

### ¿Cómo sé cuál es mi rol?
Tu rol determina qué menús puedes ver. Si no ves un módulo, tu rol no tiene acceso.

### ¿Por qué no puedo eliminar equipos?
Solo ADMIN puede eliminar para mantener trazabilidad histórica.

### ¿Por qué TECNICO_EQUIPOS no ve mantenimientos?
Este rol está enfocado **únicamente** en gestionar el inventario de equipos, no en la ejecución de mantenimientos.

### ¿Cómo cambio mi contraseña?
Las contraseñas se gestionan en Keycloak. Contacta a tu administrador.

### ¿Qué hago si un mantenimiento está vencido?
1. Ejecutar el mantenimiento lo antes posible
2. O reprogramar la fecha si hay justificación
3. O cancelar si no aplica

### ¿Puedo ver tickets de otros usuarios?
- **ADMIN/SUPERVISOR:** Ven todos los tickets
- **TECNICO:** Ve los asignados a él
- **USER:** Solo ve los que creó

### ¿A qué hora se ejecuta el Scheduler?
Por defecto a las **8:00 AM** todos los días. Esto puede configurarlo el ADMIN.

### ¿Qué pasa si no ejecuto un mantenimiento a tiempo?
- El sistema genera alertas diarias
- Aparece en rojo en el Dashboard
- Se envían correos a responsables (si está configurado)
- El equipo puede quedar fuera de cumplimiento

### ¿Cómo recibo notificaciones por correo?
El ADMIN debe configurar tu correo en **Configuración de Correos**.

---

## Soporte

Si tienes problemas con el sistema, contacta a:

📧 **Email:** soporte.sistemas@inacif.gob.gt

---

**© 2026 INACIF - Sistema de Gestión de Mantenimientos**
