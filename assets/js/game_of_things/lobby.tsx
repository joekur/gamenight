import * as React from 'react';
import bind from 'bind-decorator';
import { Game } from './game';
import PromptForm from './prompt_form';

interface IProps {
  game: Game,
  onRequestJoinGame: (name: string) => void,
  onAddPrompt: (prompt: string) => void,
  onStartGame: () => void,
}

interface IState {
  nameInput: string;
}

// TODO change back to
const minPlayers = 2;

export default class Lobby extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      nameInput: '',
    };
  }

  @bind
  handleSubmitJoinGame(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const name = this.state.nameInput;
    if (name && name.length > 0) {
      this.props.onRequestJoinGame(name);
    }
  }

  @bind
  handleChangeName(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ nameInput: e.target.value });
  }

  renderActivePlayerView() {
    return (
      <div className="lobby__joined">
        <b>You've successfully joined the game!</b>
      </div>
    );
  }

  renderJoinGame() {
    return (
      <div className="lobby__join">
        <form onSubmit={this.handleSubmitJoinGame}>
          <input
            type="text"
            placeholder="Your Name"
            value={this.state.nameInput}
            onChange={this.handleChangeName} />
          <button type="submit">Join Game</button>
        </form>
      </div>
    );
  }

  renderPlayerList() {
    const { game } = this.props;

    return (
      <div className="lobby__members">
        <h3 className="lobby__members-header">Players</h3>
        <ul className="lobby__members-list">
          {game.playerIds.map(playerId => (<li key={playerId}>{game.nameFor(playerId)}</li>))}
        </ul>
      </div>
    );
  }

  renderStartGame() {
    const { game } = this.props;

    if (game.numPlayers < minPlayers) {
      return null;
    }

    return (
      <div className="lobby__start">
        <button onClick={this.props.onStartGame}>
          Start Game
        </button>
      </div>
    );
  }

  render() {
    const { game } = this.props;

    return (
      <div className="lobby">
        <div className="lobby__game-id lobby__game-header">
          Game room code: {game.id}
        </div>

        {game.amPlayer ? this.renderActivePlayerView() : this.renderJoinGame()}

        {this.renderPlayerList()}
        <PromptForm
          onAddPrompt={this.props.onAddPrompt}
        />
        {this.renderStartGame()}
      </div>
    );
  }
}
