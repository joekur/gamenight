import * as React from 'react';
import { Game, IGameState, EGameStatus } from './game';
import { Channel } from 'phoenix';
import bind from 'bind-decorator';

import Lobby from './lobby';
import RoundAnswers from './round_answers';
import MyTurn from './my_turn';
import RoundWaiting from './round_waiting';
import RoundResults from './round_results';
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
    const topic = `game_of_things:${this.props.gameId}`;
    const payload = { player_id: playerId };

    this.channel = (window as any).socket.channel(topic, payload) as Channel;

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
    this.pushChannel('start_game', {});
  }

  @bind
  handleAddPrompt(prompt: string) {
    this.pushChannel('add_prompt', { prompt });
  }

  @bind
  handleSubmitAnswer(answer: string) {
    this.pushChannel('submit_answer', { answer });
  }

  @bind
  handleSubmitGuess(answerId: string, playerId: string) {
    this.pushChannel('guess', {
      answer_id: answerId,
      player_id: playerId,
    });
  }

  @bind
  handleNextRound() {
    this.pushChannel('start_next_round', {});
  }

  @bind
  handleJoinSuccess(response: any) {
    console.log('join success', response);

    setCookie(this.playerIdCookieName(), response.player_id, 1);

    this.setState({ playerId: response.player_id });
  }

  @bind
  handleGameUpdated(gameState: any) {
    console.log('game updated', gameState);

    this.updateGameState(gameState);
  }

  @bind
  handleUnknownError(response: any) {
    console.error('UnknownError', response);
  }

  pushChannel(event: string, payload: object) {
    this.channel!.push(event, payload)
      .receive('error', this.handleUnknownError)
      .receive('timeout', this.handleUnknownError);
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
        onAddPrompt={this.handleAddPrompt}
      />;
    } else if (game.status === EGameStatus.RoundAnswers) {
      return <RoundAnswers
        game={game}
        onSubmitAnswer={this.handleSubmitAnswer}
      />;
    } else if (game.status === EGameStatus.RoundGuessing) {
      if (game.isMyTurn) {
        return <MyTurn
          game={game}
          onSubmitGuess={this.handleSubmitGuess}
        />;
      }

      return <RoundWaiting
        game={game}
      />;
    } else if (game.status === EGameStatus.RoundResults) {
      return <RoundResults
        game={game}
        onNextRound={this.handleNextRound}
      />;
    }

    return 'Unhandled state';
  }
}
