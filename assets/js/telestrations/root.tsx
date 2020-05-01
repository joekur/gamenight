import * as React from 'react';
import bind from 'bind-decorator';
import { Channel, Socket } from 'phoenix';
import { Game, IGameState, EGameStatus } from './game';
import { setCookie, getCookie } from '../cookies';

import Lobby from './lobby';
import Waiting from './waiting';
import Writing from './writing';
import Drawing from './drawing';
import Canvas from './canvas';
import Interpreting from './interpreting';
import ShowAndTell from './show_and_tell';
import RoundEnd from './round_end';
import Modal from '../shared/modal';

interface IProps {
  gameId: string;
}

interface IState {
  connected: boolean;
  gameState?: IGameState;
  playerId: string | null;
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

    const topic = `telestrations:${this.props.gameId}`;

    this.channel = this.socket.channel(topic, params) as Channel;
    (window as any).channel = this.channel;

    this.channel.join()
      .receive('ok', this.handleJoinedChannel)
      .receive('error', resp => { console.log('Unable to join', resp) });

    this.channel.on('game_updated', this.handleGameUpdated);
  }

  @bind
  handleJoinedChannel(response: IGameState) {
    console.log('Joined channel successfully', response);

    this.updateGameState(response);
    this.setState({ connected: true });
  }

  @bind
  handleGameUpdated(gameState: IGameState) {
    this.updateGameState(gameState);
  }

  @bind
  updateGameState(gameState: Partial<IGameState>) {
    console.log('Updated state', gameState);
    this.setState({
      gameState: Object.assign({}, this.state.gameState, gameState)
    });
  }

  @bind
  handleRequestJoinGame(name: string) {
    this.pushChannel('request_join', { name }, this.handleJoinSuccess);
  }

  @bind
  handleJoinSuccess(response: any) {
    const playerId = response.player_id;

    setCookie(this.playerIdCookieName(), playerId, 1);

    (this.channel as any).joinPush.payload = () => ({ player_id: playerId });

    this.setState({ playerId });
  }

  @bind
  handleStartGame() {
    this.pushChannel('start_game', {});
  }

  @bind
  handleSubmitStory(story: string) {
    this.pushChannel('write_story', { text: story });
  }

  @bind
  handleSubmitDrawing(drawingBase64: string) {
    this.pushChannel('draw_story', { src: drawingBase64 });
  }

  @bind
  handleStepForwardShowAndTell() {
    if (this.game.iAmShowAndTeller) {
      this.pushChannel('step_forward_storytelling', {});
    }
  }
  @bind
  handleNextRound() {
    this.pushChannel('start_next_round', {});
  }

  pushChannel(event: string, payload: object, onSuccess?: (response: any) => any) {
    const push = this.channel!.push(event, payload)
      .receive('error', this.handleUnknownError)
      .receive('timeout', this.handleUnknownError);

    if (onSuccess) {
      push.receive('ok', onSuccess);
    }
  }

  @bind
  handleUnknownError(response: any) {
    console.error('UnknownError', response);
  }

  playerIdCookieName(): string {
    return `${this.props.gameId}-playerId`;
  }

  get game() {
    if (!this.state.gameState) { throw 'Null game state'; }

    return new Game(this.props.gameId, this.state.playerId, this.state.gameState!);
  }

  renderInner() {
    const game = this.game;

    // escape hatch to quickly test drawing UI
    if (window.location.search === '?draw') {
      return (
        <div>
          <Canvas onChange={() => {}} />
          <div style={{height: '800px'}} />
        </div>
      );
    }

    if (game.status === EGameStatus.Lobby) {
      return <Lobby
        game={game}
        onRequestJoinGame={this.handleRequestJoinGame}
        onStartGame={this.handleStartGame}
      />;
    } else if (game.waitingOnOthers) {
      return <Waiting game={game} />;
    } else if (game.status === EGameStatus.Writing) {
      return <Writing
        game={game}
        onSubmit={this.handleSubmitStory}
      />;
    } else if (game.status === EGameStatus.Drawing) {
      return <Drawing
        game={game}
        onSubmit={this.handleSubmitDrawing}
      />;
    } else if (game.status === EGameStatus.Interpreting) {
      return <Interpreting
        game={game}
        onSubmit={this.handleSubmitStory}
      />;
    } else if (game.status === EGameStatus.ShowAndTell) {
      return <ShowAndTell
        game={game}
        onStepForward={this.handleStepForwardShowAndTell}
      />;
    } else if (game.status === EGameStatus.RoundEnd) {
      return <RoundEnd
        game={game}
        onNextRound={this.handleNextRound}
      />;
    }

    return 'Unhandled state';
  }

  render() {
    if (!this.state.connected) {
      return <Modal>Loading...</Modal>;
    }

    return (
      <div className="game-page game-page--telestrations">
        <div className="game-page__content" id="game_page_content">
          {this.renderInner()}
        </div>
      </div>
    );
  }
}
