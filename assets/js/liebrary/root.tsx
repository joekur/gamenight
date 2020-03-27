import * as React from 'react';
import { Game, IGameState, EGameStatus } from './game';
import { Channel } from 'phoenix';
import Lobby from './lobby';
import bind from 'bind-decorator';

interface IProps {
  gameId: string,
}

interface IState {
  connected: boolean,
  gameState?: IGameState,
  playerId: string | null,
}

export default class Root extends React.Component<IProps, IState> {
  channel?: Channel

  constructor(props: IProps) {
    super(props);

    this.state = {
      connected: false,
      playerId: null,
    };
  }

  componentDidMount() {
    this.joinChannel();
  }

  joinChannel() {
    const topic = `game:${this.props.gameId}`;

    this.channel = (window as any).socket.channel(topic, {}) as Channel;

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
    console.log('join success', response);

    this.setState({ playerId: response.player_id });
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
      />
    }

    return 'game started';
  }
}
