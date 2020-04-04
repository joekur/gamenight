export enum EGameStatus {
  Lobby = 'lobby',
  RoundLies = 'round_answers',
  RoundVoting = 'round_guessing',
}

export interface IPlayersMap {
  [playerId: string] : string,
}

interface IScoreMap {
  [playerId: string] : number,
}

interface IRound {
  current_player: string,
  answers: IPlayersMap,
  prompt: string,
  active_players: string[],
  answer_ids: string[],
}

export interface IGameState {
  status: EGameStatus,
  players: IPlayersMap,
  round: IRound,
  scores: IScoreMap,
}

export interface IPlayer {
  id: string,
  name: string,
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
      return this.nameFor(this.playerId!);
    }

    return null;
  }

  get amPlayer() {
    return !!this.playerId;
  }

  get playerNames() {
    return Object.values(this.state.players);
  }

  get playerIds() {
    return Object.keys(this.state.players);
  }

  get numPlayers() {
    return Object.keys(this.state.players).length;
  }

  get alreadySubmittedAnswer() {
    return !!this.state.round.answers[this.playerId!];
  }

  get guessList() {
    const ids = this.state.round.active_players;

    return ids.map(id => {
      return {
        id,
        text: this.state.round.answers[id],
      };
    });
  }

  get amStillInTheRound(): boolean {
    return this.state.round.active_players.includes(this.playerId!);
  }

  nameFor(playerId: string) {
    return this.state.players[playerId];
  }
}
