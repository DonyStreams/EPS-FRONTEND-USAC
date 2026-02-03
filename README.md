# 📋 Notas de Despliegue - Sistema de Mantenimientos INACIF

## Fecha: Febrero 2026

---

## �️ Infraestructura de Producción

### Servidor de Aplicación
- **IP**: 172.16.33.11
- **OS**: Debian 12
- **Docker**: 29.2.1

### Base de Datos
- **IP**: 172.16.0.15
- **Puerto**: 6060
- **Motor**: SQL Server
- **Database**: inventarios

### Keycloak (Identity Provider)
- **IP**: 172.16.1.192
- **Puerto**: 8080
- **Versión**: ~16-17 (legacy con `/auth/` en URL)
- **Realm**: MantenimientosINACIF

---

## 🔥 Firewall y Puertos

### Puertos que deben estar abiertos en el servidor (172.16.33.11)

| Puerto | Protocolo | Servicio | Comando para abrir |
|--------|-----------|----------|-------------------|
| 80 | TCP | Frontend (Nginx) | `iptables -A INPUT -p tcp --dport 80 -j ACCEPT` |
| 8081 | TCP | Backend (TomEE) | `iptables -A INPUT -p tcp --dport 8081 -j ACCEPT` |

### Con UFW (si está instalado)
```bash
ufw allow 80/tcp
ufw allow 8081/tcp
ufw reload
```

### Verificar puertos abiertos
```bash
# Desde el servidor
ss -tlnp | grep -E '80|8081'

# Desde máquina externa
curl -I http://172.16.33.11:80
curl -I http://172.16.33.11:8081/MantenimientosBackend/api/health
```

### Problema encontrado
El frontend estaba corriendo en el contenedor pero no era accesible externamente porque el firewall bloqueaba el puerto 80.

---

## 🐳 Docker - Configuración de Red

### Backend: network_mode: host
El backend **DEBE** usar `network_mode: host` para poder conectarse a SQL Server:

```yaml
backend:
  container_name: inacif-backend
  network_mode: host  # OBLIGATORIO para acceder a SQL Server
  # NO se usa "ports:" con network_mode: host
```

**¿Por qué?**
- El contenedor en modo bridge no podía alcanzar SQL Server (172.16.0.15:6060)
- Con `network_mode: host`, el contenedor usa la red del host directamente
- El puerto 8081 se expone automáticamente

### Frontend: Bridge con port mapping
El frontend usa red bridge normal:

```yaml
frontend:
  container_name: inacif-frontend
  ports:
    - "80:80"
  networks:
    - inacif-network
```

---

## 🔄 TomEE - Conflicto de Puerto 8080

### Problema
Keycloak ya usa el puerto 8080. TomEE también usa 8080 por defecto.

### Solución: Cambiar TomEE a puerto 8081

En `Dockerfile.production`:
```dockerfile
# Cambiar puerto de TomEE de 8080 a 8081
RUN sed -i 's/port="8080"/port="8081"/g' /usr/local/tomee/conf/server.xml

EXPOSE 8081

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8081/MantenimientosBackend/api/health || exit 1
```

---

## ☕ TomEE - Versión y Jakarta EE

### Problema Encontrado
TomEE 9.x usa **Jakarta EE 9+** con namespace `jakarta.*`, pero el código usa **Java EE 8** con namespace `javax.*`.

Error típico:
```
ClassNotFoundException: javax.servlet.http.HttpServlet
```

### Solución
Usar **TomEE 8.0.16-plume** que soporta Java EE 8 con `javax.*`:

```dockerfile
FROM tomee:8.0.16-plume
```

---

## 🗄️ SQL Server - Problemas de Conexión

### Problema 1: Connection Reset
```
Connection reset ClientConnectionId:xxx
```

**Causa**: Problema de enrutamiento de red - las respuestas llegaban por interfaz loopback en lugar de la interfaz física.

