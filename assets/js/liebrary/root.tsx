import * as React from 'react';
import { Game, IGameState, EGameStatus } from './game';
import { Channel, Socket } from 'phoenix';
import bind from 'bind-decorator';

import Lobby from './lobby';
import RoundLies from './round_lies';
import RoundVoting from './round_voting';
import { setCookie, getCookie } from '../cookies';

interface IProps {
  gameId: string,
}

interface IState {
  connected: boolean,
  gameState?: IGameState,
  playerId: string | null,
}

export default class Root extends React.Component<IProps, IState> {
  socket?: Socket
  channel?: Channel

  constructor(props: IProps) {
    super(props);

    this.state = {
      connected: false,
      playerId: null,
    };
  }

  componentDidMount() {
    const playerId = getCookie(this.playerIdCookieName());
    if (!!playerId) {
      this.setState({ playerId });
    }

    this.joinChannel(playerId);
  }

  joinChannel(playerId: string | null) {
    console.log('Joining channel with playerId:', playerId);

    const params = { player_id: playerId };
    this.socket = new Socket("/socket", {});
    this.socket.connect();
    (window as any).socket = this.socket;

    const topic = `liebrary:${this.props.gameId}`;

    this.channel = this.socket.channel(topic, params) as Channel;
    (window as any).channel = this.channel;

    this.channel.join()
      .receive('ok', this.handleJoinedChannel)
      .receive('error', resp => { console.log('Unable to join', resp) });

    this.channel.on('game_updated', this.handleGameUpdated);
  }

  @bind
  handleJoinedChannel(response: any) {
    console.log('Joined channel successfully', response);

    this.updateGameState(response);
    this.setState({ connected: true });
  }

  @bind
  handleRequestJoinGame(name: string) {
    this.channel!.push('request_join', { name })
      .receive('ok', this.handleJoinSuccess)
      .receive('error', this.handleUnknownError)
      .receive('timeout', this.handleUnknownError);
  }

  @bind
  handleStartGame() {
    this.channel!.push('start_game', {})
      .receive('error', this.handleUnknownError)
      .receive('timeout', this.handleUnknownError);
  }

  @bind
  handleJoinSuccess(response: any) {
    const playerId = response.player_id;

    setCookie(this.playerIdCookieName(), response.player_id, 1);

    (this.channel as any).joinPush.payload = () => ({ player_id: playerId });

    this.setState({ playerId: response.player_id });
  }

  @bind
  handleSubmitLie(lie: string) {
    this.channel!.push('submit_lie', { lie })
      .receive('error', this.handleUnknownError)
      .receive('timeout', this.handleUnknownError);
  }

  @bind
  handleVote(id: string) {
    this.channel!.push('submit_vote', { id })
      .receive('error', this.handleUnknownError)
      .receive('timeout', this.handleUnknownError);
  }

  @bind
  handleGameUpdated(gameState: any) {
    console.log('game updated', gameState);

    this.updateGameState(gameState);
  }

  @bind
  handleUnknownError(response: any) {
    // TODO
    console.error('UnknownError', response);
  }

  playerIdCookieName(): string {
    return `${this.props.gameId}-playerId`;
  }

  updateGameState(newState: Partial<IGameState>) {
    this.setState({
      gameState: Object.assign({}, this.state.gameState, newState)
    });
  }

  render() {
    if (!this.state.connected) {
      return 'loading...';
    }

    const game = new Game(this.props.gameId, this.state.playerId, this.state.gameState!);

    if (game.status === EGameStatus.Lobby) {
      return <Lobby
        game={game}
        onRequestJoinGame={this.handleRequestJoinGame}
        onStartGame={this.handleStartGame}
      />;
    } else if (game.status === EGameStatus.RoundLies) {
      return <RoundLies
        game={game}
        onSubmitLie={this.handleSubmitLie}
      />;
    } else if (game.status === EGameStatus.RoundVoting) {
      return <RoundVoting
        game={game}
        onVote={this.handleVote}
      />;
    }

    return 'Unhandled state';
  }
}
