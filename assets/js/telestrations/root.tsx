import * as React from 'react';

interface IProps {
  gameId: string,
}

interface IState {
}

export default class Root extends React.Component<IProps, IState> {
  render() {
    return 'Telestrations!';
  }
}
