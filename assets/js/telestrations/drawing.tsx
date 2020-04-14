import * as React from 'react';
import bind from 'bind-decorator';
import { Game } from './game';

import CanvasDraw from 'react-canvas-draw-joekur';
import { Slider } from '@material-ui/core';

interface IProps {
  game: Game;
  pageWidth: number;
}

interface IState {
  outerWidth: number;
  brushSize: number;
  brushColor: string;
}

const aspectRatio = 3.0 / 3.0;
const lsKey = 'draw-history';

const minBrushRadius = 1;
const maxBrushRadius = 15;

const colors = [
  '#444',
  '#fff',
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
      brushSize: 10,
      brushColor: colors[0],
    };
  }

  componentDidMount() {
    this.setState({ outerWidth: this.outerRef.current!.clientWidth });

    setTimeout(() => {
      const prevDrawingData = window.localStorage.getItem(lsKey);
      if (!!prevDrawingData) {
        // this.canvas.loadSaveData(prevDrawingData, true);
      }
    }, 100);
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
    console.log('canvas data', this.canvasRef.current.canvasContainer.children[1].toDataURL());
  }

  @bind
  handleCanvasUpdate(canvas: CanvasDraw) {
    const saveData = canvas.getSaveData();
    window.localStorage.setItem(lsKey, saveData);
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
        <button onClick={this.handleUndo}>Undo</button>
      </div>
    );
  }

  render() {
    return (
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
        <button onClick={this.handleSubmit} className="mt-2">
          Submit
        </button>
      </div>
    );
  }
}