**Diagnóstico usado**:
```bash
tcpdump -i any port 6060 -nn
```

**Solución**: El equipo de redes corrigió la configuración de routing/firewall.

### Problema 2: Certificado TLS
```
PKIX path building failed / unable to find valid certification path
```

**Solución**: Agregar parámetros en la URL JDBC:
```
encrypt=false;trustServerCertificate=true
```

### Configuración Final (resources.xml)
```xml
<Resource id="inacifDataSource" type="DataSource">
  JdbcDriver = com.microsoft.sqlserver.jdbc.SQLServerDriver
  JdbcUrl = jdbc:sqlserver://${DB_HOST}:${DB_PORT};databaseName=${DB_NAME};encrypt=false;trustServerCertificate=true
  UserName = ${DB_USER}
  Password = ${DB_PASSWORD}
</Resource>
```

---

## 📧 JavaMail - Conflicto de Dependencias

### Problema
```
javax.mail.NoSuchProviderException: Provider class does not have a constructor
```

**Causa**: Usar `javax.mail-api` (solo API) con `scope=provided` causaba conflicto con la implementación de TomEE.

### Solución
Usar la implementación completa **SIN** scope provided:

```xml
<!-- pom.xml - CORRECTO -->
<dependency>
    <groupId>com.sun.mail</groupId>
    <artifactId>javax.mail</artifactId>
    <version>1.6.2</version>
    <!-- SIN scope provided -->
</dependency>
```

**Incorrecto**:
```xml
<!-- NO USAR -->
<dependency>
    <groupId>javax.mail</groupId>
    <artifactId>javax.mail-api</artifactId>
    <version>1.6.2</version>
    <scope>provided</scope>
</dependency>
```

---

## �🔐 Keycloak y Web Crypto API

### Problema Encontrado
Al desplegar el frontend en producción con **HTTP** (sin HTTPS), se presentaba el error:
```
Error: Web Crypto API is not available.
```

### Causa Raíz
- La versión **keycloak-js 26.x** requiere **Web Crypto API** para funciones criptográficas (PKCE, etc.)
- Web Crypto API **solo está disponible en contextos seguros** (HTTPS o localhost)
- Al acceder por HTTP a `http://172.16.33.11`, el navegador no expone Web Crypto API

### Solución Implementada
**Downgrade de keycloak-js a versión 18.0.1** que NO requiere Web Crypto API obligatorio:

```bash
npm install keycloak-js@18.0.1 --save
```

### Compatibilidad
- ✅ keycloak-js 18.0.1 es compatible con Keycloak servidor v16-17
- ✅ Funciona con HTTP (sin HTTPS)
- ⚠️ Para usar keycloak-js 26.x+ se requiere HTTPS

### Configuración en Keycloak Admin
En el cliente `inacif-frontend`:
- **PKCE Code Challenge Method**: Dejarlo vacío o "disabled"
- **Valid Redirect URIs**: 
  - `http://localhost:4200/*`
  - `http://172.16.33.11/*`
- **Web Origins**:
  - `http://localhost:4200`
  - `http://172.16.33.11`

---

## 🌐 Configuración de Environments

### environment.ts (Desarrollo)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8081/MantenimientosBackend/api',
  keycloakUrl: 'http://172.16.1.192:8080/auth',
  keycloakRealm: 'MantenimientosINACIF',
  keycloakClientId: 'inacif-frontend',
  enableConsole: true  // Habilitar logs en desarrollo
};
```

### environment.prod.ts (Producción)
```typescript
export const environment = {
  production: true,
  apiUrl: 'http://172.16.33.11:8081/MantenimientosBackend/api',
  keycloakUrl: 'http://172.16.1.192:8080/auth',
  keycloakRealm: 'MantenimientosINACIF',
  keycloakClientId: 'inacif-frontend',
  enableConsole: false  // Deshabilitar logs en producción
};
```

---

## 🐳 Docker - Despliegue en Producción

### Variables de Entorno del Frontend (docker-compose.production.yml)
```yaml
frontend:
  build:
    context: ../EPS-FRONTEND-USAC
    dockerfile: Dockerfile.production
    args:
      - BACKEND_URL=http://${SERVER_URL}:${TOMEE_PORT}/MantenimientosBackend
      - KEYCLOAK_URL=${KEYCLOAK_URL}
      - KEYCLOAK_REALM=${KEYCLOAK_REALM}
      - KEYCLOAK_CLIENT_ID=${KEYCLOAK_CLIENT_ID_FRONTEND:-inacif-frontend}
