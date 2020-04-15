import * as React from 'react';
import bind from 'bind-decorator';
import { Game } from './game';

interface IProps {
  game: Game,
}

export default class Waiting extends React.Component<IProps, {}> {
  renderPlayerStatusItems() {
    const { game } = this.props;

    return game.players.map(player => {
      return (
        <li key={player.id}>
          {game.hasSubmitted(player.id) ? '✅ ' : '❌ '}
          {player.name}
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

  render() {
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
}
