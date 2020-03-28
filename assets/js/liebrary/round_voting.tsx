import * as React from 'react';
import { Game } from './game';

interface IProps {
  game: Game,
}

export default class RoundLies extends React.Component<IProps, {}> {
  render() {
    return 'time to vote!';
  }
}
