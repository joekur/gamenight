import * as React from 'react';
import bind from 'bind-decorator';
import { Game } from './game';

interface IProps {
  game: Game,
  onClick?: (id: string) => void,
  selectedId?: string | null,
}

export default class AnswerList extends React.Component<IProps, {}> {
  @bind
  handleClick(e: MouseEvent, guessId: string) {
    e.preventDefault();

    const { onClick } = this.props;
    onClick && onClick(guessId);
  }

  renderAnswers() {
    const { game, onClick, selectedId } = this.props;

    return game.answerList.map(guess => {
      const isSelected = selectedId && selectedId === guess.id;
      const classes = `choices__choice ${isSelected && 'choices__choice--selected'} ${this.props.onClick && 'choices__choice--clickable'}`;

      return (
        <li
          className={classes}
          onClick={(e) => { this.handleClick(e, guess.id) }}
          key={`guess-${guess.id}`}
        >
          {guess.text}
        </li>
      );
    });
  }

  render() {
    return (
      <div className="choices">
        <h3 className="header">Answers:</h3>
        <ul className="choices__list">
          {this.renderAnswers()}
        </ul>
      </div>
    );
  };
}
