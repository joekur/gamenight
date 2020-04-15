import * as React from 'react';

interface IProps {
  icon: string;
}

const Icon: React.SFC<IProps> = ({ icon }) => {
  return <i className={`fa fa-${icon}`} />;
}

export default Icon;
