import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzInputNumberComponent } from 'ng-zorro-antd/input-number';
import { GameService } from '../game-service.service';

@Component({
  selector: 'app-score-entry',
  standalone: true,
  imports: [FormsModule, NzButtonComponent, NzInputNumberComponent, NgFor],
  templateUrl: './score-entry.component.html',
  styleUrl: './score-entry.component.scss'
})
export class ScoreEntryComponent {
  players: { name: string, score: number }[] = [];

  constructor(private router: Router, private gameService: GameService) { }

  ngOnInit(): void {
    this.players = this.gameService.getPlayers().map(player => ({ ...player, score: this.gameService.getInitialScore() }));
  }

  nextRound() {
    // Save the current round scores

    // repeat the same component with cleared inputs
    this.players = this.players.map(player => ({ ...player, score: this.gameService.getInitialScore() }));
  }

  finishGame() {
    // Save all scores and navigate to the result page
    this.router.navigate(['/result']);
  }
}
