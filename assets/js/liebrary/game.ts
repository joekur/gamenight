export enum EGameStatus {
  Lobby = 'lobby',
  InProgress = 'in_progress',
}

export interface IGameState {
  gameStatus: EGameStatus,
  playerId?: string,
  myName?: string,
}

export class Game {
  id: string
  state: IGameState

  constructor(id: string, state: IGameState) {
    this.id = id;
    this.state = state;
  }

  get gameStatus() {
    return this.state.gameStatus;
  }

  get myName() {
    return this.state.myName;
  }

  amPlayer() {
    return !!this.state.playerId;
  }
}
