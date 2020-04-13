import * as React from 'react';
import bind from 'bind-decorator';
import { Game, IPlayer } from './game';
import AnswerList from './answer_list';
import ChoiceList from './choice_list';
import CurrentPrompt from './current_prompt';
import LeaderboardModal from './leaderboard_modal';

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
  handleCancelAnswerSelection() {
    this.setState({ selectedAnswerId: null });
  }

  @bind
  handleCancelPlayerSelection() {
    this.setState({ selectedPlayerId: null });
  }

  @bind
  handleSubmit(e: any) {
    e.preventDefault();

    if (this.state.selectedPlayerId && this.state.selectedPlayerId) {
      this.props.onSubmitGuess(
        this.state.selectedAnswerId!,
        this.state.selectedPlayerId!
      );
    }
  }

  renderAnswerList() {
    const { game } = this.props;
    const players = game.otherActivePlayers;

    return (
      <ChoiceList
        choices={game.answerList}
        selectedId={this.state.selectedAnswerId}
        onClick={this.handleSelectAnswer}
        onCancelSelection={this.handleCancelAnswerSelection}
        title="Answers:"
      />
    );
  }

  renderPlayerList() {
    const { game } = this.props;
    const players = game.otherActivePlayers;

    return (
      <ChoiceList
        choices={players.map(player => ({ id: player.id, text: player.name }))}
        selectedId={this.state.selectedPlayerId}
        onClick={this.handleSelectPlayer}
        onCancelSelection={this.handleCancelPlayerSelection}
        title="Remaining Players:"
      />
    );
  }

  render() {
    const { game } = this.props;

    return (
      <div>
        <div className="turn">
          <div className="turn__inner turn__inner--mine">
            Your turn!
            <LeaderboardModal game={game} />
          </div>
        </div>
        <CurrentPrompt game={this.props.game} />
        {this.renderAnswerList()}
        {this.renderPlayerList()}
        <button
          disabled={!this.state.selectedPlayerId || !this.state.selectedAnswerId}
          onClick={this.handleSubmit}
        >
          Submit
        </button>
      </div>
    );
  };
}
