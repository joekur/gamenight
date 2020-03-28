export enum EGameStatus {
  Lobby = 'lobby',
  RoundLies = 'round_lies',
  RoundVoting = 'round_voting',
}

export interface IPlayersMap {
  [playerId: string] : string;
}

export interface IGameState {
  status: EGameStatus,
  players: IPlayersMap,
}

export class Game {
  id: string
  playerId: string | null
  state: IGameState

  constructor(id: string, playerId: string | null, state: IGameState) {
    this.id = id;
    this.playerId = playerId;
    this.state = state;
  }

  get status() {
    return this.state.status;
  }

  get myName(): string | null {
    if (this.amPlayer) {
      return this.state.players[this.playerId!];
    }

    return null;
  }

  get amPlayer() {
    return !!this.playerId;
  }

  get playerNames() {
    return Object.values(this.state.players);
  }

  get numPlayers() {
    return Object.keys(this.state.players).length;
  }
}
