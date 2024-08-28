import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PlayerEntryComponent } from './player-entry/player-entry.component';
import { ScoreEntryComponent } from './score-entry/score-entry.component';
import { ResultComponent } from './result/result.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'player-entry', component: PlayerEntryComponent },
  { path: 'score-entry', component: ScoreEntryComponent },
  { path: 'result', component: ResultComponent },
];
