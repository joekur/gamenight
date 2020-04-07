export enum EGameStatus {
  Lobby = 'lobby',
  RoundAnswers = 'round_answers',
  RoundGuessing = 'round_guessing',
  RoundResults = 'round_results',
}

export interface IPlayersMap {
  [playerId: string] : string,
}

interface IScoreMap {
  [playerId: string] : number,
}

interface ILastGuessResponse {
  player_id: string,
  guessed_answer_id: string,
  guessed_player_id: string,
  correct: boolean,
  key: string,
}

interface ILastGuess {
  player: IPlayer,
  guessedPlayer: IPlayer,
  guessedAnswer: IAnswer,
  correct: boolean,
  key: string,
}

interface IRound {
  current_player: string,
  answers: IPlayersMap,
  prompt: string,
  active_players: string[],
  answer_ids: string[],
  last_guess: ILastGuessResponse | null,
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

export interface IPlayerPoint {
  player: IPlayer,
  points: number,
}

interface IAnswer {
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

  findPlayer(id: string): IPlayer {
    return {
      id,
      name: this.nameFor(id),
    };
  }

  nameFor(playerId: string) {
    return this.state.players[playerId];
  }

  findAnswer(id: string): IAnswer {
    return {
      id,
      text: this.state.round.answers[id],
    };
  }

  get answerList(): IAnswer[] {
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

  get playerPoints(): IPlayerPoint[] {
    return Object.keys(this.state.scores).map(playerId => {
      return {
        player: this.findPlayer(playerId),
        points: this.state.scores[playerId],
      };
    }).sort((a,b) => b.points - a.points);
  }

  get lastGuess(): ILastGuess | null {
    if (this.state.round && this.state.round.last_guess) {
      const guess = this.state.round.last_guess;
      return {
        player: this.findPlayer(guess.player_id),
        guessedPlayer: this.findPlayer(guess.guessed_player_id),
        guessedAnswer: this.findAnswer(guess.guessed_answer_id),
        key: guess.key,
        correct: guess.correct,
      };
    }

    return null;
  }

  get lastGuessWasMine(): boolean {
    return this.amPlayer
      && !!this.lastGuess
      && this.lastGuess.player.id === this.playerId;
  }
}
