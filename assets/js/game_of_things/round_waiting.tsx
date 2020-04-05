import * as React from 'react';
import bind from 'bind-decorator';
import { Game } from './game';
import AnswerList from './answer_list';

interface IProps {
  game: Game,
}

interface IState {
}

export default class RoundWaiting extends React.Component<IProps, IState> {
  renderWhoseTurn() {
    const { game } = this.props;
    const player = game.currentPlayer;

    return (
      <p>
        It is {player.name}'s turn!
      </p>
    );
  };

  renderOutOfTheRound() {
    const { game } = this.props;
    if (game.amStillInTheRound) { return null; }

    return (
      <div className="notice">
        You are out of this round :(
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.renderWhoseTurn()}
        {this.renderOutOfTheRound()}
        <AnswerList
          game={this.props.game}
        />
      </div>
    );
  };
}
