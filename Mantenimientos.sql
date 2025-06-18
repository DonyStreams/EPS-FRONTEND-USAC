-- ===============================
-- MODELO DE BASE DE DATOS MEJORADO - INACIF
-- ===============================

-- TABLA USUARIOS (Integración con Keycloak)
CREATE TABLE Usuarios (
    id INT PRIMARY KEY IDENTITY(1,1),
    keycloak_id UNIQUEIDENTIFIER NOT NULL UNIQUE,
    nombre_completo VARCHAR(100),
    correo VARCHAR(100),
    activo BIT DEFAULT 1
);

-- CATÁLOGO DE ÁREAS
CREATE TABLE Areas (
    id_area INT PRIMARY KEY IDENTITY(1,1),
    codigo_area VARCHAR(20),
    nombre VARCHAR(100),
    tipo_area VARCHAR(50), -- Técnico Científico / Administrativo Financiero
    estado BIT,
    fecha_creacion DATETIME DEFAULT GETDATE(),
    usuario_creacion INT,
    fecha_modificacion DATETIME,
    usuario_modificacion INT,
    FOREIGN KEY (usuario_creacion) REFERENCES Usuarios(id),
    FOREIGN KEY (usuario_modificacion) REFERENCES Usuarios(id)
);

-- CATÁLOGO DE EQUIPOS
CREATE TABLE Equipos (
    id_equipo INT PRIMARY KEY IDENTITY(1,1),
    numero_inventario VARCHAR(50) UNIQUE,
    numero_serie VARCHAR(50),
    descripcion TEXT,
    estado BIT,
    id_area INT,
    fecha_creacion DATETIME DEFAULT GETDATE(),
    usuario_creacion INT,
    fecha_modificacion DATETIME,
    usuario_modificacion INT,
    FOREIGN KEY (id_area) REFERENCES Areas(id_area),
    FOREIGN KEY (usuario_creacion) REFERENCES Usuarios(id),
    FOREIGN KEY (usuario_modificacion) REFERENCES Usuarios(id)
);

-- HISTORIAL DE EQUIPOS
CREATE TABLE Historial_Equipo (
    id_historial INT PRIMARY KEY IDENTITY(1,1),
    id_equipo INT,
    fecha_registro DATETIME DEFAULT GETDATE(),
    descripcion TEXT,
    FOREIGN KEY (id_equipo) REFERENCES Equipos(id_equipo)
);

-- TIPOS DE MANTENIMIENTO
CREATE TABLE Tipos_Mantenimiento (
    id_tipo INT PRIMARY KEY IDENTITY(1,1),
    codigo VARCHAR(20),
    nombre VARCHAR(50),
    estado BIT,
    fecha_creacion DATETIME DEFAULT GETDATE(),
    usuario_creacion INT,
    fecha_modificacion DATETIME,
    usuario_modificacion INT,
    FOREIGN KEY (usuario_creacion) REFERENCES Usuarios(id),
    FOREIGN KEY (usuario_modificacion) REFERENCES Usuarios(id)
);

-- PROVEEDORES DE SERVICIO
CREATE TABLE Proveedores (
    id_proveedor INT PRIMARY KEY IDENTITY(1,1),
    nit VARCHAR(20) UNIQUE,
    nombre VARCHAR(100),
    estado BIT,
    fecha_creacion DATETIME DEFAULT GETDATE(),
    usuario_creacion INT,
    fecha_modificacion DATETIME,
    usuario_modificacion INT,
    FOREIGN KEY (usuario_creacion) REFERENCES Usuarios(id),
    FOREIGN KEY (usuario_modificacion) REFERENCES Usuarios(id)
);

-- CONTRATOS DE MANTENIMIENTO
CREATE TABLE Contratos (
    id_contrato INT PRIMARY KEY IDENTITY(1,1),
    fecha_inicio DATE,
    fecha_fin DATE,
    descripcion TEXT,
    frecuencia VARCHAR(20), -- mensual, anual, semestral, a demanda
    estado BIT,
    id_proveedor INT,
    fecha_creacion DATETIME DEFAULT GETDATE(),
    usuario_creacion INT,
    fecha_modificacion DATETIME,
    usuario_modificacion INT,
    FOREIGN KEY (id_proveedor) REFERENCES Proveedores(id_proveedor),
    FOREIGN KEY (usuario_creacion) REFERENCES Usuarios(id),
    FOREIGN KEY (usuario_modificacion) REFERENCES Usuarios(id)
);

-- RELACIÓN CONTRATO - EQUIPO (Muchos a Muchos)
CREATE TABLE Contrato_Equipo (
    id_contrato INT,
    id_equipo INT,
    PRIMARY KEY (id_contrato, id_equipo),
    FOREIGN KEY (id_contrato) REFERENCES Contratos(id_contrato),
    FOREIGN KEY (id_equipo) REFERENCES Equipos(id_equipo)
);

