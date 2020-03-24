import * as React from 'react';

export default class Liebrary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      gameStatus: 'lobby',
      playerId: null,
      name: null,
    };

    this.input = React.createRef();
    this.handleSubmitJoinGame = this.handleSubmitJoinGame.bind(this);
    this.handleJoinSuccess = this.handleJoinSuccess.bind(this);
  }

  componentDidMount() {
    this.joinChannel();
  }

  joinChannel() {
    const topic = `game:${this.props.gameId}`;
    this.channel = window.socket.channel(topic, {});
    this.channel.join()
      .receive('ok', resp => { console.log(`Joined '${topic}' successfully`, resp) })
      .receive('error', resp => { console.log('Unable to join', resp) });

    this.channel.on('player_joined', payload => {
      console.log(`${payload.name} joined`);
    });
  }

  isPlayer() {
    return !!this.state.playerId;
  }

  handleSubmitJoinGame(e) {
    e.preventDefault();
    const name = this.input.current.value;

    this.channel.push('request_join', { name })
      .receive('ok', this.handleJoinSuccess)
      .receive('error', this.handleUnknownError)
      .receive('timeout', this.handleUnknownError);
  }

  handleJoinSuccess(response) {
    console.log('join success', response);
    this.setState({ playerId: response.player_id, name: response.name });
  }

  handleUnknownError(response) {
    console.error('UnknownError', response);
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

  renderLobbyPlayerView() {
    return (
      <div>
        <b>Joined!</b> - {this.state.name}
      </div>
    );
  }

  renderLobby() {
    return (
      <div>
        <div>
          Game: {this.props.gameId}
        </div>
        {this.isPlayer() ? this.renderLobbyPlayerView() : this.renderJoinGame()}
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
