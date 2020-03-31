import * as React from 'react';
import bind from 'bind-decorator';
import { Game } from './game';

interface IProps {
  game: Game,
  onSubmitLie: (lie: string) => void,
}

interface IState {
  lieInput: string;
}

export default class RoundLies extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      lieInput: '',
    };
  }

  @bind
  handleSubmitLie(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const { lieInput } = this.state;

    if (lieInput.length > 0) {
      this.props.onSubmitLie(lieInput);
    }
  }

  @bind
  handleChangeLie(e: React.ChangeEvent<HTMLTextAreaElement>) {
    this.setState({ lieInput: e.target.value });
  }

  renderLieForm() {
    return (
      <div>
        <form onSubmit={this.handleSubmitLie}>
          <textarea
            value={this.state.lieInput}
            onChange={this.handleChangeLie} />
          <button type="submit">Submit</button>
        </form>
        {this.renderPlayerStatuses()}
      </div>
    );
  }

  renderPlayerStatusItems() {
    const { game } = this.props;

    return game.playerIds.map(playerId => {
      return (
        <li key={playerId}>
          {game.hasSubmittedLie(playerId) ? '✅ ' : '❌ '}
          {game.nameFor(playerId)}
        </li>
      );
    });
  }

  renderPlayerStatuses() {
    return (
      <div>
        <h3>Players</h3>
        <ul>
          {this.renderPlayerStatusItems()}
        </ul>
      </div>
    );
  }

  renderWaitingForOthers() {
    const { game } = this.props;

    return (
      <div>
        <div>Just sit pretty...</div>
        {this.renderPlayerStatuses()}
      </div>
    );
  }

  renderBook() {
    const book = this.props.game.currentBook;

    return (
      <div>
        <div>Title: {book.title}</div>
        <div>Author: {book.author}</div>
        <div>Year: {book.year}</div>
      </div>
    );
  }

  render() {
    const { game } = this.props;

    if (game.alreadySubmittedLie) {
      return this.renderWaitingForOthers();
    }

    return (
      <div>
        {this.renderBook()}
        {this.renderLieForm()}
      </div>
    );
  }
}
