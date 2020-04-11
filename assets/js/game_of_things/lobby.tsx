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

const minPlayers = 3;

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

  renderNoPlayersYet() {
    if (this.props.game.playerIds.length === 0) {
      return <li>No players yet!</li>;
    }

    return null;
  }

  renderPlayerList() {
    const { game } = this.props;

    return (
      <div className="lobby__members">
        <h3 className="lobby__members-header">Players</h3>
        <ul className="lobby__members-list">
          {this.renderNoPlayersYet()}
          {game.playerIds.map(playerId => (<li key={playerId}>{game.nameFor(playerId)}</li>))}
        </ul>
      </div>
    );
  }

  get readyToStart() {
    const { game } = this.props;

    return game.numPlayers >= minPlayers;
  }

  renderStartGame() {
    const { game } = this.props;
    if (!game.amPlayer) { return null; }

    return (
      <div className="game-card">
        {!this.readyToStart && <div className="button-info">Need at least 3 players</div>}
        <button onClick={this.props.onStartGame} disabled={!this.readyToStart}>
          Start Game
        </button>
      </div>
    );
  }

  renderPromptForm() {
    const { game } = this.props;
    if (!game.amPlayer) { return null; }

    return (
      <PromptForm
        onAddPrompt={this.props.onAddPrompt}>
        <p className="condensed-note">We have a bunch of prompts ready to go, but you can create your own to play with here!</p>
      </PromptForm>
    );
  }

  render() {
    const { game } = this.props;

    return (
      <div className="lobby">
        <div className="lobby__game-id lobby__game-header">
          Join at gamenight.lol/ <span className="lobby__game-header__code">{game.id}</span>
        </div>

        {game.amPlayer ? this.renderActivePlayerView() : this.renderJoinGame()}

        {this.renderPlayerList()}
        {this.renderPromptForm()}
        {this.renderStartGame()}
      </div>
    );
  }
}
