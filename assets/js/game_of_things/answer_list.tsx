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
      const classes = `choice-list__choice ${isSelected && 'choice-list__choice--selected'} ${this.props.onClick && 'choice-list__choice--clickable'}`;

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
      <ul className="choice-list">
        {this.renderAnswers()}
      </ul>
    );
  };
}
