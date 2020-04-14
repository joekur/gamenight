import * as React from 'react';
import bind from 'bind-decorator';
import { Game } from './game';

import CanvasDraw from 'react-canvas-draw-joekur';

interface IProps {
  game: Game;
  pageWidth: number;
}

interface IState {
  outerWidth: number;
}

const aspectRatio = 3.0 / 4;

export default class Drawing extends React.Component<IProps, IState> {
  private outerRef = React.createRef<HTMLDivElement>();
  private canvasRef = React.createRef<CanvasDraw>();

  constructor(props: IProps) {
    super(props);

    this.state = {
      outerWidth: document.body.clientWidth,
    };
  }

  componentDidMount() {
    this.setState({ outerWidth: this.outerRef.current!.clientWidth });
  }

  @bind
  handleSubmit(e: React.MouseEvent) {
    e.preventDefault();
    console.log('canvas data', this.canvasRef.current.canvasContainer.children[1].toDataURL());
  }

  render() {
    return (
      <div ref={this.outerRef}>
        <CanvasDraw
          ref={this.canvasRef}
          canvasWidth="100%"
          canvasHeight={this.state.outerWidth / aspectRatio}
          lazyRadius={1}
          brushRadius={5}
          hideGrid
          hideInterface
        />
        <button onClick={this.handleSubmit} className="mt-2">
          Submit
        </button>
      </div>
    );
  }
}
