import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { KeycloakInterceptor } from './interceptors/keycloak.interceptor';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppLayoutModule } from './layout/app.layout.module';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';

import { KeycloakService } from './service/keycloak.service';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from './shared/shared.module';
import { ButtonModule } from 'primeng/button';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AccesoDenegadoComponent } from './components/auth/acceso-denegado/acceso-denegado.component';

// Función para inicializar Keycloak
export function initializeKeycloak(keycloak: KeycloakService) {
  return () => keycloak.init();
}

@NgModule({
    declarations: [AppComponent, NotfoundComponent, AccesoDenegadoComponent],
    imports: [AppRoutingModule, AppLayoutModule, HttpClientModule, ButtonModule, SharedModule],
    providers: [
        { provide: LocationStrategy, useClass: PathLocationStrategy },
        MessageService, ConfirmationService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: KeycloakInterceptor,
            multi: true
        },
        {
            provide: APP_INITIALIZER,
            useFactory: initializeKeycloak,
            deps: [KeycloakService],
            multi: true
        }
    ],
    
    bootstrap: [AppComponent],
})
export class AppModule {}
