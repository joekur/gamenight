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
