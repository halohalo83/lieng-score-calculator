export interface PlayerModel {
  id: number;
  name: string;
  score: number;
}

export interface PlayerRanking {
  rank: number;
  id: number;
  name: string;
  score: number;
}

export interface ParticipantModel {
  id: number;
  name: string;
  isParticipate: boolean;
}

export interface PlayerScoreModel {
  id: number;
  name: string;
  isPositive: boolean;
  score: number;
}
