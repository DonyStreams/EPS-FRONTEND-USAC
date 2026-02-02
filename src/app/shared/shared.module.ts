import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HasRoleDirective } from '../directives/has-role.directive';
import { TienePermisoDirective } from '../directives/tiene-permiso.directive';

@NgModule({
    declarations: [HasRoleDirective, TienePermisoDirective],
    imports: [CommonModule],
    exports: [HasRoleDirective, TienePermisoDirective]
})
export class SharedModule {}
