import * as React from 'react';
import bind from 'bind-decorator';

interface IProps {
  onClose?: () => void,
}

// https://css-tricks.com/prevent-page-scrolling-when-a-modal-is-open/
function fixBody() {
  // When the modal is shown, we want a fixed body
  document.body.style.position = 'fixed';
  document.body.style.top = `-${window.scrollY}px`;
}

function unfixBody() {
  // When the modal is hidden...
  const scrollY = document.body.style.top;
  document.body.style.position = '';
  document.body.style.top = '';
  window.scrollTo(0, parseInt(scrollY || '0') * -1);
}

export default class Modal extends React.Component<IProps, {}> {
  componentDidMount() {
    fixBody();
  }

  componentWillUnmount() {
    unfixBody();
  }

  @bind
  handleClose(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const { onClose } = this.props;
    onClose && onClose();
  }

  render() {
    const { onClose, children } = this.props;

    return (
      <div className="modal">
        {onClose && <a className="modal__close" onClick={this.handleClose}><i className="fas fa-times"></i></a>}
        <div className="modal__body">
          {children}
        </div>
      </div>
    );
  }
}
