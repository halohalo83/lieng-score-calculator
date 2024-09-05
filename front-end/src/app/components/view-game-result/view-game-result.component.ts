import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { indexOf } from 'lodash';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzOptionComponent, NzSelectComponent } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ApiService } from '../../api.service';
import { GameService } from '../../game-service.service';
import { PlayerRanking, PlayerScoreModel } from '../../models/player.model';
import { SheetModel } from '../../models/sheet.model';

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
  lastRoundScores: number[] = [];
  participants: string[] = [];
  constructor(
    private router: Router,
    private gameService: GameService,
    private apiService: ApiService,
    private fb: FormBuilder
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
      this.getAllParticipants();
    }
  }

  getAllParticipants() {
    this.participants = this.gameService.getParticipants().map((p) => p.name);
  }

  async getAllSheets() {
    try {
      const response = await this.apiService.getAllSheets();
      if (response.success) {
        this.sheets = response.result;

        if (this.sheets.length > 0) {
          this.form
            .get('selectedSheetId')
            ?.setValue(this.sheets[this.sheets.length - 1].sheetId);
            this.viewResult();
        } else {
          this.form.get('selectedSheetId')?.setValue(null);
        }
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
    if (this.form.get('selectedSheetId')?.value) {
      this.viewResult();
    }
  }

  viewResult() {
    const sheetId = this.form.get('selectedSheetId')?.value;
    if (!sheetId) {
      return;
    }
    this.getLastRoundScores(sheetId);

    this.apiService.getResultOfSheet(sheetId).then(
      (response) => {
        if (response.success) {
          this.players = response.players.map((player: PlayerScoreModel, index: Number) => {

            return {
              rank: this.getRanking(
                player.score,
                response.players.map((p: PlayerScoreModel) => p.score)
              ),
              name: player.name,
              score: player.score,
            } as PlayerRanking;
          });
          this.players = this.players.sort((a, b) => a.rank - b.rank);
        } else {
          this.players = [];
        }
      },
      (error) => {
        console.error('Error getting round scores:', error);
        this.players = [];
      }
    );
  }

  getRanking(score: Number, roundScores: Number[]) {
    // arrange the scores in descending order
    let scores = roundScores.slice().sort((a, b) => Number(b) - Number(a));

    return indexOf(scores, score) + 1;
  }

  getLastRoundScores(sheetId: number) {
    this.apiService.getTheLastRound(sheetId).then(
      (response) => {
        if (response.success) {
          this.lastRoundScores = response.round.map(Number);
        } else {
          this.lastRoundScores = [];
        }
      },
      (error) => {
        console.error('Error getting last round scores:', error);
        this.lastRoundScores = [];
      }
    );
  }
}
