#!/bin/bash
# ==========================================================
# SCRIPT DE INSTALACIÓN COMPLETA - Sistema INACIF
# Ejecutar como: sudo bash instalar-servidor.sh
# ==========================================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info() { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }
step() { echo -e "\n${BLUE}==>${NC} $1"; }

# Verificar root
if [ "$EUID" -ne 0 ]; then
    error "Este script debe ejecutarse como root. Usa: sudo bash instalar-servidor.sh"
fi

echo ""
echo "=========================================="
echo "  Sistema de Mantenimientos INACIF"
echo "  Instalación Automática para Linux"
echo "=========================================="
echo ""

# Detectar distribución
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    VERSION=$VERSION_ID
    info "Sistema detectado: $PRETTY_NAME"
else
    error "No se pudo detectar el sistema operativo"
fi

# ==========================================
# PASO 1: Instalar Docker
# ==========================================
step "Instalando Docker..."

if command -v docker &> /dev/null; then
    info "Docker ya está instalado: $(docker --version)"
else
    case $OS in
        ubuntu|debian)
            apt-get update
            apt-get install -y ca-certificates curl gnupg lsb-release
            install -m 0755 -d /etc/apt/keyrings
            curl -fsSL https://download.docker.com/linux/$OS/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
            chmod a+r /etc/apt/keyrings/docker.gpg
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$OS $VERSION_CODENAME stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
            apt-get update
            apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
            ;;
        centos|rhel|rocky|almalinux)
            yum install -y yum-utils
            yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
            yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
            ;;
        fedora)
            dnf install -y dnf-plugins-core
            dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo
            dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
            ;;
        *)
            warn "Distribución no reconocida, intentando instalación genérica..."
            curl -fsSL https://get.docker.com -o get-docker.sh
            sh get-docker.sh
            rm get-docker.sh
            ;;
    esac
    
    systemctl start docker
    systemctl enable docker
    info "Docker instalado correctamente"
fi

# ==========================================
# PASO 2: Instalar Git
# ==========================================
step "Instalando Git..."

if command -v git &> /dev/null; then
    info "Git ya está instalado: $(git --version)"
else
    case $OS in
        ubuntu|debian)
            apt-get install -y git
            ;;
        centos|rhel|rocky|almalinux|fedora)
            yum install -y git || dnf install -y git
            ;;
    esac
    info "Git instalado correctamente"
fi

# ==========================================
# PASO 3: Crear directorio y clonar repos
# ==========================================
step "Configurando directorio de trabajo..."

INSTALL_DIR="/opt/inacif"
mkdir -p $INSTALL_DIR
cd $INSTALL_DIR

# Preguntar URLs de repositorios
echo ""
warn "Ingresa las URLs de tus repositorios Git:"
echo ""

read -p "URL del repositorio Frontend (EPS-FRONTEND): " FRONTEND_REPO
read -p "URL del repositorio Backend (MantenimientosBackend): " BACKEND_REPO

if [ -z "$FRONTEND_REPO" ] || [ -z "$BACKEND_REPO" ]; then
    error "Debes proporcionar ambas URLs de repositorio"
fi

# Clonar o actualizar repositorios
if [ -d "EPS-FRONTEND" ]; then
    info "Frontend ya existe, actualizando..."
    cd EPS-FRONTEND && git pull && cd ..
else
    info "Clonando Frontend..."
    git clone $FRONTEND_REPO EPS-FRONTEND
fi

if [ -d "MantenimientosBackend" ]; then
    info "Backend ya existe, actualizando..."
    cd MantenimientosBackend && git pull && cd ..
else
    info "Clonando Backend..."
    git clone $BACKEND_REPO MantenimientosBackend
fi

# ==========================================
# PASO 4: Configurar variables de entorno
# ==========================================
step "Configurando variables de entorno..."

cd $INSTALL_DIR/EPS-FRONTEND

# Obtener IP del servidor
SERVER_IP=$(hostname -I | awk '{print $1}')
info "IP del servidor detectada: $SERVER_IP"

echo ""
warn "Configuración de servicios:"
read -p "Puerto para Frontend [80]: " FRONTEND_PORT
FRONTEND_PORT=${FRONTEND_PORT:-80}

read -p "Puerto para Backend [8081]: " BACKEND_PORT
BACKEND_PORT=${BACKEND_PORT:-8081}

read -p "Puerto para Keycloak [8080]: " KEYCLOAK_PORT
KEYCLOAK_PORT=${KEYCLOAK_PORT:-8080}

