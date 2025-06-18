import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
// import { KeycloakService } from './app/service/keycloak.service';

// Creamos una instancia manual del servicio
// const keycloakService = new KeycloakService();

// keycloakService.init().then(() => {
//   platformBrowserDynamic().bootstrapModule(AppModule)
//     .catch(err => console.error(err));
// }).catch(err => {
//   console.error('Error al inicializar Keycloak', err);
// });

// Nuevo init sin Keycloak
function init() {
  platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));
}

init();