import { Component, OnInit } from '@angular/core';
import { KeycloakService } from '../../service/keycloak.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h2>Sistema de Mantenimientos INACIF</h2>
          <p>Ingrese sus credenciales para acceder al sistema</p>
        </div>
        
        <div class="login-content" *ngIf="!isLoggedIn">
          <button 
            type="button" 
            class="p-button p-button-lg p-button-primary login-button"
            (click)="login()">
            <i class="pi pi-sign-in"></i>
            Iniciar Sesión con Keycloak
          </button>
        </div>
        
        <div class="login-content" *ngIf="isLoggedIn">
          <div class="user-info">
            <h3>Bienvenido, {{ userInfo?.fullName || userInfo?.username }}</h3>
            <p><strong>Email:</strong> {{ userInfo?.email }}</p>
            <p><strong>Roles:</strong> {{ userInfo?.roles?.join(', ') }}</p>
          </div>
          
          <div class="login-actions">
            <button 
              type="button" 
              class="p-button p-button-lg p-button-success"
              (click)="goToDashboard()">
              <i class="pi pi-home"></i>
              Ir al Dashboard
            </button>
            
            <button 
              type="button" 
              class="p-button p-button-lg p-button-secondary"
              (click)="logout()">
              <i class="pi pi-sign-out"></i>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .login-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      padding: 3rem;
      max-width: 500px;
      width: 100%;
      text-align: center;
    }
    
    .login-header h2 {
      color: #333;
      margin-bottom: 0.5rem;
      font-size: 1.8rem;
    }
    
    .login-header p {
      color: #666;
      margin-bottom: 2rem;
    }
    
    .login-button {
      width: 100%;
      padding: 1rem;
      font-size: 1.1rem;
    }
    
    .user-info {
      margin-bottom: 2rem;
      text-align: left;
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
    }
    
    .user-info h3 {
      color: #28a745;
      margin-bottom: 1rem;
      text-align: center;
    }
    
    .user-info p {
      margin: 0.5rem 0;
      color: #333;
    }
    
    .login-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    
    .login-actions button {
      flex: 1;
      min-width: 200px;
    }
  `]
})
export class LoginComponent implements OnInit {
  isLoggedIn = false;
  userInfo: any = null;

  constructor(
    private keycloakService: KeycloakService,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkLoginStatus();
  }

  checkLoginStatus() {
    this.isLoggedIn = this.keycloakService.isLoggedIn();
    if (this.isLoggedIn) {
      this.userInfo = this.keycloakService.getUserInfo();
      console.log('User info:', this.userInfo);
    }
  }

  login() {
    this.keycloakService.login();
  }

  logout() {
    this.keycloakService.logout();
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
