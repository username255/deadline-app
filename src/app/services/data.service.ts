import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DeadlineResponse } from '../utils/deadline-response.interface';
import { API_ROUTES } from '../utils/api-routes';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private readonly http: HttpClient) {}

  getDeadline(): Observable<DeadlineResponse> {
    return this.http.get<DeadlineResponse>(API_ROUTES.DEADLINE);
  }
}
