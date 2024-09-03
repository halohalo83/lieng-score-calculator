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
    this.players = this.gameService
      .getParticipants()
      .map((player) => player.name);
  }

  getRoundScores() {
    this.apiService.getLast5Rounds().then((response) => {
      this.roundScores = response.rounds
      .map((round: string[]) => round.map(item => parseInt(item)));
    });
  }

  checkValidation() {
    let isValid = true;
    this.roundScores.forEach(round => {
      if (round.reduce((a, b) => a + b, 0) !== 0) {
        return isValid = false;
      }
      else {
        return;
      }
    });

    return isValid;
  }

  save() {
    if(!this.checkValidation()) {
      this.modal.error({
        nzTitle: 'Lỗi',
        nzContent: 'Gà đéo khớp!',
      });
      return;
    }
    this.apiService.replaceLast5Round(this.roundScores).then(
      (response) => {
        if (response.success) {
          this.modal.success({
            nzTitle: 'Thành công',
            nzContent: 'Sửa gà thành công!',
          });
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

  back() {
    this.router.navigate(['/score-entry']);
  }
}
