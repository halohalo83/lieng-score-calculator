import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from '../environments/environment';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private spinner: NgxSpinnerService) {
    this.apiUrl = this.getApiUrl();
  }

  private getApiUrl(): string {
    return this.apiUrl;
  }

  public async checkAuth() {
    this.spinner.show();
    try {
      const response = await axios.get(`${this.apiUrl}/check-auth`);
      return response.data;
    } catch (error) {
      alert('You are not authenticated. Check the console for more information.');
      console.error('Error checking auth:', error);
    } finally {
      this.spinner.hide();
    }
  }

  public async getAllSheets() {
    this.spinner.show();
    try {
      const response = await axios.get(`${this.apiUrl}/get-all-sheets`);
      return response.data;
    } catch (error) {
      console.error('Error getting all sheets:', error);
      throw error;
    } finally {
      this.spinner.hide();
    }
  }

  public async createSheet() {
    this.spinner.show();
    try {
      const response = await axios.post(`${this.apiUrl}/create-sheet`, {});
      return response.data;
    } catch (error) {
      console.error('Error creating sheet:', error);
      throw error;
    } finally {
      this.spinner.hide();
    }
  }
}
