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
import { NzSwitchModule } from 'ng-zorro-antd/switch';

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
    NzSwitchModule,
  ],
  templateUrl: './score-entry.component.html',
  styleUrl: './score-entry.component.scss',
})
export class ScoreEntryComponent {
  players: PlayerScoreModel[] = [];
  haveWinner: boolean = false;
  isRoundFinished = false;
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
          isWinner: false,
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
    this.clear();
  }

  clear() {
    this.players = this.players.map((player) => ({
      ...player,
      isPositive: false,
      isWinner: false,
      score: this.gameService.getInitialScore(),
    }));
    this.haveWinner = false;
    this.isRoundFinished = false;
  }

  deleteRound() {
    this.clear();
  }

  chooseWinner(player: PlayerScoreModel) {
    if (player.isWinner) {
      this.modal.confirm({
        nzTitle: `${player.name} ăn gà ?`,
        nzOnOk: () => this.setWinner(player.id),
        nzOkText: 'Đúng vậy',
        nzOnCancel: () => {
          this.setWinner(0);
        },
        nzCancelText: 'Đéo',
      });
    } else {
      this.setWinner(0);
    }
  }

  setWinner(playerId: number) {
    this.players = this.players.map((player) => ({
      ...player,
      isPositive: player.id === playerId,
      score:
        player.id === playerId
          ? this.getSumChicken()
          : this.gameService.getInitialScore(),
      isWinner: player.id === playerId,
    }));
    if (playerId === 0) {
      this.haveWinner = false;
    } else {
      this.haveWinner = true;
    }
  }

  getSumChicken() {
    const chicken = this.gameService.getInitialScore();
    return chicken * (this.players.length - 1);
  }

  checkChickenValidation() {
    var winnerChicken = this.players.filter(x => x.isWinner).reduce((acc, x) => acc + x.score, 0);
    var loserChicken = this.players.filter(x => !x.isWinner).reduce((acc, x) => acc + x.score, 0);
    return winnerChicken === loserChicken;
  }

  finishRound() {
    if(!this.checkChickenValidation()) {
      this.modal.error({
        nzTitle: 'Gà đéo khớp',
        nzContent: 'Vui lòng kiểm tra lại',
      });
      return;
    }
    else {
      this.isRoundFinished = true;
    }
  }

  finishGame() {
    // Save all scores and navigate to the result page
    this.router.navigate(['/result']);
  }

  back() {
    this.router.navigate(['/player-entry']);
  }
}
