import * as React from 'react';
import bind from 'bind-decorator';

interface IProps {
  onClose?: () => void,
  cssModifier?: string,
}

const gamePageId = 'game_page_content';

export default class Popup extends React.Component<IProps, {}> {
  private outerRef = React.createRef<HTMLDivElement>();

  @bind
  handleClick(e: React.MouseEvent) {
    const { onClose } = this.props;

    e.preventDefault();
    onClose && onClose();
  }

  componentDidMount() {
    const div = this.outerRef.current;
    if (!div) { return; }

    const height = div.offsetHeight;
    const el = document.getElementById(gamePageId);
    if (el) { el.style.paddingBottom = `${height + 10}px` ; }
  }

  componentWillUnmount() {
    const el = document.getElementById(gamePageId);
    if (el) { el.style.paddingBottom = ''; }
  }

  render() {
    const { onClose, cssModifier, children } = this.props

    return (
      <div className={`popup ${cssModifier}`} ref={this.outerRef}>
        {onClose && <a className="popup__close" onClick={this.handleClick}><i className="fas fa-times"></i></a>}

        {children}
      </div>
    );
  }
}
