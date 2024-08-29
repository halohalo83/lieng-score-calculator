import { NgFor } from '@angular/common';
import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzInputGroupComponent, NzInputModule } from 'ng-zorro-antd/input';
import { GameService } from '../game-service.service';
import { NzGridModule } from 'ng-zorro-antd/grid';

@Component({
  selector: 'app-player-entry',
  standalone: true,
  imports: [FormsModule, NzButtonComponent, NzInputGroupComponent, NgFor, NzInputModule,  NzGridModule],
  templateUrl: './player-entry.component.html',
  styleUrl: './player-entry.component.scss',
})
export class PlayerEntryComponent {
  @ViewChildren('playerInput') playerInputs!: QueryList<ElementRef>;
  players: { name: string }[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gameService: GameService
  ) {}

  ngOnInit(): void {
    const numPlayers = +this.route.snapshot.queryParams['players'];

    this.players = Array.from({ length: numPlayers }, () => ({ name: '' }));
  }

  focusNextInput(index: number): void {
    const inputs = this.playerInputs.toArray();
    if (index + 1 < inputs.length) {
      inputs[index + 1].nativeElement.focus();
    }
  }

  saveNames() {
    this.gameService.setPlayers(this.players);
    this.router.navigate(['/score-entry']);
  }

  back() {
    this.router.navigate(['/']);
  }
}
