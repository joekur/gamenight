export enum EGameStatus {
  Lobby = 'lobby',
  Writing = 'writing',
  Drawing = 'drawing',
  Interpreting = 'interpreting',
  ShowAndTell = 'show_and_tell',
  RoundEnd = 'round_end',
}

interface IRound {
  step: number;
  submitted: IPlayersMap<boolean>;
  current_storyteller: string;
  storytelling_step: number;
}

interface IWriting {
  player: IPlayer;
  text: string;
}

interface IWritingResp {
  text: string;
  player_id: string;
}

export interface IDrawing {
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
  current_writing: IWritingResp;
  current_drawing: IDrawingResp;
  receiving_from_player_id: string | null;
  passing_to_player_id: string | null;
  storytelling_writing: IWritingResp | null;
  storytelling_drawing: IDrawingResp | null;
}

export interface IGameState {
  status: EGameStatus;
  vip: string;
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
    const writing = this.state.me.current_writing;
    return this.buildWriting(writing);
  }

  buildWriting(writing: IWritingResp): IWriting {
    return {
      player: this.findPlayer(writing.player_id),
      text: writing.text,
    };
  }

  get currentDrawingToInterpret(): IDrawing {
    const drawing = this.state.me.current_drawing;
    return this.buildDrawing(drawing);
  }

  buildDrawing(drawing: IDrawingResp): IDrawing {
    return {
      player: this.findPlayer(drawing.player_id),
      src: drawing.src,
    };
  }

  get iAmShowAndTeller(): boolean {
    return this.state.status === EGameStatus.ShowAndTell
      && this.state.round.current_storyteller === this.playerId;
  }

  get iAmVIP(): boolean {
    return this.amPlayer && this.state.vip === this.playerId;
  }

  get vip(): IPlayer {
    return this.findPlayer(this.state.vip);
  }

  get currentShowAndTeller(): IPlayer {
    const playerId = this.state.round.current_storyteller;

    return this.findPlayer(playerId);
  }

  get showAndTellWriting(): IWriting | null {
    const writing = this.state.me.storytelling_writing;

    return writing && this.buildWriting(writing);
  }

  get showAndTellDrawing(): IDrawing | null {
    const drawing = this.state.me.storytelling_drawing;

    return drawing && this.buildDrawing(drawing);
  }

  get storytellingStep() {
    return this.state.round.storytelling_step + 1;
  }

  get totalStorytellingSteps() {
    return this.players.length;
  }

  get receivingFromPlayer(): IPlayer | null {
    const id = this.state.me.receiving_from_player_id;
    if (id) {
      return this.findPlayer(id);
    }

    return null;
  }

  get passingToPlayer(): IPlayer | null {
    const id = this.state.me.passing_to_player_id;
    if (id) {
      return this.findPlayer(id);
    }

    return null;
  }
}
