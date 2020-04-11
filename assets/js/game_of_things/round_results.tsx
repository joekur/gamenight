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
    const { game } = this.props;
    let i = 0;

    return game.playerPoints.map(score => {
      i += 1;

      let classes = 'leaderboard__player';
      if (i === 1 && game.clearWinner) {
        classes += ' leaderboard__player--leader';
      }

      return (
        <div className={classes} key={`score-${score.player.id}`}>
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
      <div className="turn">
        <h3 className="turn__inner turn__inner--noone">Round over!</h3>

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
