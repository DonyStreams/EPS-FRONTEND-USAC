import { Component, OnInit } from '@angular/core';
import { KeycloakService } from '../../../service/keycloak.service';

@Component({
  selector: 'app-usuario-info',
  templateUrl: './usuario-info.component.html'
})
export class UsuarioInfoComponent implements OnInit {

  constructor(private keycloakService: KeycloakService) {}

  ngOnInit(): void {
    console.log('Usuario info cargado:', this.usuarioInfo);
  }

  get usuarioInfo() {
    return this.keycloakService.getUserInfo();
  }

  logout() {
    this.keycloakService.logout();
  }
}
