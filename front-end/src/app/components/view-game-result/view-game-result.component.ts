import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzOptionComponent, NzSelectComponent } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ApiService } from '../../api.service';
import { GameService } from '../../game-service.service';
import { SheetModel } from '../../models/sheet.model';
import { PlayerRanking, PlayerScoreModel } from '../../models/player.model';
import { indexOf } from 'lodash';

@Component({
  selector: 'app-view-game-result',
  standalone: true,
  imports: [
    NzTableModule,
    NgxSpinnerModule,
    NzGridModule,
    NzButtonComponent,
    NgFor,
    ReactiveFormsModule,
    NzSelectComponent,
    NzOptionComponent,
  ],
  templateUrl: './view-game-result.component.html',
  styleUrl: './view-game-result.component.scss',
})
export class ViewGameResultComponent {
  isAuth: boolean = false;
  form!: FormGroup;
  sheets: SheetModel[] = [];
  players: PlayerRanking[] = [];
  roundScores: number[] = [];
  constructor(
    private router: Router,
    private gameService: GameService,
    private apiService: ApiService,
    private fb: FormBuilder,
  ) {}

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.checkAuth();
    this.form = this.fb.group({
      selectedSheetId: [null, Validators.required],
    });
  }

  async checkAuth() {
    const response = await this.apiService.checkAuth();
    if (response.success) {
      this.isAuth = true;
      this.getAllSheets();
    }
  }

  async getAllSheets() {
    try {
      const response = await this.apiService.getAllSheets();
      if (response.success) {
        this.sheets = response.result;
      }
    } catch (error) {
      console.error('Error getting all sheets:', error);
    }
  }

  back() {
    this.router.navigate(['/']);
  }

  refresh() {
    this.getAllSheets();
    if(this.form.get('selectedSheetId')?.value) {
      this.viewResult();
    }
  }

  viewResult() {
    const sheetId = this.form.get('selectedSheetId')?.value;
    if(!sheetId) {
      return;
    }

    this.apiService.getRoundScores(sheetId).then((response) => {
      if (response.success) {
        this.roundScores = response.scores;
        this.getPlayers();
      }
      else {
        this.players = [];
      }
    },
    (error) => {
      console.error('Error getting round scores:', error);
      this.players = [];
    });
  }

  getPlayers() {
    // this.players = this.gameService.getParticipants().map((player, index) => {
    //   return {
    //     rank: this.getRanking(this.roundScores[index]),
    //     id: player.id,
    //     name: player.name,
    //     score: this.roundScores[index],
    //   } as PlayerRanking;
    // });

    // this.players.sort((a, b) => a.rank - b.rank);

    this.apiService.getListPlayers(this.form.get('selectedSheetId')?.value).then((response) => {
      if (response.success) {
        this.players = response.players.map((player: PlayerScoreModel, index) => {
          return {
            rank: this.getRanking(this.roundScores[index]),
            id: player.id,
            name: player.name,
            score: this.roundScores[index],
          } as PlayerRanking;
        });
        this.players.sort((a, b) => a.rank - b.rank);
      }
    });

  }

  getRanking(score: Number) {
    // arrange the scores in descending order
    let scores = this.roundScores.slice().sort((a, b) => b - a);

    return indexOf(scores, score) + 1;
  }
}
