import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';
import { KeycloakService } from '../service/keycloak.service';

@Directive({
  selector: '[appHasRole]'
})
export class HasRoleDirective implements OnInit {
  private roles: string[] = [];
  private _requireAll: boolean = false;

  @Input() set appHasRole(roles: string | string[]) {
    this.roles = Array.isArray(roles) ? roles : [roles];
    this.updateView();
  }

  @Input() set requireAll(value: boolean) {
    this._requireAll = value;
    this.updateView();
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private keycloakService: KeycloakService
  ) {}

  ngOnInit() {
    this.updateView();
  }

  private updateView() {
    if (this.hasRequiredRoles()) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }

  private hasRequiredRoles(): boolean {
    if (this.roles.length === 0) {
      return true; // Si no hay roles definidos, mostrar por defecto
    }

    if (this._requireAll) {
      // Requiere TODOS los roles
      return this.roles.every(role => this.keycloakService.hasRole(role));
    } else {
      // Requiere AL MENOS UNO de los roles
      return this.keycloakService.hasAnyRole(this.roles);
    }
  }
}
