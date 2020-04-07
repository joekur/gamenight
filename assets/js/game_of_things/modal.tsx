import * as React from 'react';

interface IProps {
  onClose?: () => void,
}

const Modal: React.SFC<IProps> = ({ onClose, children }) => {
  return (
    <div className="modal">
      {onClose && <a className="modal__close" onClick={onClose}><i className="fas fa-times"></i></a>}
      <div className="modal__body">
        {children}
      </div>
    </div>
  );
}

export default Modal;
