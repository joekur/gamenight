defmodule GamenightWeb.GameChannel do
  use GamenightWeb, :channel

  def join("game:" <> game_id, payload, socket) do
    if authorized?(payload) do
      socket = assign(socket, :game_id, game_id)
      game_state = Gamenight.Liebrary.Game.get_state(socket.assigns.game_id)

      {:ok, game_state, socket}
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
    msg = Gamenight.Liebrary.Game.request_join(socket.assigns.game_id, payload["name"])

    broadcast_game_updated(socket)

    {:reply, msg, socket}
  end

  defp broadcast_game_updated(socket) do
    game_state = Gamenight.Liebrary.Game.get_state(socket.assigns.game_id)
    broadcast socket, "game_updated", game_state
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
