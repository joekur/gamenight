import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Liebrary from './liebrary/root';

export default {
  connect: function(gameId, domId) {
    ReactDOM.render(<Liebrary gameId={gameId} />, document.getElementById(domId));
  },
}
