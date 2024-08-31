import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ApiService } from '../../api.service';
import { PlayerRanking } from '../../models/player.model';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [
    NzTableModule,
    NgxSpinnerModule,
    NzGridModule,
    NzButtonComponent,
    NgFor,
  ],
  templateUrl: './result.component.html',
  styleUrl: './result.component.scss'
})
export class ResultComponent {
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
    this.router.navigate(['/score-entry']);
  }

  refresh() {
    this.getRankings();
  }
}
