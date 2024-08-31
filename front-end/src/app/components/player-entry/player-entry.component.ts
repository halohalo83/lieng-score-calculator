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
import { ParticipantModel, PlayerModel } from '../../models/player.model';
import { GameService } from '../../game-service.service';

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
  ],
  templateUrl: './player-entry.component.html',
  styleUrl: './player-entry.component.scss',
})
export class PlayerEntryComponent {
  participants: ParticipantModel[] = [];
  constructor(
    private router: Router,
    private apiService: ApiService,
    private gameService: GameService
  ) {}

  ngOnInit(): void {
    this.checkAuth();
  }

  getAllPlayers() {
    this.apiService.getAllPlayers().then((response) => {
      if (response.success) {
        this.participants = response.players.map((player: PlayerModel) => {
          return {
            id: player.id,
            name: player.name,
            isParticipate: false,
          };
        });
      }
    });
  }

  async checkAuth() {
    const response = await this.apiService.checkAuth();
    if (response.success) {
      this.getAllPlayers();
    }
  }

  hasParticipants(): boolean {
    return this.participants.filter(x => x.isParticipate).length > 1;
  }



  goToScoreEntry() {
    this.gameService.setParticipants(
      this.participants.filter((x) => x.isParticipate)
    );
    this.router.navigate(['/score-entry']);
  }

  back() {
    this.router.navigate(['/home']);
  }
}
