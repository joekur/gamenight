import * as React from 'react';
import bind from 'bind-decorator';
import { Game } from './game';
import CurrentPrompt from './current_prompt';

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
        <ul>
          {this.renderPlayerStatusItems()}
        </ul>
      </div>
    );
  }

  renderWaitingForOthers() {
    const { game } = this.props;

    return (
      <div className="game-card">
        <div className="waiting-room__header">Just sit pretty while everyone submits their answers...</div>

        <div className="waiting-room__list ">
          {this.renderPlayerStatuses()}
        </div>
      </div>
    );
  }

  render() {
    const { game } = this.props;

    if (game.alreadySubmittedAnswer) {
      return this.renderWaitingForOthers();
    }

    return (
      <div className="game-card">
        <CurrentPrompt game={game} />
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
