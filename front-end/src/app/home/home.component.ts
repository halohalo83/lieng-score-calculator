import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzInputNumberComponent } from 'ng-zorro-antd/input-number';
import {
  NzOptionComponent,
  NzSelectComponent
} from 'ng-zorro-antd/select';
import { GameService } from '../game-service.service';
FormsModule
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NzSelectComponent, NzOptionComponent, NzInputNumberComponent, FormsModule, NzButtonComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  numberOfPlayers: number | undefined;
  initialScore: number | undefined;

  constructor(private router: Router, private gameService: GameService) {}

  startGame() {
    this.gameService.setInitialScore(this.initialScore || 0);

    this.router.navigate(['/player-entry'], {
      queryParams: {
        players: this.numberOfPlayers,
        initialScore: this.initialScore,
      },
    });
  }
}
