import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

// Arrancar la aplicación directamente
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error('Error al arrancar la aplicación:', err));

// init();