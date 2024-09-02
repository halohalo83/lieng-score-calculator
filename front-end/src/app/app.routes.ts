import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { PlayerEntryComponent } from './components/player-entry/player-entry.component';
import { ScoreEntryComponent } from './components/score-entry/score-entry.component';
import { ResultComponent } from './components/result/result.component';
import { MenuComponent } from './components/menu/menu.component';
import { RankingsComponent } from './components/rankings/rankings.component';
import { ViewGameResultComponent } from './components/view-game-result/view-game-result.component';
import { ViewLast5RoundsComponent } from './components/view-last-5-rounds/view-last-5-rounds.component';

export const routes: Routes = [
  { path: '', component: MenuComponent },
  { path: 'home', component: HomeComponent },
  { path: 'player-entry', component: PlayerEntryComponent },
  { path: 'score-entry', component: ScoreEntryComponent },
  { path: 'result', component: ResultComponent },
  { path: 'ranking', component: RankingsComponent },
  { path: 'view-game-result', component: ViewGameResultComponent },
  { path: 'view-last-5-rounds', component: ViewLast5RoundsComponent },
];
