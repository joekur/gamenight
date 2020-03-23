import * as React from 'react';

export default class Liebrary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      gameStatus: 'lobby',
    };

    this.input = React.createRef();
    this.handleSubmitJoinGame = this.handleSubmitJoinGame.bind(this);
  }

  componentDidMount() {
    this.joinChannel();
  }

  joinChannel() {
    console.log('lets join this channel');
    const topic = `game:${this.props.gameId}`;
    this.channel = window.socket.channel(topic, {});
    this.channel.join()
      .receive("ok", resp => { console.log(`Joined '${topic}' successfully`, resp) })
      .receive("error", resp => { console.log("Unable to join", resp) });

    this.channel.on('player_joined', payload => {
      console.log(`${payload.name} joined`);
    });
  }

  isPlayer() {
    return false;
  }

  handleSubmitJoinGame(e) {
    e.preventDefault();
    const name = this.input.current.value;

    this.channel.push('request_join', { name });
  }

  renderJoinGame() {
    return (
      <div>
        <form onSubmit={this.handleSubmitJoinGame}>
          <input type="text" label="name" ref={this.input} />
          <button type="submit">Join Game</button>
        </form>
      </div>
    );
  }

  renderLobby() {
    return (
      <div>
        <div>
          Game: {this.props.gameId}
        </div>
        {this.isPlayer() ? '' : this.renderJoinGame()}
      </div>
    );
  }

  render() {
    if (this.state.gameStatus === 'lobby') {
      return this.renderLobby();
    }

    return 'game started';
  }
}
