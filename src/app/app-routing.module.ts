import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { AppLayoutComponent } from "./layout/app.layout.component";
import { AuthGuard } from './guards/auth.guard';
import { AccesoDenegadoComponent } from './components/auth/acceso-denegado/acceso-denegado.component';

@NgModule({
    imports: [
        RouterModule.forRoot([
            { path: 'login', loadChildren: () => import('./demo/components/auth/auth.module').then(m => m.AuthModule) },
            {
                path: '', component: AppLayoutComponent, canActivate: [AuthGuard],
                children: [
                    { path: '', redirectTo: 'administracion/dashboard', pathMatch: 'full' },
                    { path: 'administracion', loadChildren: () => import('./components/pages/pages.module').then(m => m.PagesModule) }
                ]
            },
            { path: 'auth', loadChildren: () => import('./demo/components/auth/auth.module').then(m => m.AuthModule) },
            { path: 'acceso-denegado', component: AccesoDenegadoComponent },
            { path: 'notfound', component: NotfoundComponent },
            { path: '**', redirectTo: '/notfound' },
        ], { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled', onSameUrlNavigation: 'reload' })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
