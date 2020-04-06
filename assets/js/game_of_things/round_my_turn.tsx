import * as React from 'react';
import bind from 'bind-decorator';
import { Game, IPlayer } from './game';
import AnswerList from './answer_list';
import CurrentPrompt from './current_prompt';

interface IProps {
  game: Game,
  onSubmitGuess: (answerId: string, playerId: string) => void,
}

interface IState {
  selectedAnswerId: string | null,
  selectedPlayerId: string | null,
}

export default class RoundMyTurn extends React.Component<IProps, IState> {
  state = {
    selectedAnswerId: null,
    selectedPlayerId: null,
  };

  // TODO dont use componentWillMount
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
    this.resetState();
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
    const classes = `choices__choice choices__choice--clickable ${player.id === this.state.selectedPlayerId && 'choices__choice--selected'}`;
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
          <h3 className="header">You chose:</h3>
          <p className="well">
            {game.findAnswer(this.state.selectedAnswerId!).text}
          </p>
          <a
            href="#"
            onClick={this.handleCancelAnswerSelection}
          >←Choose a different answer</a>
        </div>

        <h3 className="header mt">Who do you think wrote it?</h3>

        <div className="choices">
          <ul className="choices__list">
            {players.map(player => this.renderPlayerChoice(player))}
          </ul>
        </div>

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
        <div className="turn">
          <div className="turn__inner turn__inner--mine">Your turn!</div>
        </div>
        <CurrentPrompt game={this.props.game} />
        {this.renderAnswerList()}
        {this.renderPlayerList()}
      </div>
    );
  };
}