-- RELACIÓN CONTRATO - TIPO DE MANTENIMIENTO (Muchos a Muchos)
CREATE TABLE Contrato_Tipo_Mantenimiento (
    id_contrato INT,
    id_tipo INT,
    PRIMARY KEY (id_contrato, id_tipo),
    FOREIGN KEY (id_contrato) REFERENCES Contratos(id_contrato),
    FOREIGN KEY (id_tipo) REFERENCES Tipos_Mantenimiento(id_tipo)
);

-- EJECUCIÓN DE MANTENIMIENTO
CREATE TABLE Ejecuciones_Mantenimiento (
    id_ejecucion INT PRIMARY KEY IDENTITY(1,1),
    id_contrato INT,
    id_equipo INT,
    fecha_ejecucion DATETIME DEFAULT GETDATE(),
    bitacora TEXT,
    usuario_responsable INT,
    fecha_creacion DATETIME DEFAULT GETDATE(),
    fecha_modificacion DATETIME,
    usuario_creacion INT,
    usuario_modificacion INT,
    FOREIGN KEY (id_contrato) REFERENCES Contratos(id_contrato),
    FOREIGN KEY (id_equipo) REFERENCES Equipos(id_equipo),
    FOREIGN KEY (usuario_responsable) REFERENCES Usuarios(id),
    FOREIGN KEY (usuario_creacion) REFERENCES Usuarios(id),
    FOREIGN KEY (usuario_modificacion) REFERENCES Usuarios(id)
);

-- TICKETS
CREATE TABLE Tickets (
    id INT PRIMARY KEY IDENTITY(1,1),
    equipo_id INT NOT NULL,
    usuario_creador_id INT NOT NULL,
    usuario_asignado_id INT NULL,
    descripcion NVARCHAR(MAX),
    prioridad VARCHAR(20) CHECK (prioridad IN ('Baja','Media','Alta','Crítica')),
    estado VARCHAR(20) CHECK (estado IN ('Abierto', 'Asignado', 'En Proceso', 'Resuelto', 'Cerrado')),
    fecha_creacion DATETIME DEFAULT GETDATE(),
    fecha_modificacion DATETIME,
    fecha_cierre DATETIME NULL,
    usuario_creacion INT,
    usuario_modificacion INT,
    FOREIGN KEY (equipo_id) REFERENCES Equipos(id_equipo),
    FOREIGN KEY (usuario_creador_id) REFERENCES Usuarios(id),
    FOREIGN KEY (usuario_asignado_id) REFERENCES Usuarios(id),
    FOREIGN KEY (usuario_creacion) REFERENCES Usuarios(id),
    FOREIGN KEY (usuario_modificacion) REFERENCES Usuarios(id)
);

-- TIPOS DE COMENTARIO PARA TICKETS
CREATE TABLE Tipos_Comentario (
    id_tipo INT PRIMARY KEY IDENTITY(1,1),
    nombre VARCHAR(50) UNIQUE -- Ej: 'técnico', 'seguimiento', 'alerta'
);

-- COMENTARIOS DE TICKETS
CREATE TABLE Comentarios_Ticket (
    id INT PRIMARY KEY IDENTITY(1,1),
    ticket_id INT NOT NULL,
    usuario_id INT NOT NULL,
    tipo_comentario_id INT NOT NULL,
    comentario NVARCHAR(MAX),
    fecha_creacion DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ticket_id) REFERENCES Tickets(id),
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id),
    FOREIGN KEY (tipo_comentario_id) REFERENCES Tipos_Comentario(id_tipo)
);

-- EVIDENCIAS (para mantenimiento y tickets)
CREATE TABLE Evidencias (
    id INT PRIMARY KEY IDENTITY(1,1),
    entidad_relacionada VARCHAR(50) NOT NULL, -- 'ticket', 'ejecucion_mantenimiento'
    entidad_id INT NOT NULL,
    archivo_url NVARCHAR(500) NOT NULL,
    descripcion TEXT,
    fecha_creacion DATETIME DEFAULT GETDATE()
);


/*Las tablas de auditoría (usuario_creacion, usuario_modificacion, fecha_creacion, etc.) están en todos los catálogos para trazabilidad.

La tabla Usuarios contiene el campo keycloak_id para integrar con Keycloak.

Se creó la tabla Tipos_Comentario para mantener control sobre los tipos posibles.

La tabla Evidencias es genérica para soportar subir múltiples archivos a tickets o mantenimientos.

Se respetaron las relaciones y llaves foráneas para mantener integridad referencial.*/