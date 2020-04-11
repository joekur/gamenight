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
    return this.props.game.playerPoints.map(score => {
      return (
        <div key={`score-${score.player.id}`}>
          {score.player.name}: {score.points} points
        </div>
      );
    });
  }

  render() {
    return (
      <div>
        <h3>Round over!</h3>
        <div className="scores">
          <h4>Scores</h4>
          {this.renderPoints()}
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
