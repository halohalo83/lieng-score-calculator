import { Injectable } from '@angular/core';
import { ParticipantModel } from './models/player.model';
@Injectable({
  providedIn: 'root',
})
export class GameService {
  private selectedSheetId: number = 0;
  private initialScore: number = 0;
  private participants: ParticipantModel[] = [];
  private gameIsRunning: boolean = false;
  private isSavedToRankings: boolean = false;

  constructor() {
    this.loadFromLocalStorage();
  }

  setSavedToRankings(isSaved: boolean): void {
    this.isSavedToRankings = isSaved;
    this.saveToLocalStorage();
  }

  getSavedToRankings(): boolean {
    return this.isSavedToRankings;
  }

  setGameIsRunning(isRunning: boolean): void {
    this.gameIsRunning = isRunning;
    this.saveToLocalStorage();
  }

  getGameIsRunning(): boolean {
    return this.gameIsRunning;
  }

  setInitialScore(score: number): void {
    this.initialScore = score;
    this.saveToLocalStorage();
  }

  getInitialScore(): number {
    return this.initialScore;
  }

  setSelectedSheet(sheetId: number): void {
    this.selectedSheetId = sheetId;
    this.saveToLocalStorage();
  }

  getSelectedSheet(): number {
    return this.selectedSheetId;
  }

  setParticipants(participants: ParticipantModel[]): void {
    this.participants = participants;
    this.saveToLocalStorage();
  }

  getParticipants(): ParticipantModel[] {
    return this.participants;
  }

  private saveToLocalStorage(): void {
    const data = {
      selectedSheetId: this.selectedSheetId,
      initialScore: this.initialScore,
      participants: this.participants,
      gameIsRunning: this.gameIsRunning,
      isSavedToRankings: this.isSavedToRankings,
    };
    localStorage.setItem('gameServiceData', JSON.stringify(data));
  }

  private loadFromLocalStorage(): void {
    const data = localStorage.getItem('gameServiceData');
    if (data) {
      const parsedData = JSON.parse(data);
      this.selectedSheetId = parsedData.selectedSheetId;
      this.initialScore = parsedData.initialScore;
      this.participants = parsedData.participants;
      this.gameIsRunning = parsedData.gameIsRunning;
      this.isSavedToRankings = parsedData.isSavedToRankings;
    }
  }
}
