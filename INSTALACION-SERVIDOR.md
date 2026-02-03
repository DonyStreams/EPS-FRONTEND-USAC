# ==========================================================
# GUÍA DE INSTALACIÓN - Sistema de Mantenimientos INACIF
# ==========================================================
# Para un servidor nuevo con acceso a internet
# ==========================================================

## 📋 REQUISITOS DEL SERVIDOR

### Hardware Mínimo Recomendado:
- **CPU:** 4 cores
- **RAM:** 8 GB mínimo (16 GB recomendado)
- **Disco:** 50 GB SSD
- **Red:** Acceso a internet para descargar imágenes Docker

### Sistema Operativo Recomendado:
- Ubuntu Server 22.04 LTS
- Rocky Linux 9 / AlmaLinux 9
- Windows Server 2019/2022

---

## 🔧 INSTALACIÓN PASO A PASO

### OPCIÓN A: Servidor Linux (Ubuntu 22.04 LTS) - RECOMENDADO

```bash
# 1. Actualizar sistema
sudo apt update && sudo apt upgrade -y

# 2. Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 3. Agregar usuario actual al grupo docker
sudo usermod -aG docker $USER
newgrp docker

# 4. Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 5. Verificar instalación
docker --version
docker-compose --version

# 6. Instalar Git (para clonar repositorios)
sudo apt install git -y

# 7. Clonar repositorios
cd /opt
sudo mkdir inacif && sudo chown $USER:$USER inacif
cd inacif
git clone https://github.com/DonyStreams/EPS-FRONTEND-USAC.git
git clone https://github.com/DonyStreams/MantenimientosBackend.git

# 8. Configurar variables de entorno
cd EPS-FRONTEND
cp .env.example .env
nano .env  # Editar con los valores correctos

# 9. Levantar servicios
docker-compose -f docker-compose.full.yml up -d

# 10. Ver logs
docker-compose -f docker-compose.full.yml logs -f
```

---

### OPCIÓN B: Servidor Windows Server

```powershell
# 1. Instalar Docker Desktop (descargar de docker.com)
# Ir a: https://www.docker.com/products/docker-desktop/

# 2. Habilitar WSL2 (PowerShell como Administrador)
wsl --install

# 3. Reiniciar el servidor
Restart-Computer

# 4. Después de reiniciar, ejecutar Docker Desktop

# 5. Instalar Git (descargar de git-scm.com)
# Ir a: https://git-scm.com/download/win

# 6. Clonar repositorios (PowerShell)
cd C:\
mkdir inacif
cd inacif
git clone https://github.com/DonyStreams/EPS-FRONTEND-USAC.git
git clone https://github.com/DonyStreams/MantenimientosBackend.git

# 7. Configurar variables
cd EPS-FRONTEND
Copy-Item .env.example .env
notepad .env  # Editar valores

# 8. Levantar servicios
docker-compose -f docker-compose.full.yml up -d

# 9. Ver logs
docker-compose -f docker-compose.full.yml logs -f
```

---

## 📦 SOFTWARE A INSTALAR (Resumen)

| Software | Versión | Propósito | URL de Descarga |
|----------|---------|-----------|-----------------|
| Docker | Última | Contenedores | https://docker.com |
| Docker Compose | Última | Orquestación | (incluido en Docker) |
| Git | Última | Control de versiones | https://git-scm.com |

---

## 🌐 PUERTOS NECESARIOS

Asegúrate de abrir estos puertos en el firewall:

| Puerto | Servicio | Descripción |
|--------|----------|-------------|
| 80 | Frontend | Aplicación Angular |
| 8080 | Keycloak | Autenticación |
| 8081 | Backend | API REST Java |
| 1433 | SQL Server | Base de datos (solo interno) |

### Configurar Firewall en Linux:
```bash
sudo ufw allow 80/tcp
sudo ufw allow 8080/tcp
sudo ufw allow 8081/tcp
sudo ufw enable
```

### Configurar Firewall en Windows:
```powershell
New-NetFirewallRule -DisplayName "INACIF Frontend" -Direction Inbound -Port 80 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "INACIF Keycloak" -Direction Inbound -Port 8080 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "INACIF Backend" -Direction Inbound -Port 8081 -Protocol TCP -Action Allow
```

---

## ⚙️ CONFIGURACIÓN INICIAL

### 1. Configurar Keycloak

1. Acceder a `http://IP-SERVIDOR:8080`
2. Login: admin / Admin2024! (o el configurado en .env)
3. Crear Realm: `MantenimientosINACIF`
4. Crear Cliente: `inacif-frontend`
   - Client Protocol: openid-connect
   - Access Type: public
   - Valid Redirect URIs: http://IP-SERVIDOR/*
   - Web Origins: http://IP-SERVIDOR
5. Crear roles: administrador, tecnico, proveedor, consulta
6. Crear usuarios y asignar roles

### 2. Configurar Base de Datos

```bash
# Conectar al contenedor SQL Server
docker exec -it inacif-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "InacifDB2024!" -C

# Crear base de datos
CREATE DATABASE MantenimientosINACIF;
GO

# Ejecutar script de creación de tablas (desde tu máquina local)
docker cp Scripts/Sistema-Completo-INACIF.sql inacif-sqlserver:/tmp/
docker exec -it inacif-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "InacifDB2024!" -C -d MantenimientosINACIF -i /tmp/Sistema-Completo-INACIF.sql
```

### 3. Verificar Servicios

```bash
# Ver estado de contenedores
docker ps

# Ver logs de cada servicio
docker logs inacif-frontend
docker logs inacif-backend
docker logs inacif-keycloak
docker logs inacif-sqlserver
```

---

## 🔄 COMANDOS ÚTILES

```bash
# Iniciar todos los servicios
docker-compose -f docker-compose.full.yml up -d

# Detener todos los servicios
docker-compose -f docker-compose.full.yml down

# Reiniciar un servicio específico
docker-compose -f docker-compose.full.yml restart backend

# Ver logs en tiempo real
docker-compose -f docker-compose.full.yml logs -f

# Actualizar imágenes y reconstruir
docker-compose -f docker-compose.full.yml up -d --build

# Limpiar todo (⚠️ CUIDADO: borra datos)
docker-compose -f docker-compose.full.yml down -v
```

---

## 🛡️ SEGURIDAD RECOMENDADA

1. **Cambiar contraseñas por defecto** en el archivo `.env`
2. **Configurar HTTPS** con certificado SSL (Let's Encrypt o institucional)
3. **Restringir acceso** a puertos de BD solo desde la red interna
4. **Configurar backups** automáticos de volúmenes Docker
5. **Mantener actualizados** los contenedores regularmente

---

## 📞 URLs de Acceso

Una vez desplegado, los servicios estarán disponibles en:

- **Frontend:** http://IP-SERVIDOR:80
- **Backend API:** http://IP-SERVIDOR:8081/MantenimientosBackend/api
- **Keycloak:** http://IP-SERVIDOR:8080

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### El frontend no carga:
```bash
docker logs inacif-frontend
docker-compose -f docker-compose.full.yml restart frontend
```

### Error de conexión a base de datos:
```bash
docker logs inacif-sqlserver
docker exec -it inacif-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "InacifDB2024!" -C -Q "SELECT 1"
```

### Keycloak no responde:
```bash
docker logs inacif-keycloak
docker-compose -f docker-compose.full.yml restart keycloak
```

### Reconstruir todo desde cero:
```bash
docker-compose -f docker-compose.full.yml down
docker system prune -a
docker-compose -f docker-compose.full.yml up -d --build
```
