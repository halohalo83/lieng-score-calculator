import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { PlayerEntryComponent } from './components/player-entry/player-entry.component';
import { ScoreEntryComponent } from './components/score-entry/score-entry.component';
import { ResultComponent } from './components/result/result.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'player-entry', component: PlayerEntryComponent },
  { path: 'score-entry', component: ScoreEntryComponent },
  { path: 'result', component: ResultComponent },
];
