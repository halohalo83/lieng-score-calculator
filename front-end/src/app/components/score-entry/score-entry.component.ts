import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzInputNumberComponent } from 'ng-zorro-antd/input-number';
import { GameService } from '../../game-service.service';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NgxSpinnerModule } from 'ngx-spinner';
import { FlipCardComponent } from '../flip-card/flip-card.component';
import { PlayerScoreModel } from '../../models/player.model';
import { ApiService } from '../../api.service';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-score-entry',
  standalone: true,
  imports: [
    FormsModule,
    NzButtonComponent,
    NzInputNumberComponent,
    NgFor,
    NzTableModule,
    NgxSpinnerModule,
    NzGridModule,
    FlipCardComponent,
    NzModalModule,
  ],
  templateUrl: './score-entry.component.html',
  styleUrl: './score-entry.component.scss',
})
export class ScoreEntryComponent {
  players: PlayerScoreModel[] = [];

  constructor(
    private router: Router,
    private gameService: GameService,
    private apiService: ApiService,
    private modal: NzModalService
  ) {}

  ngOnInit(): void {
    this.checkAuth();
  }

  getPlayers() {
    this.players = this.gameService.getParticipants().map(
      (player) =>
        ({
          id: player.id,
          name: player.name,
          isPositive: false,
          score: this.gameService.getInitialScore(),
        } as PlayerScoreModel)
    );
  }

  async checkAuth() {
    const response = await this.apiService.checkAuth();
    if (response.success) {
      this.getPlayers();
    }
  }

  nextRound() {
    // this.players = this.players.map((player) => ({
    //   ...player,
    //   isPositive: false,
    //   score: this.gameService.getInitialScore(),
    // }));

    console.log(this.players, 'players');

  }

  finishGame() {
    // Save all scores and navigate to the result page
    this.router.navigate(['/result']);
  }

  back() {
    this.router.navigate(['/player-entry']);
  }
}
