import { Injectable } from '@angular/core';
import { ApiService } from '../services/api.service';

@Injectable({
    providedIn: 'root',
})
export class TestController {
    constructor(private apiService: ApiService) { }

    getAll = (size: number = 100) => {
        return this.apiService.get(`/tests?size=${size}`);
    }
}
