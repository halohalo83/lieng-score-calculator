import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    // Dynamically set the API URL based on the environment
    this.apiUrl = this.getApiUrl();
  }

  private getApiUrl(): string {
    return environment.apiUrl;
  }

  public startGame() {
    return this.http.post(`${this.apiUrl}/start-game`, {});
  }
}
