import * as React from 'react';
import { Game } from './game';

interface IProps {
  game: Game,
}

const CurrentPrompt: React.SFC<IProps> = (props) => {
  const { game } = props;

  return (
    <div className="current-prompt">
      <div className="current-prompt__heading">Prompt</div>
      {game.currentPrompt}
    </div>
  );
}

export default CurrentPrompt;
