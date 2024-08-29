import { Injectable } from '@angular/core';
import { SheetModel } from './models/sheet.model';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private selectedSheetId: number | null = null;
  private initialScore: number = 0;
  private players: { name: string }[] = [];

  constructor() {
    this.loadFromLocalStorage();
  }

  setInitialScore(score: number): void {
    this.initialScore = score;
    this.saveToLocalStorage();
  }

  getInitialScore(): number {
    return this.initialScore;
  }

  setPlayers(players: { name: string }[]): void {
    this.players = players;
    this.saveToLocalStorage();
  }

  getPlayers(): { name: string }[] {
    return this.players;
  }

  setSelectedSheet(sheetId: number): void {
    this.selectedSheetId = sheetId;
    this.saveToLocalStorage();
  }

  private saveToLocalStorage(): void {
    const data = {
      selectedSheetId: this.selectedSheetId,
      initialScore: this.initialScore,
      players: this.players,
    };
    localStorage.setItem('gameServiceData', JSON.stringify(data));
  }

  private loadFromLocalStorage(): void {
    const data = localStorage.getItem('gameServiceData');
    if (data) {
      const parsedData = JSON.parse(data);
      this.selectedSheetId = parsedData.selectedSheetId;
      this.initialScore = parsedData.initialScore;
      this.players = parsedData.players;
    }
  }
}
