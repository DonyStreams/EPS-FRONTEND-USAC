import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Participantes } from '../api/participantes';

@Injectable()
export class ParticipanteService {

    constructor(private http: HttpClient) { }

    getParticipantes() {
        
        return this.http.get<any>('assets/data/participantes.json')
            .toPromise()
            .then(res => {
                console.log(res.data);
                return res.data as Participantes[]})
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
