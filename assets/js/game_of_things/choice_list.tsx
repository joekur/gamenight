import * as React from 'react';
import bind from 'bind-decorator';

interface IChoice {
  id: string,
  text: string,
}

interface IProps {
  choices: IChoice[],
  selectedId: string | null,
  onClick: (id: string) => void,
  onCancelSelection: () => void,
  title: string,
}

export default class ChoiceList extends React.Component<IProps, {}> {
  @bind
  handleClick(e: React.MouseEvent, id: string) {
    e.preventDefault();

    const { onClick } = this.props;
    onClick(id);
  }

  @bind
  handleCancelSelection(e: React.MouseEvent) {
    e.preventDefault();

    const { onCancelSelection } = this.props;
    onCancelSelection();
  }

  get selectedChoice() {
    return this.props.choices.find(choice => choice.id === this.props.selectedId);
  }

  renderAllChoices() {
    const { choices, onClick, selectedId } = this.props;

    return choices.map(choice => {
      return (
        <li
          className="choices__choice choices__choice--clickable"
          onClick={(e) => { this.handleClick(e, choice.id) }}
          key={`choice-${choice.id}`}
        >
          {choice.text}
        </li>
      );
    });
  }

  renderSelectedChoice() {
    return (
      <li key="choice-selected" className="choices__choice choices__choice--selected choices__choice--clickable">
        {this.selectedChoice!.text}
      </li>
    );
  }

  renderChoices() {
    if (this.props.selectedId) {
      return this.renderSelectedChoice();
    }

    return this.renderAllChoices();
  }

  renderCancelChoice() {
    if (!this.props.selectedId) { return null; }

    return (
      <a
        href="#"
        onClick={this.handleCancelSelection}
      >←Change Selection</a>
    );
  }

  render() {
    return (
      <div className="choices mb-2">
        <h3 className="header">{this.props.title}</h3>
        <ul className="choices__list">
          {this.renderChoices()}
        </ul>
        {this.renderCancelChoice()}
      </div>
    );
  };
}
