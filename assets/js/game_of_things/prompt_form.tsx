import * as React from 'react';
import bind from 'bind-decorator';

interface IProps {
  onAddPrompt: (prompt: string) => void,
}

interface IState {
  promptInput: string;
}

export default class PromptForm extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      promptInput: '',
    };
  }

  @bind
  handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    this.setState({ promptInput: e.target.value });
  }

  @bind
  handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const text = this.state.promptInput;
    if (text && text.length > 0) {
      this.props.onAddPrompt(text);
      this.setState({ promptInput: '' });
    }
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <textarea
            value={this.state.promptInput}
            onChange={this.handleChange} />
          <button type="submit">Add Prompt</button>
        </form>
      </div>
    );
  }
}
