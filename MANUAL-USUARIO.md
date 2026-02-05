# 📖 Manual de Usuario - Sistema de Gestión de Mantenimientos INACIF

**Versión:** 2.2.0  
**Fecha:** Febrero 2026  
**Clasificación:** Manual para Usuarios Finales

---

## 📋 Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Inicio de Sesión](#2-inicio-de-sesión)
3. [Navegación e Interfaz](#3-navegación-e-interfaz)
4. [Perfil de Usuario](#4-perfil-de-usuario)
5. [Roles y Permisos](#5-roles-y-permisos)
6. [Dashboard](#6-dashboard)
7. [Gestión de Equipos](#7-gestión-de-equipos)
8. [Gestión de Mantenimientos](#8-gestión-de-mantenimientos)
9. [Sistema de Tickets](#9-sistema-de-tickets)
10. [Contratos y Proveedores](#10-contratos-y-proveedores)
11. [Administración](#11-administración)
12. [Notificaciones y Scheduler](#12-notificaciones-y-scheduler)
13. [Reportes](#13-reportes)
14. [Ejemplos Prácticos](#14-ejemplos-prácticos)
15. [Glosario de Términos](#15-glosario-de-términos)
16. [Solución de Problemas](#16-solución-de-problemas)
17. [Preguntas Frecuentes](#17-preguntas-frecuentes)

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

---
**[CAPTURA 2.1: Pantalla de bienvenida del sistema]**

---

### 2.2 Autenticación con Keycloak

El sistema utiliza **Keycloak** para la autenticación, lo que significa:

- ✅ **Una sola cuenta** para acceder a todas las aplicaciones institucionales
- ✅ **Sesiones seguras** con tokens que expiran automáticamente
- ✅ **Cambio de contraseña centralizado** desde el portal de Keycloak

**Para ingresar:**
1. Escribe tu **usuario institucional**
2. Escribe tu **contraseña**
3. Haz clic en **"Acceder"**

---
**[CAPTURA 2.2: Formulario de login de Keycloak con campos usuario y contraseña]**

---

### 2.3 ¿Qué pasa si olvidé mi contraseña?

Contacta a tu administrador de sistemas o utiliza la opción "¿Olvidaste tu contraseña?" en la pantalla de Keycloak.

### 2.4 Cerrar Sesión

Siempre cierra sesión cuando termines:
1. Haz clic en tu **nombre** (esquina superior derecha)
2. Selecciona **"Cerrar Sesión"**

⚠️ **Importante:** En computadoras compartidas, siempre cierra sesión para proteger tu cuenta.

---

## 3. Navegación e Interfaz

### 3.1 Elementos Principales de la Interfaz

Una vez dentro del sistema, verás estos elementos:

---
**[CAPTURA 3.1: Vista general de la interfaz con todos los elementos]**

---

| Elemento | Ubicación | Función |
|----------|-----------|----------|
| **Logo INACIF** | Arriba izquierda | Identifica la aplicación |
| **Menú Lateral** | Izquierda | Navegación entre módulos |
| **Barra Superior** | Arriba | Búsqueda, notificaciones, perfil |
| **Área de Contenido** | Centro | Información del módulo activo |
| **Breadcrumb** | Arriba del contenido | Muestra dónde estás (ej: Inicio > Equipos > Detalle) |

### 3.2 El Menú Lateral

**¿Cómo funciona?**
- Los módulos se agrupan por categorías
- Solo ves los módulos que tu rol permite
- Algunos módulos tienen sub-menús (flecha expandible)
- El módulo activo se resalta en color

**Estructura del Menú:**

```
📊 Inicio
   └─ Dashboard

🖥️ Gestión de Equipos
   ├─ Equipos
   ├─ Categorías de Equipo
   └─ Bitácora/Historial

🔧 Gestión de Mantenimientos
   ├─ Calendario
   ├─ Programaciones
   ├─ Ejecuciones
   ├─ Tipos de Mantenimiento
   └─ Bitácora/Historial

🎫 Tickets
   ├─ Todos los Tickets
   └─ Bitácora/Historial

📄 Contratos
   ├─ Contratos
   └─ Proveedores

⚙️ Administración
   ├─ Áreas
   └─ Usuarios

🔔 Notificaciones
   └─ Panel de Notificaciones

📊 Reportes
   ├─ Reportes Técnicos
   └─ Configuración de correos
```

### 3.3 Barra de Búsqueda Global

---
**[CAPTURA 3.2: Barra de búsqueda con resultados]**

---

**¿Para qué sirve?**
Buscar rápidamente equipos, tickets o programaciones sin navegar por el menú.

**Cómo usar:**
1. Clic en el ícono de lupa 🔍
2. Escribe parte del nombre o código
3. Selecciona de los resultados
4. Te lleva directamente al detalle

**Busca:**
- Equipos por nombre o código INACIF
- Tickets por ID o descripción
- Programaciones por equipo

### 3.4 Campana de Notificaciones

---
**[CAPTURA 3.3: Menú desplegable de notificaciones]**

---

**¿Cómo funciona?**
- El ícono 🔔 muestra un número con notificaciones pendientes
- Color rojo = notificaciones críticas
- Clic en la campana = ver resumen rápido
- Clic en una notificación = ir al detalle

### 3.5 Menú de Usuario

**Ubicación:** Esquina superior derecha (tu nombre)

**Opciones:**
- **Mi Perfil** - Ver y editar tu información
- **Configuración** - Preferencias personales
- **Cerrar Sesión** - Salir del sistema

### 3.6 Configuración de Apariencia (Modo Oscuro/Claro)

**Acceso:** Botón de **engranaje** ⚙️ en la barra superior derecha

---
**[CAPTURA 3.3: Panel de configuración de apariencia]**

---

**¿Qué puedes configurar?**

| Configuración | Descripción | Opciones |
|---------------|-------------|----------|
| **Esquema de Color** | Tema visual del sistema | • Light (Claro) <br> • Dark (Oscuro) |
| **Tema** | Variante de colores | • Lara Light Indigo <br> • Lara Dark Indigo <br> • MD Light Indigo <br> • MD Dark Indigo <br> • Bootstrap Dark Blue <br> • Vela Blue <br> • Arya Blue |
| **Tamaño de Fuente** | Escala de texto | 12, 13, 14, 15, 16 px |
| **Estilo de Entrada** | Apariencia de campos | • Outlined (Con borde) <br> • Filled (Relleno) |
| **Efecto Ripple** | Animación al hacer clic | Activar/Desactivar |
| **Modo de Menú** | Comportamiento del menú lateral | • Static (Fijo) <br> • Overlay (Superpuesto) |

**¿Cómo cambiar a Modo Oscuro?**
1. Haz clic en el botón ⚙️ en la barra superior
2. En "Esquema de Color", selecciona **"Dark"**
3. Opcionalmente, elige un tema oscuro (ej: "Lara Dark Indigo")
4. Los cambios se aplican inmediatamente

**Beneficios del Modo Oscuro:**
- Reduce fatiga visual en ambientes con poca luz
- Ahorra batería en pantallas OLED
- Apariencia más moderna y profesional

> ℹ️ **Nota:** Tus preferencias se guardan automáticamente en tu navegador

---

## 4. Perfil de Usuario

### 4.1 Ver Mi Perfil

**Acceso:** Menú Usuario (esquina superior derecha) → **"Mi Perfil"**

---
**[CAPTURA 4.1: Pantalla de perfil de usuario]**

---

### 4.2 Información Disponible

| Sección | Información |
|---------|-------------|
| **Datos Personales** | Nombre completo, email, usuario |
| **Información Institucional** | Área asignada, cargo |
| **Rol en el Sistema** | Tu rol actual (ADMIN, SUPERVISOR, etc.) |
| **Permisos** | Lista de acciones que puedes realizar |
| **Actividad Reciente** | Últimas acciones realizadas |

### 4.3 Editar Mi Información

**Campos editables:**
- Correo electrónico de contacto
- Teléfono
- Foto de perfil

**Campos NO editables:**
- Nombre (viene de Keycloak)
- Usuario (viene de Keycloak)
- Rol (lo asigna el administrador)

**Para editar:**
1. Clic en **"Editar Perfil"**
2. Modifica los campos permitidos
3. Clic en **"Guardar Cambios"**

### 4.4 Ver Mis Estadísticas

**¿Qué puedo ver?**
- Mantenimientos que he ejecutado (si eres TECNICO)
- Tickets que he creado
- Tickets asignados a mí
- Programaciones creadas (si eres SUPERVISOR)

---

## 5. Roles y Permisos

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

---
**[CAPTURA 4.1: Vista general del Dashboard con KPIs, gráficos y alertas]**

---

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

#### 4.3.1 Equipos por Área
- **Tipo:** Gráfico de barras horizontales
- **Muestra:** Cantidad de equipos en cada laboratorio/área
- **Interacción:** Hacer clic en una barra para ver detalle
- **Útil para:** Identificar áreas con más equipos

#### 4.3.2 Equipos por Estado
- **Tipo:** Gráfico de dona (donut chart)
- **Muestra:** Proporción de equipos Activos/Inactivos/Críticos
- **Colores:** 🟢 Verde (Activo), ⚫ Gris (Inactivo), 🔴 Rojo (Crítico)
- **Útil para:** Ver rápidamente la salud general del inventario

#### 4.3.3 Tickets por Prioridad
- **Tipo:** Gráfico de pastel (pie chart)
- **Muestra:** Distribución de tickets por nivel de urgencia
- **Niveles:** Baja, Media, Alta, Crítica
- **Útil para:** Priorizar recursos técnicos

#### 4.3.4 Tickets por Estado
- **Tipo:** Gráfico de barras
- **Muestra:** Cantidad de tickets en cada estado del flujo
- **Estados:** Abierto, Asignado, En Proceso, Resuelto, Cerrado
- **Útil para:** Monitorear el avance de resolución

#### 4.3.5 Ejecuciones por Estado
- **Tipo:** Gráfico de barras apiladas
- **Muestra:** Mantenimientos PROGRAMADO, EN_PROCESO, COMPLETADO, CANCELADO
- **Período:** Últimos 6 meses
- **Útil para:** Analizar cumplimiento de mantenimientos

#### 4.3.6 Tendencia de Mantenimientos
- **Tipo:** Gráfico de líneas
- **Muestra:** Evoluci ón mensual de mantenimientos completados
- **Período:** Último año
- **Útil para:** Identificar tendencias y planificar recursos

#### 4.3.7 Contratos por Estado
- **Tipo:** Gráfico de dona
- **Muestra:** Contratos Activos vs Por Vencer vs Vencidos
- **Útil para:** Gestión proactiva de renovaciones

### 4.4 Tablas de Datos

#### 4.4.1 Alertas Recientes (Top 5)
Muestra las últimas alertas generadas automáticamente:
- Mantenimientos próximos a vencer (7 días)
- Mantenimientos vencidos
- Contratos por vencer (30, 15, 7 días)
- Contratos vencidos

**Columnas:**
| Columna | Descripción |
|---------|-------------|
| **Tipo** | Tipo de alerta (mantenimiento/contrato) |
| **Descripción** | Detalle del problema |
| **Fecha** | Cuándo se generó la alerta |
| **Prioridad** | Nivel de urgencia |

#### 4.4.2 Top 5 Tickets Críticos
Tickets de máxima prioridad ordenados por antigüedad:
- ID del ticket
- Equipo afectado
- Estado actual
- Técnico asignado
- Días abierto

**Acción:** Clic en un ticket para ver el detalle completo

#### 4.4.3 Programaciones Vencidas
Mantenimientos que debieron ejecutarse:
- Equipo
- Tipo de mantenimiento
- Fecha programada
- Días de retraso

**Color:** 🔴 Rojo = urgente, requiere atención inmediata

### 4.5 Actualización de Datos

- **Frecuencia:** Datos actualizados cada vez que cargas el dashboard
- **Última actualización:** Se muestra en la esquina superior (ej: "Actualizado: 04-Feb-2026 10:30")
- **Refrescar manualmente:** Haz clic en el botón **"Actualizar"** ↻

### 4.6 Acciones Rápidas

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

---
**[CAPTURA 5.1: Listado de equipos mostrando los diferentes estados con colores]**

---

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

---
**[CAPTURA 6.1: Formulario de nueva programación con todos los campos]**

---
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

---
**[CAPTURA 6.2: Pantalla de gestión de ejecución con botones de Iniciar, Completar, Cancelar]**

---
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

---
**[CAPTURA 7.1: Listado de tickets con estados y prioridades]**

---

**[CAPTURA 7.2: Formulario de nuevo ticket]**

---
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

---
**[CAPTURA 10.1: Panel de notificaciones con filtros y lista de alertas]**

---

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

---
**[CAPTURA 10.2: Configuración del Scheduler mostrando parámetros]**

---

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

---
**[CAPTURA 11.1: Pantalla de reportes con opciones y filtros]**

---

1. Ir a **Reportes** → **Reportes Técnicos**
2. Seleccionar el tipo de reporte
3. Configurar filtros (fechas, área, etc.)
4. Clic en **"Generar"**
5. Se descarga el archivo

### 11.4 Configuración de Correos Electrónicos

**Acceso:** Menú → **Reportes** → **Configuración de correos**

**Rol requerido:** Solo ADMIN

---
**[CAPTURA 11.2: Pantalla de configuración de correos electrónicos]**

---

**¿Qué es?** Módulo para configurar las direcciones de correo que recibirán notificaciones automáticas del sistema.

**Tipos de Alertas Configurables:**

| Tipo de Alerta | ¿Cuándo se envía? | Ejemplo |
|----------------|-------------------|---------|
| **MANTENIMIENTO_PROXIMO** | 7 días antes de un mantenimiento | "Mantenimiento de Microscopio LAB-001 programado para 10-Feb-2026" |
| **MANTENIMIENTO_VENCIDO** | Cuando un mantenimiento no se ejecutó a tiempo | "Mantenimiento de Balanza LAB-015 vencido desde 03-Feb-2026" |
| **CONTRATO_POR_VENCER_30** | 30 días antes de que expire un contrato | "Contrato #2024-001 expira el 10-Mar-2026" |
| **CONTRATO_POR_VENCER_15** | 15 días antes de expiración | "Contrato #2024-001 expira en 15 días" |
| **CONTRATO_POR_VENCER_7** | 7 días antes de expiración | "⚠️ Contrato #2024-001 expira en 7 días" |
| **CONTRATO_VENCIDO** | Cuando un contrato ya expiró | "🔴 Contrato #2024-001 VENCIDO desde 05-Feb-2026" |
| **TICKET_CRITICO** | Cuando se crea un ticket de prioridad CRÍTICA | "🚨 Ticket CRÍTICO: Equipo LAB-032 fuera de servicio" |

**Cómo configurar:**

1. **Ver configuraciones existentes:**
   - El sistema muestra una tabla con todos los tipos de alerta
   - Cada fila tiene el tipo y los correos configurados

2. **Agregar correos electrónicos:**
   ```
   Formato: correo1@ejemplo.com, correo2@ejemplo.com, correo3@ejemplo.com
   ```
   - Separar múltiples correos con comas
   - Ejemplo: `jperez@inacif.gob.gt, mlopez@inacif.gob.gt, admin@inacif.gob.gt`

3. **Guardar cambios:**
   - **Guardar individual:** Botón 💾 "Guardar" en cada fila
   - **Guardar todo:** Botón "Guardar Todo" (guarda todas las configuraciones)

4. **Validación automática:**
   - El sistema valida formato correcto de correos
   - Muestra advertencia si hay correos inválidos

**Ejemplo de configuración:**
```
MANTENIMIENTO_PROXIMO:
supervisor1@inacif.gob.gt, supervisor2@inacif.gob.gt, tecnico@inacif.gob.gt

TICKET_CRITICO:
admin@inacif.gob.gt, jefatura@inacif.gob.gt, soporte@inacif.gob.gt

CONTRATO_VENCIDO:
compras@inacif.gob.gt, admin@inacif.gob.gt
```

**Notas importantes:**
- ✅ Puedes configurar diferentes correos para cada tipo de alerta
- ✅ Un mismo correo puede estar en múltiples tipos de alerta
- ✅ Los correos se pueden modificar en cualquier momento
- ⚠️ Si no hay correos configurados, NO se envían alertas de ese tipo
- ⚠️ Los correos deben ser válidos y estar activos

**¿Cómo saber si funciona?**
- El scheduler ejecuta a las 8:00 AM todos los días
- Si hay alertas, se envían correos automáticamente
- Puedes verificar en tu bandeja de entrada

---

## 14. Ejemplos Prácticos

### 14.1 Ejemplo 1: Programar Mantenimiento Preventivo Mensual

**Situación:** Necesitas programar limpieza mensual de un microscopio.

**Paso a paso:**

1. **Ir al módulo**
   - Menú → Gestión de Mantenimientos → Programaciones

2. **Crear nueva programación**
   - Clic en "+ Nueva Programación"

3. **Llenar formulario:**
   - **Equipo:** Buscar y seleccionar "Microscopio Óptico LAB-2026-001"
   - **Tipo de Mantenimiento:** Mantenimiento Preventivo
   - **Contrato:** (dejar vacío si es interno)
   - **Frecuencia:** Mensual (30 días)
   - **Fecha Último Mantenimiento:** 01/02/2026
   - **Fecha Próximo Mantenimiento:** 01/03/2026 (calcula automático)
   - **Días de Alerta Previa:** 7
   - **Activa:** ✅ Sí
   - **Observaciones:** "Limpieza y revisión de lentes"

4. **Guardar**
   - El sistema crea la programación
   - A partir de ahora, generará alertas automáticas

5. **Resultado:**
   - 7 días antes del 01/03/2026 recibirás notificación
   - Después de ejecutar, se programa automáticamente para 01/04/2026

---

### 14.2 Ejemplo 2: Reportar y Resolver una Falla

**Situación:** Una balanza no enciende.

**Rol USER (quien reporta):**

1. **Crear ticket**
   - Menú → Tickets → Todos los Tickets
   - Clic en "+ Nuevo Ticket"

2. **Completar:**
   - **Equipo:** Balanza Analítica LAB-2026-015
   - **Descripción:** "La balanza no enciende al presionar el botón de power. Se revisó la conexión eléctrica y está bien conectada."
   - **Prioridad:** Alta (afecta el trabajo)

3. **Guardar**
   - Estado: ABIERTO
   - Esperas que un supervisor lo asigne

**Rol SUPERVISOR (quien asigna):**

4. **Asignar técnico**
   - Ver el ticket
   - Clic en "Asignar"
   - Seleccionar técnico: Juan Pérez
   - Estado: ASIGNADO

**Rol TECNICO (quien resuelve):**

5. **Trabajar en el ticket**
   - Ver ticket asignado
   - Clic en "Iniciar Trabajo"
   - Estado: EN PROCESO

6. **Diagnosticar y reparar**
   - Agregar comentario: "Se revisó el equipo, fusible interno dañado"
   - Subir foto del fusible
   - Agregar comentario: "Fusible reemplazado, equipo funcionando"
   - Subir foto del equipo encendido

7. **Resolver**
   - Clic en "Resolver"
   - Descripción de solución: "Reemplazo de fusible F1 de 2A. Equipo probado y funcionando correctamente."
   - Estado: RESUELTO

**Rol SUPERVISOR (quien cierra):**

8. **Cerrar ticket**
   - Revisar solución
   - Si está correcto: Clic en "Cerrar"
   - Estado: CERRADO

---

### 14.3 Ejemplo 3: Ejecutar Mantenimiento Programado

**Situación:** Hoy debes hacer mantenimiento a una centrífuga.

**Paso a paso:**

1. **Ver programaciones pendientes**
   - Menú → Gestión de Mantenimientos → Programaciones
   - Filtrar por estado: Próximas
   - Identificar: Centrífuga LAB-2026-032

2. **Ir a ejecuciones**
   - Menú → Gestión de Mantenimientos → Ejecuciones
   - Buscar la ejecución programada para hoy

3. **Iniciar trabajo**
   - Abrir la ejecución
   - Clic en "Iniciar Trabajo"
   - Estado cambia: PROGRAMADO → EN_PROCESO

4. **Realizar el mantenimiento físico**
   - Hacer la limpieza y revisión del equipo
   - Tomar fotos del proceso

5. **Documentar**
   - Agregar comentario tipo "Técnico":
     "Se realizó limpieza completa del rotor y cámara. Se revisaron balancines, están en buen estado."
   - Subir fotos (3 archivos)
   - Agregar comentario tipo "Observación":
     "Equipo funcionando correctamente. Próximo mantenimiento en 3 meses."

6. **Completar**
   - Clic en "Completar"
   - Llenar campos finales:
     - **Bitácora:** "Mantenimiento preventivo completado exitosamente"
     - **Observaciones:** "Ninguna observación adicional"
   - Estado: COMPLETADO

7. **Resultado:**
   - El sistema actualiza automáticamente la fecha de último mantenimiento
   - Si la programación es recurrente, crea el siguiente mantenimiento
   - El historial del equipo se actualiza

---

### 14.4 Ejemplo 4: Generar Reporte de Equipos por Área

**Situación:** El jefe necesita un reporte de todos los equipos del Laboratorio de Química.

**Paso a paso:**

1. **Ir a reportes**
   - Menú → Reportes → Reportes Técnicos

2. **Seleccionar tipo**
   - Seleccionar: "Reporte de Equipos"

3. **Configurar filtros:**
   - **Área:** Laboratorio de Química
   - **Estado:** Todos
   - **Fecha:** No aplica para este reporte
   - **Formato:** PDF

4. **Generar**
   - Clic en "Generar Reporte"
   - Esperar unos segundos
   - Se descarga el archivo: `Reporte_Equipos_Lab_Quimica_04-02-2026.pdf`

5. **Contenido del reporte:**
   - Listado completo de equipos
   - Estado de cada equipo
   - Ubicación exacta
   - Último mantenimiento
   - Próximo mantenimiento programado

---

## 15. Glosario de Términos

### Términos Técnicos

| Término | Definición |
|---------|------------|
| **Activo** | Bien o equipo propiedad de la institución |
| **Calibración** | Proceso de ajustar un equipo a estándares precisos |
| **Dashboard** | Tablero o panel de control con información resumida |
| **Ejecución** | Registro de un mantenimiento que fue realizado físicamente |
| **JWT (JSON Web Token)** | Tipo de token de seguridad para autenticación |
| **Keycloak** | Sistema de autenticación y autorización centralizado |
| **KPI (Key Performance Indicator)** | Indicador clave de rendimiento |
| **Mantenimiento Correctivo** | Reparación cuando algo está dañado |
| **Mantenimiento Preventivo** | Mantenimiento programado para evitar fallas |
| **NIT** | Número de Identificación Tributaria |
| **Programación** | Planificación de cuándo debe hacerse un mantenimiento |
| **Rol** | Conjunto de permisos asignados a un tipo de usuario |
| **Scheduler** | Programador automático de tareas |
| **Ticket** | Reporte de un problema o falla |
| **Trazabilidad** | Capacidad de rastrear historial de cambios |

### Términos del Sistema

| Término | Significado en el Sistema |
|---------|---------------------------|
| **Área** | Laboratorio o departamento |
| **Bitácora** | Registro cronológico de eventos |
| **Categoría** | Clasificación de equipos por tipo |
| **Código INACIF** | Identificador único institucional |
| **Contrato** | Acuerdo con proveedor externo |
| **Crítico** | Estado de equipo que requiere atención urgente |
| **Evidencia** | Documento o foto que respalda una acción |
| **Frecuencia** | Cada cuánto tiempo se repite un mantenimiento |
| **Historial** | Registro de todos los cambios |
| **Proveedor** | Empresa externa que presta servicios |
| **Vigente** | Contrato activo actualmente |

### Estados de Equipo

| Estado | Significado |
|--------|-------------|
| **Activo** | Funciona correctamente, disponible |
| **Inactivo** | Temporalmente fuera de servicio |
| **Crítico** | Requiere atención urgente |

### Estados de Ejecución

| Estado | Significado |
|--------|-------------|
| **PROGRAMADO** | Planificado, no iniciado |
| **EN_PROCESO** | Trabajando actualmente |
| **COMPLETADO** | Finalizado exitosamente |
| **CANCELADO** | Cancelado con motivo |

### Estados de Ticket

| Estado | Significado |
|--------|-------------|
| **Abierto** | Recién creado, sin asignar |
| **Asignado** | Con técnico responsable |
| **En Proceso** | Técnico trabajando |
| **Resuelto** | Problema solucionado |
| **Cerrado** | Finalizado y archivado |

### Prioridades

| Prioridad | Nivel de Urgencia |
|-----------|-------------------|
| **Baja** | Puede esperar días |
| **Media** | Atención en 1-2 días |
| **Alta** | Atención en horas |
| **Crítica** | Atención inmediata |

---

## 16. Solución de Problemas

### 16.1 Problemas de Acceso

#### No puedo iniciar sesión

**Problema:** Al ingresar usuario y contraseña, aparece error.

**Soluciones:**
1. Verifica que estás usando el usuario correcto (sin espacios)
2. Revisa que Caps Lock esté desactivado
3. Intenta resetear tu contraseña con "¿Olvidaste tu contraseña?"
4. Contacta al administrador si el problema persiste

#### El sistema dice "Sesión expirada"

**Problema:** Estabas trabajando y te sacó del sistema.

**Soluciones:**
1. Esto es normal por seguridad (sesión expira después de inactividad)
2. Vuelve a iniciar sesión
3. Tu trabajo guardado está seguro
4. Configura el navegador para recordar contraseña si es tu computadora

#### No veo algunos menús que otros ven

**Problema:** Tu compañero ve módulos que tú no.

**Soluciones:**
1. Es normal - cada rol ve diferentes módulos
2. Verifica tu rol en "Mi Perfil"
3. Si necesitas más permisos, solicítalo al administrador

---

### 16.2 Problemas con Equipos

#### No puedo editar un equipo

**Problema:** El botón de editar no aparece o está deshabilitado.

**Soluciones:**
1. Verifica tu rol (solo ADMIN, SUPERVISOR, TECNICO_EQUIPOS pueden editar)
2. Otro usuario puede estar editando el equipo simultáneamente
3. El equipo puede estar bloqueado por una ejecución en proceso

#### No encuentro un equipo en el listado

**Problema:** Sé que existe un equipo pero no lo veo.

**Soluciones:**
1. Usa la búsqueda global (lupa) con el código o nombre
2. Revisa filtros activos en la tabla
3. Verifica que no esté en estado "Inactivo" si filtraste por "Activo"
4. Puede estar en otra área si tienes filtro de área activo

---

### 16.3 Problemas con Mantenimientos

#### No puedo completar una ejecución

**Problema:** El botón "Completar" está deshabilitado.

**Soluciones:**
1. Debes primero "Iniciar Trabajo"
2. Verifica que tengas permisos (TECNICO, SUPERVISOR o ADMIN)
3. Revisa que no falten campos obligatorios
4. La ejecución no debe estar ya completada o cancelada

#### Las alertas no me llegan

**Problema:** No recibo notificaciones de mantenimientos próximos.

**Soluciones:**
1. Verifica que la programación esté marcada como "Activa"
2. Revisa el Panel de Notificaciones (puede estar ahí sin que lo veas)
3. Si son correos, verifica que tu email esté en "Configuración de Correos"
4. Revisa la configuración del Scheduler (solo ADMIN)

#### No puedo crear una programación

**Problema:** Al guardar programación aparece error.

**Soluciones:**
1. Verifica que todos los campos obligatorios estén llenos
2. La fecha de próximo mantenimiento debe ser futura
3. Si asocias un contrato, debe estar vigente
4. Verifica tu rol (solo ADMIN y SUPERVISOR pueden crear)

---

### 16.4 Problemas con Tickets

#### No veo todos los tickets

**Problema:** Otros ven más tickets que yo.

**Soluciones:**
1. El rol USER solo ve tickets que creó
2. El rol TECNICO solo ve tickets asignados a él
3. ADMIN y SUPERVISOR ven todos
4. Revisa filtros activos (por estado, prioridad)

#### No puedo cerrar un ticket

**Problema:** El botón "Cerrar" no aparece.

**Soluciones:**
1. Solo ADMIN y SUPERVISOR pueden cerrar
2. El ticket debe estar primero en estado "Resuelto"
3. Verifica que tengas los permisos correctos

---

### 16.5 Problemas de Rendimiento

#### El sistema está lento

**Problema:** Las páginas tardan mucho en cargar.

**Soluciones:**
1. Verifica tu conexión a internet
2. Cierra pestañas innecesarias del navegador
3. Borra caché y cookies del navegador
4. Prueba en otro navegador (Chrome o Firefox recomendados)
5. Si el problema persiste, contacta soporte

#### No se cargan las imágenes/archivos

**Problema:** Las fotos de equipos o evidencias no se ven.

**Soluciones:**
1. Verifica tu conexión a internet
2. El archivo puede estar corrupto
3. Intenta recargar la página (F5)
4. Prueba descargar el archivo en vez de verlo en línea

---

### 16.6 ¿Cuándo Contactar Soporte?

**Contacta al administrador si:**
- ❌ No puedes acceder después de múltiples intentos
- ❌ Necesitas cambiar tu rol o permisos
- ❌ Ves errores de "500 Internal Server Error"
- ❌ Los datos no se guardan correctamente
- ❌ El Scheduler no está funcionando
- ❌ Necesitas recuperar información eliminada

**Email de soporte:** soporte.sistemas@inacif.gob.gt

**Al contactar incluye:**
1. Tu usuario
2. Módulo donde ocurre el problema
3. Descripción detallada del error
4. Captura de pantalla si es posible
5. Navegador y versión que usas

---

## 17. Preguntas Frecuentes

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
