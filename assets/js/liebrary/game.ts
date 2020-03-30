export enum EGameStatus {
  Lobby = 'lobby',
  RoundLies = 'round_lies',
  RoundVoting = 'round_voting',
}

export interface IPlayersMap {
  [playerId: string] : string,
}

interface IVotingList {
  [playerId: string] : string[],
}

interface IBook {
  title: string,
  author: string,
  year: string,
  first_line: string,
}

interface IRound {
  lies: IPlayersMap,
  votes: IPlayersMap,
  voting_lists: IVotingList,
  book: IBook,
  real_id: string,
}

export interface IGameState {
  status: EGameStatus,
  players: IPlayersMap,
  round: IRound,
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

  get playerIds() {
    return Object.keys(this.state.players);
  }

  get numPlayers() {
    return Object.keys(this.state.players).length;
  }

  get alreadySubmittedLie() {
    return !!this.state.round.lies[this.playerId!];
  }

  get votingList() {
    const ids = this.state.round.voting_lists[this.playerId!];

    return ids.map(id => {
      const line = id === this.state.round.real_id ?
        this.state.round.book.first_line :
        this.state.round.lies[id];

      return {
        id,
        firstLine: line,
      };
    });
  }

  get alreadyVoted() {
    return !!this.state.round.votes[this.playerId!];
  }

  nameFor(playerId: string) {
    return this.state.players[playerId];
  }

  hasSubmittedLie(playerId: string) {
    return !!this.state.round.lies[playerId];
  }
}