read -p "Contraseña para base de datos [InacifDB2024!]: " DB_PASSWORD
DB_PASSWORD=${DB_PASSWORD:-InacifDB2024!}

read -p "Contraseña para Keycloak admin [Admin2024!]: " KC_PASSWORD
KC_PASSWORD=${KC_PASSWORD:-Admin2024!}

# Crear archivo .env
cat > .env << EOF
# Configuración generada automáticamente
# Fecha: $(date)
# Servidor: $SERVER_IP

FRONTEND_PORT=$FRONTEND_PORT
BACKEND_PORT=$BACKEND_PORT
KEYCLOAK_PORT=$KEYCLOAK_PORT

DB_PASSWORD=$DB_PASSWORD
DB_NAME=MantenimientosINACIF

KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=$KC_PASSWORD

API_URL=http://$SERVER_IP:$BACKEND_PORT/MantenimientosBackend/api
KEYCLOAK_URL=http://$SERVER_IP:$KEYCLOAK_PORT
EOF

info "Archivo .env creado"

# ==========================================
# PASO 5: Actualizar environment.prod.ts
# ==========================================
step "Configurando URLs de producción en Angular..."

ENV_FILE="$INSTALL_DIR/EPS-FRONTEND/src/environments/environment.prod.ts"
cat > $ENV_FILE << EOF
export const environment = {
  production: true,
  apiUrl: 'http://$SERVER_IP:$BACKEND_PORT/MantenimientosBackend/api',
  keycloakUrl: 'http://$SERVER_IP:$KEYCLOAK_PORT',
  keycloakRealm: 'MantenimientosINACIF',
  keycloakClientId: 'inacif-frontend'
};
EOF

info "environment.prod.ts actualizado con IP: $SERVER_IP"

# ==========================================
# PASO 6: Desplegar con Docker
# ==========================================
step "Desplegando contenedores Docker..."

cd $INSTALL_DIR/EPS-FRONTEND

info "Construyendo y desplegando contenedores (esto puede tardar varios minutos)..."
docker compose -f docker-compose.full.yml up -d --build

# ==========================================
# PASO 7: Configurar Firewall
# ==========================================
step "Configurando Firewall..."

if command -v ufw &> /dev/null; then
    ufw allow $FRONTEND_PORT/tcp
    ufw allow $BACKEND_PORT/tcp
    ufw allow $KEYCLOAK_PORT/tcp
    ufw --force enable
    info "Firewall UFW configurado"
elif command -v firewall-cmd &> /dev/null; then
    firewall-cmd --permanent --add-port=$FRONTEND_PORT/tcp
    firewall-cmd --permanent --add-port=$BACKEND_PORT/tcp
    firewall-cmd --permanent --add-port=$KEYCLOAK_PORT/tcp
    firewall-cmd --reload
    info "Firewall firewalld configurado"
else
    warn "No se detectó firewall, asegúrate de abrir los puertos manualmente"
fi

# Esperar a que los servicios estén listos
info "Esperando a que los servicios inicien (90 segundos)..."
sleep 90

# ==========================================
# PASO 8: Verificar servicios
# ==========================================
step "Verificando servicios..."

docker compose -f docker-compose.full.yml ps

echo ""
echo "=========================================="
echo -e "${GREEN}  ¡INSTALACIÓN COMPLETADA!${NC}"
echo "=========================================="
echo ""
echo "URLs de acceso:"
echo -e "  ${BLUE}Frontend:${NC}  http://$SERVER_IP:$FRONTEND_PORT"
echo -e "  ${BLUE}Backend:${NC}   http://$SERVER_IP:$BACKEND_PORT/MantenimientosBackend/api"
echo -e "  ${BLUE}Keycloak:${NC}  http://$SERVER_IP:$KEYCLOAK_PORT"
echo ""
echo "Credenciales Keycloak:"
echo "  Usuario: admin"
echo "  Contraseña: $KC_PASSWORD"
echo ""
echo "Comandos útiles:"
echo "  Ver logs:      cd $INSTALL_DIR/EPS-FRONTEND && docker compose -f docker-compose.full.yml logs -f"
echo "  Reiniciar:     cd $INSTALL_DIR/EPS-FRONTEND && docker compose -f docker-compose.full.yml restart"
echo "  Detener:       cd $INSTALL_DIR/EPS-FRONTEND && docker compose -f docker-compose.full.yml down"
echo ""
