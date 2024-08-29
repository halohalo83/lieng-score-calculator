import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
    this.apiUrl = this.getApiUrl();
  }

  private getApiUrl(): string {
    return this.apiUrl;
  }

  public async startGame() {
    try {
      const response = await axios.post(`${this.apiUrl}/start-game`, {});
      return response.data;
    } catch (error) {
      console.error('Error starting game:', error);
      throw error;
    }
  }

  public async getAllSheets() {
    try {
      const response = await axios.get(`${this.apiUrl}/get-all-sheets`);
      return response.data;
    } catch (error) {
      console.error('Error getting all sheets:', error);
      throw error;
    }
  }

  public async createSheet() {
    try {
      const response = await axios.post(`${this.apiUrl}/create-sheet`, {});
      return response.data;
    } catch (error) {
      console.error('Error creating sheet:', error);
      throw error;
    }
  }
}
