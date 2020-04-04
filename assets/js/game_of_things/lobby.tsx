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
      <div>
        <b>Joined!</b> - {this.props.game.myName}
      </div>
    );
  }

  renderJoinGame() {
    return (
      <div>
        <form onSubmit={this.handleSubmitJoinGame}>
          <input
            type="text"
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
      <div>
        <h3>Players</h3>
        <ul>
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
      <div>
        <button onClick={this.props.onStartGame}>
          Start Game
        </button>
      </div>
    );
  }

  render() {
    const { game } = this.props;

    return (
      <div>
        <div>
          Game: {game.id}
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
