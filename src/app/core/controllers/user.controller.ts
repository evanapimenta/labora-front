import { Injectable } from '@angular/core';
import { ApiService } from '../services/api.service';

@Injectable({
    providedIn: 'root',
})
export class UserController {
    constructor(private apiService: ApiService) { }

    getById = (id: string) => {
        return this.apiService.get(`/users/${id}`);
    }

    update = (id: string, data: any) => {
        return this.apiService.put(`/users/${id}`, data);
    }
}
