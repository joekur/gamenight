import * as React from 'react';
import { Game, IGameState, EGameStatus } from './game';
import { Channel } from 'phoenix';
import Lobby from './lobby';
import bind from 'bind-decorator';

interface IProps {
  gameId: string,
}

interface IState {
  gameState: IGameState,
  playerId: string,
  name: string,
}

export default class Root extends React.Component<IProps, IState> {
  channel?: Channel

  constructor(props: IProps) {
    super(props);

    this.state = {
      // TODO game state should be loaded from the server
      gameState: {
        gameStatus: EGameStatus.Lobby,
      },
      playerId: '',
      name: '',
    };
  }

  componentDidMount() {
    this.joinChannel();
  }

  joinChannel() {
    const topic = `game:${this.props.gameId}`;

    this.channel = (window as any).socket.channel(topic, {}) as Channel;
    console.log('channel', this.channel);

    this.channel.join()
      .receive('ok', resp => { console.log(`Joined '${topic}' successfully`, resp) })
      .receive('error', resp => { console.log('Unable to join', resp) });

    this.channel.on('player_joined', payload => {
      console.log(`${payload.name} joined`);
    });

    this.channel.on('game_updated', this.handleGameUpdated);
  }

  @bind
  handleRequestJoinGame(name: string) {
    this.channel?.push('request_join', { name })
      .receive('ok', this.handleJoinSuccess)
      .receive('error', this.handleUnknownError)
      .receive('timeout', this.handleUnknownError);
  }

  @bind
  handleJoinSuccess(response: any) {
    console.log('join success', response);
    this.setState({ playerId: response.player_id, name: response.name });
  }

  @bind
  handleGameUpdated(gameState: any) {
    console.log('game updated', gameState);
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

  get game(): Game {
    return new Game(this.props.gameId, this.state.gameState);
  }

  render() {
    if (this.game.gameStatus === EGameStatus.Lobby) {
      return <Lobby
        game={this.game}
        onRequestJoinGame={this.handleRequestJoinGame}
        />
    }

    return 'game started';
  }
}
