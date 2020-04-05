import * as React from 'react';
import bind from 'bind-decorator';
import { Game, IPlayer } from './game';
import AnswerList from './answer_list';

interface IProps {
  game: Game,
  onSubmitGuess: (answerId: string, playerId: string) => void,
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
    this.resetState();
  }

  resetState() {
    this.setState({
      selectedAnswerId: null,
      selectedPlayerId: null,
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

  @bind
  handleSubmit(e: any) {
    e.preventDefault();

    if (this.state.selectedPlayerId && this.state.selectedPlayerId) {
      this.props.onSubmitGuess(
        this.state.selectedAnswerId!,
        this.state.selectedPlayerId!
      );
      this.resetState();
    }
  }

  @bind
  handleCancelAnswerSelection(e: any) {
    e.preventDefault();
    this.setState({ selectedAnswerId: null });
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
    const classes = `choice-list__choice choice-list__choice--clickable ${player.id === this.state.selectedPlayerId && 'choice-list__choice--selected'}`;
    return (
      <li
        key={`player-choice-${player.id}`}
        className={classes}
        onClick={() => { this.handleSelectPlayer(player.id) }}
      >
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
        <div>
          <p className="well">
            {game.findAnswer(this.state.selectedAnswerId!).text}
          </p>
          <a
            href="#"
            onClick={this.handleCancelAnswerSelection}
          >←Choose a different answer</a>
        </div>

        <h3 className="mt">Now choose who you think said it:</h3>
        <ul className="choice-list">
          {players.map(player => this.renderPlayerChoice(player))}
        </ul>
        <button
          disabled={!this.state.selectedPlayerId}
          onClick={this.handleSubmit}
        >
          Submit
        </button>
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
