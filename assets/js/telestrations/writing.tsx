import * as React from 'react';
import bind from 'bind-decorator';
import { Game } from './game';

interface IProps {
  game: Game;
  onSubmit: (story: string) => void;
}

interface IState {
  story: string;
}

export default class Writing extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      story: '',
    };
  }

  @bind
  handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    this.setState({ story: e.target.value });
  }

  @bind
  handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const text = this.state.story;
    if (text && text.length > 0) {
      this.props.onSubmit(text);
    }
  }

  render() {
    const { game } = this.props;

    return (
      <div className="game-card">
        <form onSubmit={this.handleSubmit}>
          <label>Write a word, a phrase, a sentence, a story...</label>
          <textarea
            value={this.state.story}
            onChange={this.handleChange} />
          <button type="submit">Submit Answer</button>
        </form>
      </div>
    );
  }
}
