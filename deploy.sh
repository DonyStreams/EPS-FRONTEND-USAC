#!/bin/bash
# ==========================================================
# Script de Despliegue - Sistema de Mantenimientos INACIF
# ==========================================================

set -e

echo "=============================================="
echo "  Sistema de Mantenimientos INACIF"
echo "  Script de Despliegue Docker"
echo "=============================================="

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
info() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Verificar Docker
if ! command -v docker &> /dev/null; then
    error "Docker no está instalado. Por favor, instale Docker primero."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose no está instalado. Por favor, instálelo primero."
    exit 1
fi

info "Docker y Docker Compose detectados correctamente."

# Verificar archivo .env
if [ ! -f ".env" ]; then
    warn "Archivo .env no encontrado. Creando desde .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        info "Archivo .env creado. Por favor, edítelo con sus valores antes de continuar."
        exit 0
    else
        error "No se encontró .env.example"
        exit 1
    fi
fi

# Menú de opciones
echo ""
echo "Seleccione una opción:"
echo "1) Desplegar sistema completo (Frontend + Backend + Keycloak + BD)"
echo "2) Desplegar solo Frontend"
echo "3) Desplegar solo Backend"
echo "4) Ver logs de todos los servicios"
echo "5) Detener todos los servicios"
echo "6) Reiniciar todos los servicios"
echo "7) Ver estado de los contenedores"
echo "8) Salir"
echo ""
read -p "Opción: " opcion

case $opcion in
    1)
        info "Desplegando sistema completo..."
        docker-compose -f docker-compose.full.yml up -d --build
        info "Sistema desplegado. Esperando a que los servicios estén listos..."
        sleep 30
        docker-compose -f docker-compose.full.yml ps
        echo ""
        info "URLs de acceso:"
        echo "  - Frontend: http://localhost"
        echo "  - Backend:  http://localhost:8081/MantenimientosBackend/api"
        echo "  - Keycloak: http://localhost:8080"
        ;;
    2)
        info "Desplegando solo Frontend..."
        docker-compose up frontend-prod -d --build
        info "Frontend desplegado en http://localhost"
        ;;
    3)
        info "Desplegando solo Backend..."
        cd ../MantenimientosBackend
        mvn clean package -DskipTests
        docker-compose up -d --build
        info "Backend desplegado en http://localhost:8081/MantenimientosBackend/"
        ;;
    4)
        info "Mostrando logs..."
        docker-compose -f docker-compose.full.yml logs -f
        ;;
    5)
        info "Deteniendo todos los servicios..."
        docker-compose -f docker-compose.full.yml down
        info "Servicios detenidos."
        ;;
    6)
        info "Reiniciando servicios..."
        docker-compose -f docker-compose.full.yml restart
        info "Servicios reiniciados."
        ;;
    7)
        docker-compose -f docker-compose.full.yml ps
        ;;
    8)
        info "Saliendo..."
        exit 0
        ;;
    *)
        error "Opción no válida"
        exit 1
        ;;
esac

echo ""
info "Operación completada."
