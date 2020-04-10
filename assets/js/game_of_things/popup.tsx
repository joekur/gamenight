import * as React from 'react';

interface IProps {
  onClose?: () => void,
  cssModifier?: string,
}

const Popup: React.SFC<IProps> = ({ onClose, cssModifier, children }) => {
  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    onClose && onClose();
  }

  return (
    <div className={`popup ${cssModifier}`}>
      {onClose && <a className="popup__close" onClick={handleClick}><i className="fas fa-times"></i></a>}

      {children}
    </div>
  );
}

export default Popup;
