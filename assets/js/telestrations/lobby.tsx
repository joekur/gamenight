import * as React from 'react';
import bind from 'bind-decorator';
import { Game, IPlayer } from './game';

interface IProps {
  game: Game,
  onRequestJoinGame: (name: string) => void,
  onLeaveLobby: () => void,
  onStartGame: () => void,
}

interface IState {
  nameInput: string;
}

const minPlayers = 4;
const maxNameLength = 15;

export default class Lobby extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      nameInput: '',
    };
  }

  @bind
  handleSubmitJoinGame(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const name = this.state.nameInput;
    if (name && name.length > 0) {
      this.props.onRequestJoinGame(name);
    }
  }

  @bind
  handleChangeName(e: React.ChangeEvent<HTMLInputElement>) {
    const newName = e.target.value;
    if (newName && newName.length > 10) { return; }

    this.setState({ nameInput: newName });
  }

  renderActivePlayerView() {
    return (
      <div className="centered">
        <div className="lobby__joined">
          <b>You've successfully joined the game!</b>
        </div>
        <button className="button button--danger button--small mt-1" onClick={this.props.onLeaveLobby}>
          Leave Game
        </button>
      </div>
    );
  }

  renderJoinGame() {
    return (
      <div className="lobby__join">
        <form onSubmit={this.handleSubmitJoinGame}>
          <input
            type="text"
            placeholder="Your Name"
            value={this.state.nameInput}
            onChange={this.handleChangeName} />
          <button type="submit">Join Game</button>
        </form>
      </div>
    );
  }

  renderNoPlayersYet() {
    if (this.props.game.players.length === 0) {
      return 'No players yet - be the first to join!';
    }

    return null;
  }

  renderPlayerList() {
    const { game } = this.props;

    return (
      <div className="game-card">
        <h3 className="lobby__members-header">
          Players
        </h3>
        <ul className="lobby__members-list">
          {this.renderNoPlayersYet()}
          {game.players.map(player => this.renderPlayer(player))}
        </ul>
      </div>
    );
  }

  renderPlayer(player: IPlayer) {
    return (
      <li key={player.id}>
        {player.name}
      </li>
    );
  }

  renderInstructions() {
    return (
      <div className="game-card">
        <h3 className="header">How To Play</h3>

        <ol className="rules__list">
          <li>1.) <b>Telestrations is a goofy game of drawing telephone.</b> Everyone will start the game by writing a sentence or phrase that they would like the next person to draw.</li>
          <li>2.) The next person will draw what they read. This will continue until everyone has gotten the chance to write or draw for each story.</li>
           <li>3.) At the end, each person will take turns narrating their story that the group created together.</li>
           <li>4.) There's no keeping score - everyone wins! Just try not to have your drink come through your nose when you laugh... because that's gross.</li>
        </ol>

      </div>
    );
  }

  get readyToStart() {
    const { game } = this.props;

    return game.players.length >= minPlayers;
  }

  renderStartGame() {
    const { game } = this.props;
    if (!game.amPlayer) { return null; }

    if (game.iAmVIP) {
      return (
        <div className="game-card">
          {!this.readyToStart && <div className="button-info">Need at least {minPlayers} players</div>}
          <button onClick={this.props.onStartGame} disabled={!this.readyToStart} className="button wide">
            Start Game
          </button>
        </div>
      );
    }

    return (
      <div className="game-card centered">
        Waiting on {game.vip.name} to start the game.
      </div>
    );
  }

  render() {
    const { game } = this.props;

    return (
      <div className="lobby">
        <div className="lobby__game-id lobby__game-header">
          Join at gamenight.lol/<span className="lobby__game-header__code">{game.id}</span>
        </div>

        {game.amPlayer ? this.renderActivePlayerView() : this.renderJoinGame()}

        {this.renderPlayerList()}
        {this.renderInstructions()}
        {this.renderStartGame()}
      </div>
    );
  }
}
