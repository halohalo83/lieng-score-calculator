import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputGroupComponent, NzInputModule } from 'ng-zorro-antd/input';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ApiService } from '../../api.service';
import {
  ParticipantModel,
  PlayerModel,
  PlayerScoreViewModel,
} from '../../models/player.model';
import { GameService } from '../../game-service.service';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-player-entry',
  standalone: true,
  imports: [
    FormsModule,
    NzButtonComponent,
    NzInputGroupComponent,
    NgFor,
    NzInputModule,
    NzGridModule,
    NzTableModule,
    NzSwitchModule,
    NgxSpinnerModule,
    NzModalModule,
  ],
  templateUrl: './player-entry.component.html',
  styleUrl: './player-entry.component.scss',
})
export class PlayerEntryComponent {
  participants: ParticipantModel[] = [];
  gameIsRunning: boolean = false;
  constructor(
    private router: Router,
    private apiService: ApiService,
    private gameService: GameService,
    private modal: NzModalService
  ) {}

  ngOnInit(): void {
    this.checkAuth();
  }

  getAllPlayers() {
    this.apiService.getAllPlayers().then((response) => {
      if (response.success) {
        var participantsFromGameService = this.gameService.getParticipants();
        if (participantsFromGameService.length > 0) {
          this.participants = response.players.map(
            (player: PlayerScoreViewModel) => {
              return {
                id: player.id,
                name: player.name,
                isParticipate: participantsFromGameService.some(
                  (x) => x.id === player.id
                ),
              };
            }
          );
        } else {
          this.participants = response.players.map(
            (player: PlayerScoreViewModel) => {
              return {
                id: player.id,
                name: player.name,
                isParticipate: false,
              };
            }
          );
        }
      }
    });
  }

  async checkAuth() {
    const response = await this.apiService.checkAuth();
    if (response.success) {
      this.getAllPlayers();
      this.gameIsRunning = this.gameService.getGameIsRunning();
    }
  }

  chooseAgain() {
    this.participants = this.participants.map((x) => {
      x.isParticipate = false;
      return x;
    });
    this.gameService.setGameIsRunning(false);
    this.gameIsRunning = false;
  }

  save() {
    this.modal.confirm({
      nzTitle: 'Dữ liệu sẽ bị xóa hết trong sheet?',
      nzContent: 'Nếu lưu lại, dữ liệu cũ sẽ bị xóa hết trong sheet đã chọn',
      nzOnOk: () => {
        this.gameService.setParticipants(
          this.participants.filter((x) => x.isParticipate)
        );
        this.gameService.setGameIsRunning(true);
        this.gameIsRunning = true;
        this.apiService.configSelectedSheet();
      },
      nzOkText: 'Quất luôn',
      nzCancelText: 'Đéo',
    });
  }

  hasParticipants(): boolean {
    return this.participants.filter((x) => x.isParticipate).length > 1;
  }

  goToScoreEntry() {
    this.gameService.setParticipants(
      this.participants.filter((x) => x.isParticipate)
    );
    this.gameService.setGameIsRunning(true);
    this.router.navigate(['/score-entry']);
  }

  back() {
    this.router.navigate(['/home']);
  }
}
