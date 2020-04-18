import * as React from 'react';
import bind from 'bind-decorator';
import { Game } from './game';
import { scrollToTop } from '../utilities';

interface IProps {
  game: Game;
  onSubmit: (writing: string) => void;
}

interface IState {
  writing: string;
}

export default class Interpreting extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      writing: '',
    };
  }

  componentDidMount() {
    scrollToTop();
  }

  @bind
  handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    this.setState({ writing: e.target.value });
  }

  @bind
  handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const text = this.state.writing;
    if (text && text.length > 0) {
      this.props.onSubmit(text);
    }
  }

  render() {
    const { game } = this.props;

    return (
      <div>
        <div className="game-card">
          <div className="drawing-img">
            <img src={game.currentDrawingToInterpret.src} />
          </div>
        </div>

        <div className="game-card">
          <form onSubmit={this.handleSubmit}>
            <label>Describe what you see in the drawing above!</label>
            <textarea
              value={this.state.writing}
              onChange={this.handleChange} />
            <button type="submit">Submit</button>
          </form>
        </div>
      </div>
    );
  }
}
