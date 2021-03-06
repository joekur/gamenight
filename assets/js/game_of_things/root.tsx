import * as React from 'react';
import { Game, IGameState, EGameStatus } from './game';
import { Channel, Socket } from 'phoenix';
import bind from 'bind-decorator';

import Lobby from './lobby';
import RoundAnswers from './round_answers';
import RoundMyTurn from './round_my_turn';
import RoundWaiting from './round_waiting';
import RoundResults from './round_results';
import Modal from '../shared/modal';
import Popup from '../shared/popup';
import { setCookie, getCookie } from '../cookies';
import { limitText, scrollToTop } from '../utilities';

interface IProps {
  gameId: string,
}

interface IState {
  connected: boolean,
  gameState?: IGameState,
  playerId: string | null,
  closedLastGuessKey: string | null,
}

export default class Root extends React.Component<IProps, IState> {
  socket?: Socket
  channel?: Channel

  constructor(props: IProps) {
    super(props);

    this.state = {
      connected: false,
      playerId: null,
      closedLastGuessKey: null,
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

    const topic = `game_of_things:${this.props.gameId}`;

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

    this.updateGameState(response, this.handleCloseLastGuess);
    this.setState({ connected: true });
  }

  @bind
  handleRequestJoinGame(name: string) {
    this.pushChannel('request_join', { name }, this.handleJoinSuccess);
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
    const playerId = response.player_id;

    setCookie(this.playerIdCookieName(), playerId, 1);

    (this.channel as any).joinPush.payload = () => ({ player_id: playerId });

    this.setState({ playerId });
  }

  @bind
  handleCloseLastGuess() {
    const safeKey = this.game.lastGuess && this.game.lastGuess.key;
    this.setState({ closedLastGuessKey: safeKey });
  }

  @bind
  handleGameUpdated(gameState: any) {
    this.updateGameState(gameState);
  }

  @bind
  handleUnknownError(response: any) {
    console.error('UnknownError', response);
  }

  pushChannel(event: string, payload: object, onSuccess?: (response: any) => any) {
    const push = this.channel!.push(event, payload)
      .receive('error', this.handleUnknownError)
      .receive('timeout', this.handleUnknownError);

    if (onSuccess) {
      push.receive('ok', onSuccess);
    }
  }

  playerIdCookieName(): string {
    return `${this.props.gameId}-playerId`;
  }

  updateGameState(newState: IGameState, callback?: () => void) {
    const prevGame = this.state.connected && this.game;

    this.setState({
      gameState: Object.assign({}, this.state.gameState, newState)
    }, () => {
      prevGame && this.resetScroll(prevGame, this.game);

      callback && callback();
    });
  }

  resetScroll(prevGame: Game, nextGame: Game) {
    if (prevGame.status !== nextGame.status ||
      nextGame.isMyTurn && prevGame.lastGuess?.key !== nextGame.lastGuess?.key) {
      scrollToTop();
    }
  }

  get game() {
    return new Game(this.props.gameId, this.state.playerId, this.state.gameState!);
  }

  renderLastGuess() {
    const game = this.game;
    const lastGuess = game.lastGuess;

    if (game.status !== EGameStatus.RoundGuessing) { return null; }
    if (!lastGuess || lastGuess.key === this.state.closedLastGuessKey) { return null; }

    if (game.lastGuessWasMine) {
      if (lastGuess.correct) {
        return (
          <Modal onClose={this.handleCloseLastGuess}>
            <div className="large-icon mb-1">🙌</div>
            <p>You guessed correctly!</p>
            <button onClick={this.handleCloseLastGuess}>Keep Guessing!</button>
          </Modal>
        );
      }

      return (
        <Modal onClose={this.handleCloseLastGuess}>
          <div className="large-icon mb-1">🤦‍♀️</div>
          <p>Wrong guess</p>
          <button onClick={this.handleCloseLastGuess}>Oh well...</button>
        </Modal>
      );
    }

    return (
      <Popup
        key={`popup-${lastGuess.key}`}
        cssModifier={lastGuess.correct ? 'popup--success' : 'popup--error'}
        onClose={this.handleCloseLastGuess}
      >
        <b>{lastGuess.correct ? 'Correct!' : 'Wrong!'}</b><br/>
        {lastGuess.player.name} guessed <span className="block-text">{lastGuess.guessedPlayer.name}</span> said <span className="block-text">{limitText(lastGuess.guessedAnswer.text, 150)}</span>
      </Popup>
    );
  }

  get gamePageKey() {
    return this.game.lastGuess?.key;
  }

  renderInner() {
    const game = this.game;

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
        return <RoundMyTurn
          key={this.gamePageKey}
          game={game}
          onSubmitGuess={this.handleSubmitGuess}
        />;
      }

      return <RoundWaiting
        key={this.gamePageKey}
        game={game}
      />;
    } else if (game.status === EGameStatus.RoundResults) {
      return <RoundResults
        game={game}
        onNextRound={this.handleNextRound}
        onAddPrompt={this.handleAddPrompt}
      />;
    }

    return 'Unhandled state';
  }

  render() {
    if (!this.state.connected) {
      return <Modal>Loading...</Modal>;
    }

    return (
      <div className="game-of-things game-page">
        <div className="game-page__content" id="game_page_content">
          {this.renderInner()}
        </div>

        {this.renderLastGuess()}
      </div>
    );
  }
}
