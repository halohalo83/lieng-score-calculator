import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';
import { SheetModel } from './models/sheet.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = this.getApiUrl();
  }

  private getApiUrl(): string {
    return environment.apiUrl;
  }

  public startGame() {
    return this.http.post(`${this.apiUrl}/start-game`, {});
  }

  public getAllSheets() {
    return this.http.get(`${this.apiUrl}/get-all-sheets`);
  }

  public createSheet() {
    return this.http.post(`${this.apiUrl}/create-sheet`, {});
  }
}
