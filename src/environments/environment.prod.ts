// IMPORTANTE: Modificar estas URLs antes de compilar para producción
// O usar variables de entorno en tiempo de build
export const environment = {
  production: true,
  // Cambiar por la IP/dominio del servidor de producción
  apiUrl: 'http://172.16.1.192:8081/MantenimientosBackend/api',
  keycloakUrl: 'http://172.16.1.192:8080',
  keycloakRealm: 'MantenimientosINACIF',
  keycloakClientId: 'inacif-frontend',
  enableConsole: false
};
