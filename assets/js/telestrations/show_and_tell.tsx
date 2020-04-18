import * as React from 'react';
import bind from 'bind-decorator';
import { Game } from './game';

interface IProps {
  game: Game;
  onStepForward: () => void;
}

export default class ShowAndTell extends React.Component<IProps, {}> {
  renderWhoIsStoryteller() {
    const { game } = this.props;

    if (game.iAmShowAndTeller) {
      return (
        <div className="game-card">
          You are show-and-telling! Read each story aloud and give players time to laugh and enjoy as you step through the evolution of your original prompt.
        </div>
      );
    }

    return (
      <div className="game-card">
        {game.currentShowAndTeller.name} is currently show-and-telling!
      </div>
    );
  }

  renderStep() {
    const { game } = this.props;

    return (
      <div className="show-and-tell__step">
        {game.storytellingStep}/{game.totalStorytellingSteps}
      </div>
    );
  }

  renderWritingOrDrawing() {
    const { game } = this.props;

    if (game.showAndTellWriting) {
      const writing = game.showAndTellWriting;
      return (
        <div className="game-card mt-2">
          <div className="show-and-tell__player">{writing.player.name}</div>
          {this.renderStep()}
          <p className="mt mb">{writing.text}</p>
        </div>
      );
    }

    const drawing = game.showAndTellDrawing!;
    return (
      <div className="game-card mt-2">
        <div className="show-and-tell__player">{drawing.player.name}</div>
        {this.renderStep()}
        <div className="drawing-img">
          <img src={drawing.src} />
        </div>
      </div>
    );
  }

  renderStepForward() {
    const { game } = this.props;

    if (game.iAmShowAndTeller) {
      const text = game.storytellingStep === game.totalStorytellingSteps ? 'Finish' : 'Next';
      return (
        <div className="game-card">
          <button className="button" onClick={this.props.onStepForward}>
            {text}
          </button>
        </div>
      );
    }
  }

  render() {
    return (
      <div>
        {this.renderWhoIsStoryteller()}
        {this.renderWritingOrDrawing()}
        {this.renderStepForward()}
      </div>
    );
  }
}
