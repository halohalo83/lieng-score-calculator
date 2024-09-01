import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from '../environments/environment';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import {
  ParticipantModel,
  PlayerModel,
  PlayerScoreModel,
  PlayerScoreViewModel,
} from './models/player.model';
import { GameService } from './game-service.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(
    private spinner: NgxSpinnerService,
    private gameService: GameService
  ) {
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
      console.error('Error checking auth:', error);
    } finally {
      this.spinner.hide();
    }
  }

  public async getAuthUrl() {
    this.spinner.show();
    try {
      const response = await axios.get(`${this.apiUrl}/get-auth-url`);
      return response.data;
    } catch (error) {
      console.error('Error getting auth url:', error);
      throw error;
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

  public async configSelectedSheet() {
    this.spinner.show();
    try {
      const response = await axios.post(
        `${this.apiUrl}/config-selected-sheet`,
        {
          sheetId: this.gameService.getSelectedSheet(),
          players: this.gameService
            .getParticipants()
            .map((x) => ({ id: x.id, name: x.name } as PlayerModel)),
          initialScore: this.gameService.getInitialScore(),
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error pre-config selected sheet:', error);
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

  public async deleteSheet(sheetId: number) {
    this.spinner.show();
    try {
      const response = await axios.delete(
        `${this.apiUrl}/delete-sheet/${sheetId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting sheet:', error);
      throw error;
    } finally {
      this.spinner.hide();
    }
  }

  public async checkSheet(sheetId: number) {
    this.spinner.show();
    try {
      const response = await axios.get(`${this.apiUrl}/check-data/${sheetId}`);
      return response.data.hasData;
    } catch (error) {
      console.error('Error checking sheet:', error);
      throw error;
    } finally {
      this.spinner.hide();
    }
  }

  public async getAllPlayers() {
    this.spinner.show();
    try {
      const response = await axios.get(`${this.apiUrl}/get-all-players`);
      return response.data;
    } catch (error) {
      console.error('Error getting all players:', error);
      throw error;
    } finally {
      this.spinner.hide();
    }
  }

  public async getRankings() {
    this.spinner.show();
    try {
      const response = await axios.get(`${this.apiUrl}/get-rankings`);
      return response.data;
    } catch (error) {
      console.error('Error getting rankings:', error);
      throw error;
    } finally {
      this.spinner.hide();
    }
  }

  public async fillRoundScores(players: PlayerScoreModel[]) {
    this.spinner.show();
    try {
      const response = await axios.post(`${this.apiUrl}/fill-round-scores`, {
        players,
        initialScore: this.gameService.getInitialScore(),
        sheetId: this.gameService.getSelectedSheet(),
      });
      return response.data;
    } catch (error) {
      console.error('Error filling round scores:', error);
      throw error;
    } finally {
      this.spinner.hide();
    }
  }

  public async deleteTheLastRound() {
    this.spinner.show();
    try {
      const response = await axios.delete(
        `${this.apiUrl}/delete-last-round/${this.gameService.getSelectedSheet()}`
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting the last round:', error);
      throw error;
    } finally {
      this.spinner.hide();
    }
  }
}
