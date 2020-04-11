defmodule Gamenight.GameOfThings.Bots do
  alias __MODULE__
  alias Gamenight.GameOfThings.Game

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

  def create_game(num_bots) do
    {:ok, game_id} = Game.create_game

    player_ids = Enum.reduce(0..num_bots-1, [], fn i, player_ids ->
      {:ok, %{player_id: player_id}} = Game.request_join(game_id, @names |> Enum.at(i))

      [player_id | player_ids]
    end) |> Enum.reverse

    %Bots{game_id: game_id, player_ids: player_ids}
  end

  def answer(bots) do
    {:ok, state} = Game.get_state(bots.game_id)

    bots.player_ids
    |> Enum.with_index
    |> Enum.each(fn({player_id, _i}) ->
      name = state.players[player_id]
      :ok = Game.submit_answer(bots.game_id, player_id, "#{name}'s answer")
    end)

    broadcast_updated(bots)
  end

  def take_turn(bots, guess_correctly) do
    game_id = bots.game_id
    {:ok, state} = Game.get_state(game_id)
    current_player = state.round.current_player
    active_players = state.round.active_players

    other_player = active_bots(bots) |> List.delete(current_player) |> List.first ||
      active_players |> List.delete(current_player) |> List.first

    if guess_correctly do
      Game.guess(game_id, current_player, other_player, other_player)
    else
      Game.guess(game_id, current_player, current_player, other_player)
    end

    broadcast_updated(bots)
  end

  def broadcast_updated(bots) do
    {:ok, state} = Game.get_state(bots.game_id)
    GamenightWeb.Endpoint.broadcast("game_of_things:#{bots.game_id}", "game_updated", state)
  end

  defp active_bots(bots) do
    game_id = bots.game_id
    {:ok, state} = Game.get_state(game_id)

    state.round.active_players

    Set.intersection(Enum.into(state.round.active_players, HashSet.new), Enum.into(bots.player_ids, HashSet.new)) |> Set.to_list
  end
end