```

### Dockerfile.production
El Dockerfile reemplaza las variables en `environment.prod.ts` durante el build:
```dockerfile
ARG BACKEND_URL=http://172.16.33.11:8081/MantenimientosBackend
ARG KEYCLOAK_URL=http://172.16.1.192:8080/auth
ARG KEYCLOAK_REALM=MantenimientosINACIF
ARG KEYCLOAK_CLIENT_ID=inacif-frontend

RUN sed -i "s|apiUrl:.*|apiUrl: '${BACKEND_URL}/api',|g" src/environments/environment.prod.ts && \
    sed -i "s|keycloakUrl:.*|keycloakUrl: '${KEYCLOAK_URL}',|g" src/environments/environment.prod.ts
```

### Comandos de Despliegue
```bash
# En el servidor de producción
cd /ruta/del/proyecto

# Reconstruir frontend con cambios
docker-compose -f docker-compose.production.yml build frontend --no-cache

# Recrear contenedor
docker-compose -f docker-compose.production.yml up -d frontend

# Ver logs
docker logs -f inacif-frontend
```

---

## 🔧 KeycloakService - Cambios Importantes

### Uso de Environment (NO hardcodeado)
El servicio ahora lee la configuración desde `environment.ts`:

```typescript
import { environment } from '../../environments/environment';

constructor() {
  this.keycloakInstance = new Keycloak({
    url: environment.keycloakUrl,
    realm: environment.keycloakRealm,
    clientId: environment.keycloakClientId
  });
}
```

### Logs de Depuración
Se agregaron logs para facilitar debugging:
```typescript
console.log('🔐 KeycloakService: Inicializando con configuración:', {
  url: environment.keycloakUrl,
  realm: environment.keycloakRealm,
  clientId: environment.keycloakClientId
});
```

Para habilitar/deshabilitar logs, modificar `enableConsole` en el environment correspondiente.

---

## 📊 Resumen de IPs y Puertos

| Servicio | IP | Puerto | URL |
|----------|-----|--------|-----|
| Frontend (Producción) | 172.16.33.11 | 80 | http://172.16.33.11/ |
| Backend (Producción) | 172.16.33.11 | 8081 | http://172.16.33.11:8081/MantenimientosBackend/api |
| Keycloak | 172.16.1.192 | 8080 | http://172.16.1.192:8080/auth/ |
| SQL Server | 172.16.0.15 | 6060 | - |
| Frontend (Local) | localhost | 4200 | http://localhost:4200/ |
| Backend (Local) | localhost | 8081 | http://localhost:8081/MantenimientosBackend/api |

---

## ⚠️ Problemas Conocidos y Soluciones

### 1. "Web Crypto API is not available"
**Causa**: keycloak-js 26.x + HTTP  
**Solución**: Usar keycloak-js 18.0.1 o implementar HTTPS

### 2. "enableConsole: false" oculta todos los console.log
**Causa**: Angular elimina console.log en producción si está deshabilitado  
**Solución**: Cambiar `enableConsole: true` en development

### 3. Frontend no refleja cambios de environment
**Causa**: El frontend se compila con los valores de environment  
**Solución**: Rebuil del contenedor Docker con `--no-cache`

### 4. Keycloak redirect loop o error de redirect
**Causa**: Valid Redirect URIs no configurado correctamente  
**Solución**: Agregar `http://172.16.33.11/*` en Keycloak Admin

