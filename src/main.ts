import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (!environment.enableConsole) {
  console.log = () => undefined;
  console.warn = () => undefined;
  console.error = () => undefined;
  console.debug = () => undefined;
}

// Arrancar la aplicación directamente
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(() => undefined);

// init();