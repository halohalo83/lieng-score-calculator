import { NgFor } from '@angular/common';
import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzInputGroupComponent, NzInputModule } from 'ng-zorro-antd/input';
import { GameService } from '../../game-service.service';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { ApiService } from '../../api.service';
import { PlayerModel } from '../../models/player.model';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NgxSpinnerModule } from 'ngx-spinner';

class Participant {
  playerId: number | undefined;
  playerName: string | undefined;
  isParticipate: boolean = false;
}

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
    NgxSpinnerModule
  ],
  templateUrl: './player-entry.component.html',
  styleUrl: './player-entry.component.scss',
})
export class PlayerEntryComponent {
  players: Participant[] = [];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.checkAuth();
  }

  getAllPlayers() {
    this.apiService.getAllPlayers().then((response) => {
      if (response.success) {
        this.players = response.players.map((player: PlayerModel) => {
          return {
            playerId: player.id,
            playerName: player.name,
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

  saveNames() {
    this.router.navigate(['/score-entry']);
  }

  back() {
    this.router.navigate(['/home']);
  }
}
