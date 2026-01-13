#!/bin/bash
# Instalación rápida - Sistema INACIF para Debian 12
set -e

echo "=== Instalando Docker ==="
apt-get update
apt-get install -y ca-certificates curl gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian bookworm stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin git

echo "=== Clonando repositorios ==="
mkdir -p /opt/inacif && cd /opt/inacif

echo ""
echo "Tus repos son privados. Genera un token en:"
echo "https://github.com/settings/tokens (permiso: repo)"
echo ""
read -p "Token de GitHub: " GH_TOKEN

git clone https://$GH_TOKEN@github.com/DonyStreams/EPS-FRONTEND-USAC.git EPS-FRONTEND
git clone https://$GH_TOKEN@github.com/DonyStreams/MantenimientosBackend.git MantenimientosBackend

echo "=== Configurando ==="
SERVER_IP=$(hostname -I | awk '{print $1}')
cd /opt/inacif/EPS-FRONTEND

cat > src/environments/environment.prod.ts << EOF
export const environment = {
  production: true,
  apiUrl: 'http://$SERVER_IP:8081/MantenimientosBackend/api',
  keycloakUrl: 'http://$SERVER_IP:8080',
  keycloakRealm: 'MantenimientosINACIF',
  keycloakClientId: 'inacif-frontend'
};
EOF

cp .env.example .env

echo "=== Desplegando ==="
docker compose -f docker-compose.full.yml up -d --build

echo ""
echo "¡Listo! Accede a:"
echo "  Frontend: http://$SERVER_IP"
echo "  Backend:  http://$SERVER_IP:8081"
echo "  Keycloak: http://$SERVER_IP:8080"
