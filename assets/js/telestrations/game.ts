export enum EGameStatus {
  Lobby = 'lobby',
  Writing = 'writing',
  Drawing = 'drawing',
  Interpreting = 'interpreting',
  ShowAndTell = 'show_and_tell',
}

interface IRound {
  step: number;
  stories: IPlayersMap<IStory>;
  submitted: IPlayersMap<boolean>;
}

interface IStory {
  writings: IWritingResp[];
  drawings: IDrawingResp[];
}

interface IWriting {
  player: IPlayer;
  text: string;
}

interface IWritingResp {
  text: string;
  player_id: string;
}

interface IDrawing {
  player: IPlayer;
  src: string;
}

interface IDrawingResp {
  src: string;
  player_id: string;
}

export interface IPlayer {
  id: string;
  name: string;
}

export interface IPlayersMap<T> {
  [playerId: string] : T;
}

interface IMe {
  original_author: string;
}

export interface IGameState {
  status: EGameStatus;
  player_ids: string[];
  player_names: IPlayersMap<string>;
  round: IRound;
  me: IMe;
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

  get players(): IPlayer[] {
    return this.state.player_ids.map(id => this.findPlayer(id));
  }

  findPlayer(id: string): IPlayer {
    return {
      id,
      name: this.nameFor(id),
    };
  }

  nameFor(playerId: string) {
    return this.state.player_names[playerId];
  }

  get amPlayer() {
    return !!this.playerId;
  }

  hasSubmitted(playerId: string): boolean {
    return this.state.round.submitted[playerId];
  }

  get iHaveSubmitted(): boolean {
    return this.hasSubmitted(this.playerId!);
  }

  get waitingOnOthers(): boolean {
    return [EGameStatus.Writing, EGameStatus.Drawing, EGameStatus.Interpreting].includes(this.status)
      && this.iHaveSubmitted;
  }

  get currentWritingToDraw(): IWriting {
    const originalAuthor = this.state.me.original_author;

    const writing = this.state.round.stories[originalAuthor].writings.slice(-1)[0];

    return {
      player: this.findPlayer(writing.player_id),
      text: writing.text,
    };
  }
}
