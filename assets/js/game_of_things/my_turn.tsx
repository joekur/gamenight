import * as React from 'react';
import bind from 'bind-decorator';
import { Game, IPlayer } from './game';
import AnswerList from './answer_list';

interface IProps {
  game: Game,
}

interface IState {
  selectedAnswerId: string | null,
  selectedPlayerId: string | null,
}

export default class MyTurn extends React.Component<IProps, IState> {
  state = {
    selectedAnswerId: null,
    selectedPlayerId: null,
  };

  componentWillMount() {
    this.setState({
      selectedPlayerId: null
    });
  }

  @bind
  handleSelectAnswer(id: string) {
    this.setState({ selectedAnswerId: id });
  }

  @bind
  handleSelectPlayer(id: string) {
    this.setState({ selectedPlayerId: id });
  }

  renderSubmitChoice() {
    return (
      <div>
        <button
        >

        </button>
      </div>
    );
  }

  renderAnswerList() {
    if (this.state.selectedAnswerId) { return null; }

    return <AnswerList
      game={this.props.game}
      onClick={this.handleSelectAnswer}
      selectedId={this.state.selectedAnswerId}
    />;
  }

  renderPlayerChoice(player: IPlayer) {
    return (
      <li key={`player-choice-${player.id}`}>
        {player.name}
      </li>
    );
  }

  renderPlayerList() {
    if (!this.state.selectedAnswerId) { return null; }

    const { game } = this.props;
    const players = game.otherActivePlayers;

    return (
      <div>
        <h3>Players</h3>
        <ul>
          {players.map(player => this.renderPlayerChoice(player))}
        </ul>
      </div>
    );
  }

  render() {
    return (
      <div>
        <p>Your turn!</p>
        {this.renderAnswerList()}
        {this.renderPlayerList()}
      </div>
    );
  };
}
