import { Injectable } from '@angular/core';
import { ApiService } from '../services/api.service';

@Injectable({
    providedIn: 'root',
})
export class ScheduleController {
    constructor(private apiService: ApiService) { }

    create = (data: any) => {
        return this.apiService.post('schedule', data);
    }
}
