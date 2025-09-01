import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { KeycloakInterceptor } from './interceptors/keycloak.interceptor';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HashLocationStrategy, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppLayoutModule } from './layout/app.layout.module';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { ProductService } from './demo/service/product.service';
import { CountryService } from './demo/service/country.service';
import { CustomerService } from './demo/service/customer.service';
import { EventService } from './demo/service/event.service';
import { IconService } from './demo/service/icon.service';
import { NodeService } from './demo/service/node.service';
import { PhotoService } from './demo/service/photo.service';

import { ParticipanteService } from './service/participantes.service';
import { KeycloakService } from './service/keycloak.service';
import { HttpClientModule } from '@angular/common/http';
import { HasRoleDirective } from './directives/has-role.directive';
import { ButtonModule } from 'primeng/button';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AccesoDenegadoComponent } from './components/auth/acceso-denegado/acceso-denegado.component';

// Función para inicializar Keycloak
export function initializeKeycloak(keycloak: KeycloakService) {
  return () => keycloak.init();
}

@NgModule({
    declarations: [AppComponent, NotfoundComponent, HasRoleDirective, AccesoDenegadoComponent],
    imports: [AppRoutingModule, AppLayoutModule, HttpClientModule, ButtonModule],
    providers: [
        { provide: LocationStrategy, useClass: PathLocationStrategy },
        CountryService, CustomerService, EventService, IconService, NodeService,
        PhotoService, ProductService, ParticipanteService,
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
