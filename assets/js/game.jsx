import * as React from 'react';
import * as ReactDOM from 'react-dom';

// import Liebrary from './liebrary/root';
import GameOfThings from './game_of_things/root';

export default {
  connect: function(gameId, domId) {
    ReactDOM.render(<GameOfThings gameId={gameId} />, document.getElementById(domId));
  },
}
