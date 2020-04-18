import * as React from 'react';
import bind from 'bind-decorator';
import { Game } from './game';

import CanvasDraw from 'react-canvas-draw-joekur';
import { Slider } from '@material-ui/core';
import Icon from '../shared/icon';
import { scrollToTop } from '../utilities';

interface IProps {
  game: Game;
  onSubmit: (drawingBase64: string) => void;
}

interface IState {
  outerWidth: number;
  brushSize: number;
  brushColor: string;
}

const aspectRatio = 1.0;

const minBrushRadius = 1;
const maxBrushRadius = 15;
const startingBrushRadius = 4;

const colors = [
  '#444',
  '#fff',
  '#bf5e19',
  '#ff6553',
  '#ffcc78',
  '#bf5eff',
  '#4bc485',
  '#45a4ff',
]

interface ISwatchProps {
  color: string;
  selected: boolean;
  onChoose: (color: string) => void;
}

const Swatch: React.SFC<ISwatchProps> = ({ color, selected, onChoose }) => {
  const handleChoose = (e: React.MouseEvent) => {
    e.preventDefault();
    onChoose(color);
  }

  const style = { backgroundColor: color, borderColor: color };

  return (
    <div
      className={`drawing__swatch ${selected && 'drawing__swatch--selected'}`}
      onClick={handleChoose}
      style={style}
    />
  );
}

export default class Drawing extends React.Component<IProps, IState> {
  private outerRef = React.createRef<HTMLDivElement>();
  private canvasRef = React.createRef<CanvasDraw>();

  constructor(props: IProps) {
    super(props);

    this.state = {
      outerWidth: document.body.clientWidth,
      brushSize: (startingBrushRadius - minBrushRadius) * 100 / (maxBrushRadius - minBrushRadius),
      brushColor: colors[0],
    };
  }

  componentDidMount() {
    scrollToTop();

    this.setState({ outerWidth: this.outerRef.current!.clientWidth });

    setTimeout(() => {
      const prevDrawingData = window.localStorage.getItem(this.localStorageKey);
      if (!!prevDrawingData) {
        this.canvas.loadSaveData(prevDrawingData, true);
      }
    }, 100);
  }

  get localStorageKey() {
    return `draw-history:${this.props.game.id}`;
  }

  get canvas() {
    return this.canvasRef.current;
  }

  get brushRadius(): number {
    const ratio = this.state.brushSize / 100;

    return minBrushRadius + (maxBrushRadius - minBrushRadius) * ratio * ratio;
  }

  @bind
  handleSubmit(e: React.MouseEvent) {
    e.preventDefault();

    const drawingBase64 = this.canvasRef.current.canvasContainer.children[1].toDataURL()
    window.localStorage.clear();
    this.props.onSubmit(drawingBase64);
  }

  @bind
  handleCanvasUpdate(canvas: CanvasDraw) {
    const saveData = canvas.getSaveData();
    window.localStorage.setItem(this.localStorageKey, saveData);
  }

  @bind
  handleChangeBrushSize(e: object, newValue: number) {
    this.setState({ brushSize: newValue });
  }

  @bind
  handleChangeColor(color: string) {
    this.setState({ brushColor: color });
  }

  @bind
  handleUndo(e: React.MouseEvent) {
    e.preventDefault();
    this.canvas.undo();
  }

  renderSwatches() {
    return colors.map(color => {
      return <Swatch
        key={color}
        color={color}
        selected={color === this.state.brushColor}
        onChoose={this.handleChangeColor}
        />;
    });
  }

  renderControls() {
    return (
      <div className="drawing__controls">
        <div className="drawing__slider">
          <Slider value={this.state.brushSize} onChange={this.handleChangeBrushSize} aria-labelledby="continuous-slider" />
        </div>
        <div className="drawing__swatches">
          {this.renderSwatches()}
        </div>
        <button className="button button--secondary button--no-pad" onClick={this.handleUndo}><Icon icon="undo" /></button>
      </div>
    );
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
        {this.renderWriting()}
        <div ref={this.outerRef} className="drawing noselect">
          <CanvasDraw
            ref={this.canvasRef}
            canvasWidth={this.state.outerWidth}
            canvasHeight={this.state.outerWidth / aspectRatio}
            lazyRadius={1}
            brushRadius={this.brushRadius}
            brushColor={this.state.brushColor}
            hideGrid
            hideInterface
            onChange={this.handleCanvasUpdate}
          />
          {this.renderControls()}
        </div>
        <button onClick={this.handleSubmit} className="mt-2">
          Submit
        </button>
      </div>
    );
  }
}
