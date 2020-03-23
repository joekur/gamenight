import * as React from 'react';

export default class Liebrary extends React.Component {
  componentDidMount() {
    this.joinChannel();
  }

  joinChannel() {
    const topic = `game:${this.props.gameId}`;
    this.channel = window.socket.channel(topic, {});
    this.channel.join()
      .receive("ok", resp => { console.log(`Joined '${topic}' successfully`, resp) })
      .receive("error", resp => { console.log("Unable to join", resp) });
  }

  render() {
    return (
      <div>
        Game: {this.props.gameId}
      </div>
    );
  }
}
