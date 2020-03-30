import * as React from 'react';
import { Game } from './game';

interface IProps {
  game: Game,
  onVote: (id: string) => void,
}

export default class RoundLies extends React.Component<IProps, {}> {
  renderChoices() {
    const { game } = this.props;

    return game.votingList.map(({ id, firstLine }) => {
      return (
        <div
          className="voting-choice"
          key={`choice-${id}`}
          onClick={() => this.props.onVote(id)}
        >
          {firstLine}
        </div>
      );
    });
  }

  renderMakeVote() {
    return (
      <div>
        <h3>Time to vote!</h3>
        {this.renderChoices()}
      </div>
    );
  }

  renderAlreadyVoted() {
    return (
      <div>
        <h3>Sit tight...</h3>
      </div>
    );
  }

  render() {
    if (this.props.game.alreadyVoted) {
      return this.renderAlreadyVoted();
    }

    return this.renderMakeVote();
  }
}
