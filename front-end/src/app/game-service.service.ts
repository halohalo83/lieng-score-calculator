import { Injectable } from '@angular/core';
import { SheetModel } from './models/sheet.model';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private selectedSheetId: number | null = null;
  private initialScore: number = 0;

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

  setSelectedSheet(sheetId: number): void {
    this.selectedSheetId = sheetId;
    this.saveToLocalStorage();
  }

  private saveToLocalStorage(): void {
    const data = {
      selectedSheetId: this.selectedSheetId,
      initialScore: this.initialScore,
    };
    localStorage.setItem('gameServiceData', JSON.stringify(data));
  }

  private loadFromLocalStorage(): void {
    const data = localStorage.getItem('gameServiceData');
    if (data) {
      const parsedData = JSON.parse(data);
      this.selectedSheetId = parsedData.selectedSheetId;
      this.initialScore = parsedData.initialScore;
    }
  }
}
