import * as React from 'react';
import bind from 'bind-decorator';
import { Game } from './game';

interface IProps {
  game: Game,
  onClick?: (id: string) => void,
  selectedId?: string | null,
}

export default class AnswerList extends React.Component<IProps, {}> {
  renderAnswers() {
    const { game, onClick, selectedId } = this.props;

    return game.answerList.map(guess => {
      const isSelected = selectedId && selectedId === guess.id;
      const classes = `answer-list__answer ${isSelected && 'answer-list__answer--selected'}`;

      return (
        <li
          className={classes}
          onClick={() => { onClick && onClick(guess.id) }}
          key={`guess-${guess.id}`}
        >
          {guess.text}
        </li>
      );
    });
  }

  render() {
    return (
      <ul className="answer-list">
        {this.renderAnswers()}
      </ul>
    );
  };
}
