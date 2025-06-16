import { Injectable } from '@angular/core';
import * as Keycloak from 'keycloak-js';

@Injectable({
  providedIn: 'root',
})
export class KeycloakService {
  private keycloakInstance: Keycloak.KeycloakInstance;

  init(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    this.keycloakInstance = Keycloak({
      url: 'http://localhost:8080',
      realm: 'demo',
      clientId: 'my-angular-client',
    });

    this.keycloakInstance.init({ onLoad: 'login-required' })
      .success(authenticated => {
        console.log('[Keycloak] authenticated', authenticated);
        resolve(authenticated);
      })
      .error(err => {
        console.error('[Keycloak] Init failed', err);
        reject(err);
      });
  });
}


  getToken(): string | undefined {
    return this.keycloakInstance?.token;
  }

  getUsername(): string | undefined {
    return this.keycloakInstance?.tokenParsed?.['preferred_username'];
  }

  logout(): void {
    this.keycloakInstance.logout();
  }

  isLoggedIn(): boolean {
  return this.keycloakInstance?.authenticated ?? false;
}

login(): void {
  this.keycloakInstance?.login();
}
}
