import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzInputGroupComponent, NzInputModule } from 'ng-zorro-antd/input';
import { GameService } from '../game-service.service';

@Component({
  selector: 'app-player-entry',
  standalone: true,
  imports: [FormsModule, NzButtonComponent, NzInputGroupComponent, NgFor, NzInputModule],
  templateUrl: './player-entry.component.html',
  styleUrl: './player-entry.component.scss',
})
export class PlayerEntryComponent {
  players: { name: string }[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gameService: GameService
  ) {}

  ngOnInit(): void {
    const numPlayers = +this.route.snapshot.queryParams['players'];

    this.players = Array(numPlayers).fill({ name: '' });
  }

  saveNames() {
    this.gameService.setPlayers(this.players);
    this.router.navigate(['/score-entry']);
  }
}
