import * as React from 'react';
import bind from 'bind-decorator';
import { Game } from './game';
import AnswerList from './answer_list';
import CurrentPrompt from './current_prompt';
import LeaderboardModal from './leaderboard_modal';

interface IProps {
  game: Game,
}

export default class RoundWaiting extends React.Component<IProps, {}> {
  renderWhoseTurn() {
    const { game } = this.props;
    const player = game.currentPlayer;

    return (
      <div className="turn">
        <div className="turn__inner">
          {player.name} is guessing...
          <LeaderboardModal game={game} />
        </div>
        {this.renderOutOfTheRound()}
      </div>
    );
  };

  renderOutOfTheRound() {
    const { game } = this.props;
    if (game.amStillInTheRound) { return null; }

    return (
      <div className="turn__out">
        You are out of this round 😔
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.renderWhoseTurn()}
        <CurrentPrompt game={this.props.game} />
        <AnswerList
          game={this.props.game}
        />
      </div>
    );
  };
}
