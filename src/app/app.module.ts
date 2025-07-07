import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { KeycloakInterceptor } from './interceptors/keycloak.interceptor';
import { NgModule } from '@angular/core';
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

import { UsuarioService } from './service/usuario.service';
import { ParticipanteService } from './service/participantes.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
    declarations: [AppComponent, NotfoundComponent],
    imports: [AppRoutingModule, AppLayoutModule, HttpClientModule],
    providers: [
        { provide: LocationStrategy, useClass: PathLocationStrategy },
        CountryService, CustomerService, EventService, IconService, NodeService,
        PhotoService, ProductService, UsuarioService,ParticipanteService,
        {
    provide: HTTP_INTERCEPTORS,
    useClass: KeycloakInterceptor,
    multi: true
    }        
    ],
    
    bootstrap: [AppComponent],
})
export class AppModule {}
