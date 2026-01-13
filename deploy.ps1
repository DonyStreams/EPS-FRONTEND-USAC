# ==========================================================
# Script de Despliegue - Sistema de Mantenimientos INACIF
# Para Windows PowerShell
# ==========================================================

param(
    [Parameter()]
    [ValidateSet("full", "frontend", "backend", "logs", "stop", "restart", "status")]
    [string]$Action = "menu"
)

$ErrorActionPreference = "Stop"

function Write-Info { param($msg) Write-Host "[INFO] $msg" -ForegroundColor Green }
function Write-Warn { param($msg) Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Err { param($msg) Write-Host "[ERROR] $msg" -ForegroundColor Red }

Write-Host "=============================================="
Write-Host "  Sistema de Mantenimientos INACIF"
Write-Host "  Script de Despliegue Docker"
Write-Host "=============================================="
Write-Host ""

# Verificar Docker
try {
    docker --version | Out-Null
    docker-compose --version | Out-Null
    Write-Info "Docker y Docker Compose detectados correctamente."
} catch {
    Write-Err "Docker o Docker Compose no están instalados."
    exit 1
}

# Verificar .env
if (-not (Test-Path ".env")) {
    Write-Warn "Archivo .env no encontrado. Creando desde .env.example..."
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Info "Archivo .env creado. Edítelo con sus valores antes de continuar."
        notepad .env
        exit 0
    } else {
        Write-Err "No se encontró .env.example"
        exit 1
    }
}

function Show-Menu {
    Write-Host ""
    Write-Host "Seleccione una opcion:"
    Write-Host "1) Desplegar sistema completo (Frontend + Backend + Keycloak + BD)"
    Write-Host "2) Desplegar solo Frontend"
    Write-Host "3) Desplegar solo Backend"
    Write-Host "4) Ver logs de todos los servicios"
    Write-Host "5) Detener todos los servicios"
    Write-Host "6) Reiniciar todos los servicios"
    Write-Host "7) Ver estado de los contenedores"
    Write-Host "8) Salir"
    Write-Host ""
    $opcion = Read-Host "Opcion"
    
    switch ($opcion) {
        "1" { Deploy-Full }
        "2" { Deploy-Frontend }
        "3" { Deploy-Backend }
        "4" { Show-Logs }
        "5" { Stop-Services }
        "6" { Restart-Services }
        "7" { Show-Status }
        "8" { exit 0 }
        default { Write-Err "Opcion no valida"; Show-Menu }
    }
}

function Deploy-Full {
    Write-Info "Desplegando sistema completo..."
    docker-compose -f docker-compose.full.yml up -d --build
    Write-Info "Sistema desplegado. Esperando a que los servicios esten listos..."
    Start-Sleep -Seconds 30
    docker-compose -f docker-compose.full.yml ps
    Write-Host ""
    Write-Info "URLs de acceso:"
    Write-Host "  - Frontend: http://localhost"
    Write-Host "  - Backend:  http://localhost:8081/MantenimientosBackend/api"
    Write-Host "  - Keycloak: http://localhost:8080"
}

function Deploy-Frontend {
    Write-Info "Desplegando solo Frontend..."
    docker-compose up frontend-prod -d --build
    Write-Info "Frontend desplegado en http://localhost"
}

function Deploy-Backend {
    Write-Info "Compilando Backend..."
    Push-Location ..\MantenimientosBackend
    mvn clean package -DskipTests
    Write-Info "Desplegando Backend..."
    docker-compose up -d --build
    Pop-Location
    Write-Info "Backend desplegado en http://localhost:8081/MantenimientosBackend/"
}

function Show-Logs {
    Write-Info "Mostrando logs..."
    docker-compose -f docker-compose.full.yml logs -f
}

function Stop-Services {
    Write-Info "Deteniendo todos los servicios..."
    docker-compose -f docker-compose.full.yml down
    Write-Info "Servicios detenidos."
}

function Restart-Services {
    Write-Info "Reiniciando servicios..."
    docker-compose -f docker-compose.full.yml restart
    Write-Info "Servicios reiniciados."
}

function Show-Status {
    docker-compose -f docker-compose.full.yml ps
}

# Ejecutar según parámetro o mostrar menú
switch ($Action) {
    "full" { Deploy-Full }
    "frontend" { Deploy-Frontend }
    "backend" { Deploy-Backend }
    "logs" { Show-Logs }
    "stop" { Stop-Services }
    "restart" { Restart-Services }
    "status" { Show-Status }
    default { Show-Menu }
}

Write-Host ""
Write-Info "Operacion completada."
