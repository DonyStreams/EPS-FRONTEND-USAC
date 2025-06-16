import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Usuarios } from '../api/usuarios';

@Injectable()
export class UsuarioService {

    constructor(private http: HttpClient) { }

    getUsuarios() {
        return this.http.get<any>('assets/data/usuarios.json')
            .toPromise()
            .then(res => res.data as Usuarios[])
            .then(data => data);
    }

    /*getProductsSmall() {
        return this.http.get<any>('assets/demo/data/products-small.json')
            .toPromise()
            .then(res => res.data as Product[])
            .then(data => data);
    }

 

    getProductsMixed() {
        return this.http.get<any>('assets/demo/data/products-mixed.json')
            .toPromise()
            .then(res => res.data as Product[])
            .then(data => data);
    }

    getProductsWithOrdersSmall() {
        return this.http.get<any>('assets/demo/data/products-orders-small.json')
            .toPromise()
            .then(res => res.data as Product[])
            .then(data => data);
    }*/
}
