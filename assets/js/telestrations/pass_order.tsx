import * as React from 'react';
import { Game } from './game';
import Icon from '../shared/icon';

interface IProps {
  game: Game;
}

const PassOrder: React.SFC<IProps> = ({ game }) => {
  return (
    <div className="pass-order">
      <span className="pass-order__player">
        {game.receivingFromPlayer!.name}
      </span>
      <Icon icon="long-arrow-alt-right" />
      <span className="pass-order__player pass-order__player--me">
        Me
      </span>
      <Icon icon="long-arrow-alt-right" />
      <span className="pass-order__player">
        {game.passingToPlayer!.name}
      </span>
    </div>
  );
}

export default PassOrder;
