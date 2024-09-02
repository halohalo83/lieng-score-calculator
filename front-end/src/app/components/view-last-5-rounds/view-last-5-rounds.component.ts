import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputNumberComponent } from 'ng-zorro-antd/input-number';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ApiService } from '../../api.service';
import { GameService } from '../../game-service.service';

@Component({
  selector: 'app-view-last-5-rounds',
  standalone: true,
  imports: [
    FormsModule,
    NzButtonComponent,
    NzInputNumberComponent,
    NgFor,
    NzTableModule,
    NzGridModule,
    NzModalModule,
    NgxSpinnerModule,
  ],
  templateUrl: './view-last-5-rounds.component.html',
  styleUrl: './view-last-5-rounds.component.scss',
})
export class ViewLast5RoundsComponent {
back() {
throw new Error('Method not implemented.');
}
  isAuth = false;
  players: string[] = [];
  roundScores: Array<number[]> = [];
  constructor(
    private router: Router,
    private gameService: GameService,
    private apiService: ApiService,
    private modal: NzModalService
  ) {}

  ngOnInit(): void {
    this.checkAuth();
  }

  async checkAuth() {
    const response = await this.apiService.checkAuth();
    if (response.success) {
      this.isAuth = true;
      this.getPlayers();
      this.getRoundScores();
    }
  }

  getPlayers() {
    this.players = this.gameService.getParticipants().map((player) => player.name);
    console.log(this.players, 'players');
  }

  getRoundScores() {
    this.apiService.getLast5Rounds().then((response) => {
      this.roundScores = response.rounds;
      console.log(this.roundScores, 'roundScores');
    });
  }

  save() {

  }
}
