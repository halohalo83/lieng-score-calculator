import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { indexOf } from 'lodash';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ApiService } from '../../api.service';
import { GameService } from '../../game-service.service';
import { PlayerRanking, PlayerScoreModel } from '../../models/player.model';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [
    NzTableModule,
    NgxSpinnerModule,
    NzGridModule,
    NzButtonComponent,
    NgFor,
    NzModalModule,
  ],
  templateUrl: './result.component.html',
  styleUrl: './result.component.scss',
})
export class ResultComponent {
  isAuth: boolean = false;
  isSaved: boolean = true;
  roundScores: number[] = [];
  constructor(
    private router: Router,
    private apiService: ApiService,
    private gameService: GameService,
    private modal: NzModalService
  ) {
    this.checkAuth();
  }

  players: PlayerRanking[] = [];

  async checkAuth() {
    const response = await this.apiService.checkAuth();
    if (response.success) {
      this.isAuth = true;
      this.getRoundScores();
      this.isSaved = this.gameService.getSavedToRankings();
    }
  }

  getRoundScores() {
    this.apiService
      .getRoundScores(this.gameService.getSelectedSheet())
      .then((response) => {
        if (response.success) {
          this.roundScores = response.scores;
          this.getPlayers();
        }
      });
  }

  getPlayers() {
    this.players = this.gameService.getParticipants().map((player, index) => {
      return {
        rank: this.getRanking(this.roundScores[index]),
        id: player.id,
        name: player.name,
        score: this.roundScores[index],
      } as PlayerRanking;
    });

    this.players.sort((a, b) => a.rank - b.rank);
  }

  getRanking(score: Number) {
    // arrange the scores in descending order
    let scores = this.roundScores.slice().sort((a, b) => b - a);

    return indexOf(scores, score) + 1;
  }

  back() {
    this.router.navigate(['/score-entry']);
  }

  refresh() {
    this.getRoundScores();
  }

  saveScoresToRankings() {
    const players = this.players.map((player) => {
      return {
        id: player.id,
        name: player.name,
        score: player.score,
      } as PlayerScoreModel;
    });

    this.apiService.saveScoresToRankings(players).then(
      (response) => {
        if (response.success) {
          this.isSaved = true;
          this.gameService.setSavedToRankings(true);
        }
      },
      (error) => {
        if (error.status === 403) {
          this.modal.error({
            nzTitle: 'Lỗi',
            nzContent: 'Bạn đéo có quyền thao tác',
          });
        }
      }
    );
  }
  backToMenu() {
    this.router.navigate(['/']);
  }
}
