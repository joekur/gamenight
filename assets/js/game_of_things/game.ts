export enum EGameStatus {
  Lobby = 'lobby',
  RoundAnswers = 'round_answers',
  RoundGuessing = 'round_guessing',
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

interface IAnswerChoice {
  id: string,
  text: string,
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

  get numPlayers(): number {
    return Object.keys(this.state.players).length;
  }

  get alreadySubmittedAnswer(): boolean {
    return this.hasSubmittedAnswer(this.playerId!);
  }

  hasSubmittedAnswer(playerId: string): boolean {
    return !!this.state.round.answers[playerId];
  }

  get isMyTurn(): boolean {
    return this.state.round.current_player == this.playerId!;
  }

  get currentPlayer(): IPlayer {
    const id = this.state.round.current_player;

    return {
      id,
      name: this.nameFor(id),
    };
  }

  findAnswer(id: string): IAnswerChoice {
    return {
      id,
      text: this.state.round.answers[id],
    };
  }

  get answerList(): IAnswerChoice[] {
    const ids = this.state.round.answer_ids;

    return ids.map(id => this.findAnswer(id));
  }

  get otherActivePlayers(): IPlayer[] {
    const ids = this.state.round.active_players;
    const others = ids.filter(id => id !== this.playerId);

    return others.map(id => {
      return {
        id,
        name: this.nameFor(id),
      };
    });
  }

  get amStillInTheRound(): boolean {
    return this.state.round.active_players.includes(this.playerId!);
  }

  get currentPrompt(): string {
    return this.state.round.prompt;
  }

  nameFor(playerId: string) {
    return this.state.players[playerId];
  }
}
