import * as React from 'react';
import bind from 'bind-decorator';
import { Game } from './game';

interface IProps {
  game: Game,
  onRequestJoinGame: (name: string) => void,
}

interface IState {
  nameInput: string;
}

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

  render() {
    return (
      <div>
        <div>
          Game: {this.props.game.id}
        </div>
        {this.props.game.amPlayer() ? this.renderActivePlayerView() : this.renderJoinGame()}
      </div>
    );
  }
}
