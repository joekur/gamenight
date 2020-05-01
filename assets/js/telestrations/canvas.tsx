import * as React from 'react';
import bind from 'bind-decorator';

import Icon from '../shared/icon';
import { Slider } from '@material-ui/core';
import CanvasDraw from 'react-canvas-draw-joekur';

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

interface IProps {
  onChange: (canvas: CanvasDraw) => void;
}

interface IState {
  outerWidth: number;
  brushSize: number;
  brushColor: string;
}

export default class Canvas extends React.Component<IProps, IState> {
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

  loadSaveData(drawingData: string) {
    this.canvas.loadSaveData(drawingData, true);
  }

  getLines() {
    return JSON.parse(this.canvas.getSaveData()).lines;
  }

  toPNG(): string {
    return this.canvas.canvasContainer.children[1].toDataURL();
  }

  componentDidMount() {
    this.setState({ outerWidth: this.outerRef.current!.clientWidth });
  }

  get brushRadius(): number {
    const ratio = this.state.brushSize / 100;

    return minBrushRadius + (maxBrushRadius - minBrushRadius) * ratio * ratio;
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

  get canvas() {
    return this.canvasRef.current;
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

  renderBrushPreview() {
    const styles = {
      borderWidth: this.brushRadius + 'px',
      background: this.state.brushColor,
      borderColor: this.state.brushColor,
    };

    return (
      <div className="drawing__brush-preview pull-left">
        <div className="drawing__brush-preview__brush" style={styles}/>
      </div>
    );
  }

  renderControls() {
    return (
      <div className="drawing__controls">
        <div className="clearfix">
          {this.renderBrushPreview()}
          <div className="drawing__slider pull-left">
            <Slider value={this.state.brushSize} onChange={this.handleChangeBrushSize} aria-labelledby="continuous-slider" />
          </div>
          <div className="pull-right">
            <button className="button button--secondary button--no-pad" onClick={this.handleUndo}><Icon icon="undo" /></button>
          </div>
        </div>
        <div className="drawing__swatches">
          {this.renderSwatches()}
        </div>
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
          onChange={this.props.onChange}
        />
        {this.renderControls()}
      </div>
    );
  }
}
