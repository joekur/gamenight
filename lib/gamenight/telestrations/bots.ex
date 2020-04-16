defmodule Gamenight.Telestrations.Bots do
  alias __MODULE__
  alias Gamenight.Telestrations.Game

  defstruct [:game_id, :player_ids]

  @names [
    "Alice",
    "Bob",
    "George",
    "Liz",
    "Gregory",
    "Jaime",
    "Luke",
    "Vadar",
  ]

  @drawing_src "foo drawing src"

  def create_game(num_bots) do
    {:ok, game_id} = Game.create_game

    player_ids = Enum.reduce(0..num_bots-1, [], fn i, player_ids ->
      {:ok, %{player_id: player_id}} = Game.request_join(game_id, @names |> Enum.at(i))

      [player_id | player_ids]
    end) |> Enum.reverse

    %Bots{game_id: game_id, player_ids: player_ids}
  end

  def write_stories(bots) do
    {:ok, state} = Game.get_state(bots.game_id)

    bots.player_ids
    |> Enum.each(fn player_id ->
      name = state.player_names[player_id]
      :ok = Game.write_story(bots.game_id, player_id, "#{name} wrote this story")
    end)

    broadcast_updated(bots)
  end

  def draw_stories(bots) do
    bots.player_ids
    |> Enum.each(fn player_id ->
      :ok = Game.draw_story(bots.game_id, player_id, @drawing_src)
    end)

    broadcast_updated(bots)
  end

  def broadcast_updated(bots) do
    {:ok, state} = Game.get_state(bots.game_id)
    GamenightWeb.Endpoint.broadcast("telestrations:#{bots.game_id}", "game_updated", state)
  end
end
