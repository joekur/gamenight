import * as React from 'react';
import bind from 'bind-decorator';
import { Game, IDrawing } from './game';
import { scrollToTop } from '../utilities';
import Icon from '../shared/icon';

interface IProps {
  game: Game;
  onStepForward: () => void;
  onStepBack: () => void;
}

export default class ShowAndTell extends React.Component<IProps, {}> {
  componentDidMount() {
    scrollToTop();
  }

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
      <div className="clearfix">
        <div className="game-card mt-2">
          <div className="show-and-tell__player">{drawing.player.name}</div>
          {this.renderStep()}
          <div className="drawing-img">
            <img src={drawing.src} />
          </div>
          <a
            href={drawing.src}
            className="button button--secondary wide mt-2"
            download={`${drawing.player.name}-drawing.png`}
          ><Icon icon="download" /> Download</a>
        </div>
      </div>
    );
  }

  renderButtons() {
    const { game } = this.props;

    const nextText = game.storytellingStep === game.totalStorytellingSteps ? 'Finish' : 'Next';

    const backBtn = (
      <div className="col">
        <button className="button button--secondary wide" onClick={this.props.onStepBack}>
          <Icon icon="arrow-left" /> Prev
        </button>
      </div>
    );

    return (
      <div className="flex-grid">
        {game.storytellingStep > 1 ? backBtn : null}
        <div className="col">
          <button className="button wide" onClick={this.props.onStepForward}>
            {nextText} <Icon icon="arrow-right" />
          </button>
        </div>
      </div>
    );
  }

  renderStepForward() {
    const { game } = this.props;

    if (game.iAmShowAndTeller) {
      return (
        <div className="game-card">
          {this.renderButtons()}
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
