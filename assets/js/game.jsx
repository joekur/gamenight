import * as React from 'react';
import * as ReactDOM from 'react-dom';

import GameOfThings from './game_of_things/root';
import Liebrary from './liebrary/root';
import Telestrations from './telestrations/root';

function buildComponent(gameId, gameType) {
  if (gameType === 'game_of_things') {
    return <GameOfThings gameId={gameId} />;
  } else if (gameType === 'liebrary') {
    return <Liebrary gameId={gameId} />;
  } else if (gameType === 'telestrations') {
    return <Telestrations gameId={gameId} />;
  } else {
    console.error('Unknown game type:', gameType);
  };
}

export default {
  connect: function(gameId, gameType, domId) {
    const component = buildComponent(gameId, gameType);
    ReactDOM.render(component, document.getElementById(domId));
  },
}
