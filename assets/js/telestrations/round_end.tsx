import * as React from 'react';
import bind from 'bind-decorator';
import { Game } from './game';

interface IProps {
  game: Game;
  onNextRound: () => void;
}

export default class RoundEnd extends React.Component<IProps, {}> {
  render() {
    const { game } = this.props;

    if (game.iAmVIP) {
      return (
        <div>
          <div className="game-card">
            <button className="button" onClick={this.props.onNextRound}>
              Start Next Round
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="game-card centered">
        Waiting on {game.vip.name} to start the next round.
      </div>
    );
  }
}
