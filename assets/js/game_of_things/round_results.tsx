import * as React from 'react';
import bind from 'bind-decorator';
import { Game } from './game';
import PromptForm from './prompt_form';

interface IProps {
  game: Game,
  onNextRound: () => void,
  onAddPrompt: (prompt: string) => void,
}

export default class RoundWaiting extends React.Component<IProps, {}> {
  @bind
  handleNextRound(e: any) {
    e.preventDefault();

    this.props.onNextRound();
  }

  renderPoints() {
    let i = 0;

    return this.props.game.playerPoints.map(score => {
      i += 1;

      return (
        <div className="leaderboard__player" key={`score-${score.player.id}`}>
          <span className="leaderboard__player__name">
            {i}. {score.player.name}
          </span>
          <span className="leaderboard__player__score">
            {score.points}
          </span>
        </div>
      );
    });
  }

  render() {
    return (
      <div>
        <h3>Round over!</h3>

        <div className="game-card">
          <h3 className="header">Scores</h3>
          <div className="leaderboard">
            {this.renderPoints()}
          </div>
        </div>

        <PromptForm
          title="Add more prompts:"
          onAddPrompt={this.props.onAddPrompt}
        />

        <div className="game-card">
          <button
            onClick={this.handleNextRound}
          >Start Next Round</button>
        </div>
      </div>
    );
  };
}
