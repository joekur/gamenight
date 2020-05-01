# Gamenight

### Quickstart
Run the Procfile (I use https://github.com/DarthSim/overmind, but you can use foreman):

```
$ overmind start
// OR $ foreman start
```

This runs docker-compose to boot postgres and run phoenix.

Alternatively, run each separately:
```
$ docker-compose up
$ mix phx.server
// OR for interactive console, $ iex -S phx.server
```

Visit localhost:4000

### Playing with bots

Start the server in iex so you can run commands in the terminal `$ iex -S phx.server`

Game of Things:
```elixir
# Starts a game with 4 bot players:
bots = Gamenight.GameOfThings.Bots.create_game(4)

# At this point you can join yourself, and start the game

# Fills in answers for all bot players:
Gamenight.GameOfThings.Bots.answer(bots)

# To have the current bot player make an answer, pass either
# 'true' for a correct guess or 'false' for an incorrect:
Gamenight.GameOfThings.Bots.take_turn(bots, true)
```

Telestrations:
```elixir
# Starts a game with 4 bot players:
bots = Gamenight.Telestrations.Bots.create_game(4)

# At this point you can join yourself, and start the game
Gamenight.Telestrations.Bots.start_game(bots)

# Submits a "story" for each player:
Gamenight.Telestrations.Bots.write_stories(bots)

# Submits a "drawing" for each player:
Gamenight.Telestrations.Bots.draw_stories(bots)

Gamenight.Telestrations.Bots.step_forward_show_and_tell(bots)
```