---

## 🚀 Próximos Pasos (Mejoras Futuras)

1. **Implementar HTTPS** con certificado SSL para habilitar Web Crypto API
2. **Actualizar keycloak-js** a versión 26.x cuando se tenga HTTPS
3. **Configurar PKCE** para mayor seguridad en el flujo OAuth2
4. **CI/CD Pipeline** para despliegue automático en Cloud Sonet

---

## 📝 Historial de Cambios

| Fecha | Cambio | Archivo |
|-------|--------|---------|
| 03-Feb-2026 | Downgrade keycloak-js 26.2.0 → 18.0.1 | package.json |
| 03-Feb-2026 | KeycloakService usa environment | keycloak.service.ts |
| 03-Feb-2026 | Agregadas URLs de producción | environment.prod.ts |
| 03-Feb-2026 | Agregados logs de depuración | keycloak.service.ts |
| 03-Feb-2026 | Dockerfile usa ARGs para config | Dockerfile.production |
| 03-Feb-2026 | Docker-compose pasa variables | docker-compose.production.yml |
| 03-Feb-2026 | TomEE cambiado a puerto 8081 | Dockerfile.production |
| 03-Feb-2026 | Backend usa network_mode: host | docker-compose.production.yml |
| 03-Feb-2026 | JavaMail cambiado a com.sun.mail | pom.xml |
| 03-Feb-2026 | SQL Server encrypt=false | resources.xml |
| 03-Feb-2026 | TomEE downgrade a 8.0.16-plume | Dockerfile.production |

---

## 🛠️ Comandos Útiles

### Ver logs de contenedores
```bash
docker logs -f inacif-backend
docker logs -f inacif-frontend
```

### Reiniciar servicios
```bash
docker-compose -f docker-compose.production.yml restart backend
docker-compose -f docker-compose.production.yml restart frontend
```

### Rebuild completo
```bash
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d
```

### Verificar conectividad desde contenedor
```bash
# Test SQL Server
docker exec inacif-backend bash -c "cat < /dev/null > /dev/tcp/172.16.0.15/6060 && echo OK || echo FAIL"

# Test Keycloak
docker exec inacif-backend curl -I http://172.16.1.192:8080/auth/
```

### Health check del backend
```bash
curl http://172.16.33.11:8081/MantenimientosBackend/api/health
# Respuesta esperada: {"database":"UP","email":"CONFIGURED","status":"UP"}
```

---

## 📞 Contactos y Recursos

- **Keycloak Admin**: http://172.16.1.192:8080/auth/admin
- **Backend API**: http://172.16.33.11:8081/MantenimientosBackend/api/
- **Frontend**: http://172.16.33.11/

---

## ⚡ Troubleshooting Rápido

| Síntoma | Causa Probable | Solución |
|---------|---------------|----------|
| Frontend no carga | Puerto 80 bloqueado | `iptables -A INPUT -p tcp --dport 80 -j ACCEPT` |
| Backend 502/504 | Puerto 8081 bloqueado | `iptables -A INPUT -p tcp --dport 8081 -j ACCEPT` |
| "Web Crypto API not available" | keycloak-js muy nuevo + HTTP | Usar keycloak-js@18.0.1 |
| "Connection reset" a SQL Server | Problema de red/routing | Contactar equipo de redes |
| "ClassNotFoundException javax.*" | TomEE 9.x con código Java EE 8 | Usar TomEE 8.0.16-plume |
| "NoSuchProviderException" JavaMail | Dependencia incorrecta | Usar com.sun.mail:javax.mail:1.6.2 |
| Keycloak redirect loop | Redirect URIs incorrectas | Agregar URL en Keycloak Admin |
| Backend no conecta a DB desde Docker | network_mode bridge | Usar network_mode: host |
