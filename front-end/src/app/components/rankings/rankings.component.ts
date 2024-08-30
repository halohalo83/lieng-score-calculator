import { Component } from '@angular/core';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NgxSpinnerModule } from 'ngx-spinner';
import { Router } from '@angular/router';
import { ApiService } from '../../api.service';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NgFor } from '@angular/common';
import { PlayerRanking } from '../../models/player.model';

@Component({
  selector: 'app-rankings',
  standalone: true,
  imports: [
    NzTableModule,
    NgxSpinnerModule,
    NzGridModule,
    NzButtonComponent,
    NgFor,
  ],
  templateUrl: './rankings.component.html',
  styleUrl: './rankings.component.scss',
})
export class RankingsComponent {
  constructor(private router: Router, private apiService: ApiService) {
    this.checkAuth();
  }

  players: PlayerRanking[] = [];

  async checkAuth() {
    const response = await this.apiService.checkAuth();
    if (response.success) {
      this.getRankings();
    }
  }
  getRankings() {
    this.apiService.getRankings().then((response) => {
      if (response.success) {
        this.players = response.rankings;
      }
    });
  }

  back() {
    this.router.navigate(['/']);
  }

  refresh() {
    this.getRankings();
  }
}
