defmodule GamenightWeb.TelestrationsChannel do
  use GamenightWeb, :channel

  alias Gamenight.Telestrations.Game

  intercept ["game_updated"]

  def join("telestrations:" <> game_id, payload, socket) do
    if authorized?(payload) do
      socket = assign(socket, :game_id, game_id)
      socket = assign(socket, :player_id, payload["player_id"])

      # TODO handle games that don't exist
      resp = Game.get_player_state(socket.assigns.game_id, socket.assigns.player_id)
      case resp do
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
    msg = Game.request_join(socket.assigns.game_id, payload["name"])

    case msg do
      {:ok, %{player_id: player_id}} ->
        broadcast_game_updated(socket)

        {:reply, msg, assign(socket, :player_id, player_id)}
      _ ->
        {:reply, msg, socket}
    end
  end

  def handle_in("leave_lobby", _payload, socket) do
    msg = Game.leave_lobby(
      socket.assigns.game_id,
      socket.assigns.player_id
    )

    broadcast_game_updated(socket)

    {:reply, msg, socket}
  end

  def handle_in("start_game", _payload, socket) do
    msg = Game.start_game(socket.assigns.game_id)

    broadcast_game_updated(socket)

    {:reply, msg, socket}
  end

  def handle_in("write_story", payload, socket) do
    msg = Game.write_story(
      socket.assigns.game_id,
      socket.assigns.player_id,
      payload["text"]
    )

    broadcast_game_updated(socket)

    {:reply, msg, socket}
  end

  def handle_in("draw_story", payload, socket) do
    msg = Game.draw_story(
      socket.assigns.game_id,
      socket.assigns.player_id,
      payload["src"]
    )

    broadcast_game_updated(socket)

    {:reply, msg, socket}
  end

  def handle_in("step_forward_storytelling", _payload, socket) do
    msg = Game.step_forward_storytelling(
      socket.assigns.game_id,
      socket.assigns.player_id
    )

    broadcast_game_updated(socket)

    {:reply, msg, socket}
  end

  def handle_in("step_back_storytelling", _payload, socket) do
    msg = Game.step_back_storytelling(
      socket.assigns.game_id,
      socket.assigns.player_id
    )

    broadcast_game_updated(socket)

    {:reply, msg, socket}
  end

  def handle_in("start_next_round", _payload, socket) do
    msg = Game.start_next_round(socket.assigns.game_id)

    broadcast_game_updated(socket)

    {:reply, msg, socket}
  end

  def handle_out("game_updated", _, socket) do
    {:ok, state} = Game.get_player_state(socket.assigns.game_id, socket.assigns.player_id)

    push(socket, "game_updated", state)

    {:noreply, socket}
  end

  defp broadcast_game_updated(socket) do
    broadcast socket, "game_updated", %{}
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
