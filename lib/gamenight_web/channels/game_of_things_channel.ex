defmodule GamenightWeb.GameOfThingsChannel do
  use GamenightWeb, :channel

  def join("game_of_things:" <> game_id, payload, socket) do
    if authorized?(payload) do
      socket = assign(socket, :game_id, game_id)
      socket = assign(socket, :player_id, payload["player_id"])

      # TODO handle games that don't exist
      case Gamenight.Liebrary.Game.get_state(socket.assigns.game_id) do
        {:ok, game_state} ->
          {:ok, game_state, socket}
        {:error, resp} ->
          {:error, resp}
      end
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  def handle_in("ping", payload, socket) do
    {:reply, {:ok, payload}, socket}
  end

  # It is also common to receive messages from the client and
  # broadcast to everyone in the current topic (game:lobby).
  def handle_in("shout", payload, socket) do
    broadcast socket, "shout", payload
    {:noreply, socket}
  end

  def handle_in("request_join", payload, socket) do
    msg = Gamenight.GameOfThings.Game.request_join(socket.assigns.game_id, payload["name"])

    case msg do
      {:ok, %{player_id: player_id}} ->
        broadcast_game_updated(socket)

        {:reply, msg, assign(socket, :player_id, player_id)}
      _ ->
        {:reply, msg, socket}
    end
  end

  def handle_in("force_reconnect", _payload, _socket) do
    :ok = :error
  end

  def handle_in("start_game", _payload, socket) do
    msg = Gamenight.GameOfThings.Game.start_game(socket.assigns.game_id)

    broadcast_game_updated(socket)

    {:reply, msg, socket}
  end

  def handle_in("add_prompt", payload, socket) do
    msg = Gamenight.GameOfThings.Game.add_prompt(
      socket.assigns.game_id,
      socket.assigns.player_id,
      payload["prompt"]
    )

    broadcast_game_updated(socket)

    {:reply, msg, socket}
  end

  def handle_in("submit_answer", payload, socket) do
    msg = Gamenight.GameOfThings.Game.submit_answer(
      socket.assigns.game_id,
      socket.assigns.player_id,
      payload["answer"]
    )

    broadcast_game_updated(socket)

    {:reply, msg, socket}
  end

  def handle_in("guess", payload, socket) do
    msg = Gamenight.GameOfThings.Game.guess(
      socket.assigns.game_id,
      socket.assigns.player_id,
      payload["answer_id"],
      payload["player_id"]
    )

    broadcast_game_updated(socket)

    {:reply, msg, socket}
  end

  def handle_in("start_next_round", _payload, socket) do
    msg = Gamenight.GameOfThings.Game.start_next_round(
      socket.assigns.game_id,
      socket.assigns.player_id
    )

    broadcast_game_updated(socket)

    {:reply, msg, socket}
  end

  defp broadcast_game_updated(socket) do
    {:ok, game_state} = Gamenight.GameOfThings.Game.get_state(socket.assigns.game_id)
    broadcast socket, "game_updated", game_state
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
