import * as React from 'react';
import bind from 'bind-decorator';
import { Game } from './game';
import Modal from './modal';

interface IProps {
  game: Game,
}

interface IState {
  open: boolean,
}

export default class LeaderboardModal extends React.Component<IProps, IState> {
  state = {
    open: false,
  }

  @bind
  handleOpenLeaderboard() {
    this.setState({ open: true });
  }

  @bind
  handleCloseLeaderboard(e?: MouseEvent) {
    e?.stopPropagation();
    this.setState({ open: false });
  }

  renderPoints() {
    const { game } = this.props;
    let i = 0;

    return game.playerPoints.map(score => {
      i += 1;

      let classes = 'leaderboard__player';
      const isOut = !game.playerStillInTheRound(score.player.id);
      if (isOut) {
        classes += ' leaderboard__player--out';
      }
      if (i === 1 && game.clearWinner) {
        classes += ' leaderboard__player--leader';
      }

      return (
        <div
          className={classes}
          key={`score-${score.player.id}`}
        >
          <span className="leaderboard__player__name">
            {i}. {score.player.name} {isOut && '😵'}
          </span>
          <span className="leaderboard__player__score">
            {score.points}
          </span>
        </div>
      );
    });
  }

  renderLeaderboardModal() {
    return (
      <Modal onClose={this.handleCloseLeaderboard}>
        <div className="leaderboard mb-2">
          {this.renderPoints()}
        </div>
        <button onClick={this.handleCloseLeaderboard}>Back to the game</button>
      </Modal>
    );
  }

  render() {
    return (
      <div className="leaderboard-button" onClick={this.handleOpenLeaderboard}>
        <i className="fa fa-trophy" />
        {this.state.open && this.renderLeaderboardModal()}
      </div>
    );
  }
}
