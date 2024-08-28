import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GameService {
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
}
