import * as React from 'react';
import bind from 'bind-decorator';
import { Game } from './game';

interface IProps {
  game: Game,
  onSubmitAnswer: (answer: string) => void,
}

interface IState {
  answer: string;
}

export default class PromptForm extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      answer: '',
    };
  }

  @bind
  handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    this.setState({ answer: e.target.value });
  }

  @bind
  handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const text = this.state.answer;
    if (text && text.length > 0) {
      this.props.onSubmitAnswer(text);
    }
  }

  renderPrompt() {
    const { game } = this.props;

    return (
      <p>{game.currentPrompt}</p>
    );
  }

  renderPlayerStatusItems() {
    const { game } = this.props;

    return game.playerIds.map(playerId => {
      return (
        <li key={playerId}>
          {game.hasSubmittedAnswer(playerId) ? '✅ ' : '❌ '}
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

  render() {
    const { game } = this.props;

    if (game.alreadySubmittedAnswer) {
      return this.renderWaitingForOthers();
    }

    return (
      <div>
        {this.renderPrompt()}
        <form onSubmit={this.handleSubmit}>
          <label>Submit your answer</label>
          <textarea
            value={this.state.answer}
            onChange={this.handleChange} />
          <button type="submit">Submit Answer</button>
        </form>
      </div>
    );
  }
}
