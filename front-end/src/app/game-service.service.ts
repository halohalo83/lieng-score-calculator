import { Injectable } from '@angular/core';
import { SheetModel } from './models/sheet.model';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private selectedSheetId: number | null = null;
  private initialScore: number;
  private players: { name: string }[] = [];
  constructor() {
    this.initialScore = 0; // Default value, you can change it as needed
  }

  setInitialScore(score: number): void {
    this.initialScore = score;
  }

  getInitialScore(): number {
    return this.initialScore;
  }

  setPlayers(players: { name: string }[]): void {
    this.players = players;
  }

  getPlayers(): { name: string }[] {
    return this.players;
  }

  setSelectedSheet(sheetId: number): void {
    this.selectedSheetId = sheetId;
  }
}
