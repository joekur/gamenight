import * as React from 'react';
import bind from 'bind-decorator';
import { Game } from './game';

import { scrollToTop } from '../utilities';
import Canvas from './canvas';
import PassOrder from './pass_order';
import CanvasDraw from 'react-canvas-draw-joekur';

interface IProps {
  game: Game;
  onSubmit: (drawingBase64: string) => void;
}

export default class Drawing extends React.Component<IProps, {}> {
  private canvasRef = React.createRef<Canvas>();

  componentDidMount() {
    scrollToTop();

    setTimeout(() => {
      const prevDrawingData = window.localStorage.getItem(this.localStorageKey);
      if (!!prevDrawingData) {
        this.canvas.loadSaveData(prevDrawingData);
      }
    }, 100);
  }

  get localStorageKey() {
    return `draw-history:${this.props.game.id}`;
  }

  get canvas() {
    return this.canvasRef.current!;
  }

  @bind
  handleSubmit(e: React.MouseEvent) {
    e.preventDefault();

    if(this.canvas.getLines().length === 0) {
      return;
    }

    window.localStorage.clear();
    this.props.onSubmit(this.canvas.toPNG());
  }

  @bind
  handleCanvasUpdate(canvas: CanvasDraw) {
    const saveData = canvas.getSaveData();
    window.localStorage.setItem(this.localStorageKey, saveData);
  }

  renderWriting() {
    const { game } = this.props;
    const currentWriting = game.currentWritingToDraw;

    return (
      <div className="game-card">
        {currentWriting.text}
      </div>
    );
  }

  render() {
    return (
      <div>
        <PassOrder game={this.props.game} />
        {this.renderWriting()}
        <Canvas
          ref={this.canvasRef}
          onChange={this.handleCanvasUpdate}
        />
        <button onClick={this.handleSubmit} className="mt-3 wide">
          Submit
        </button>
      </div>
    );
  }
}
