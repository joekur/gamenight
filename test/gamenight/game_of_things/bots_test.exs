defmodule Gamenight.GameOfThings.BotsTest do
  use ExUnit.Case

  alias Gamenight.GameOfThings.Bots
  alias Gamenight.GameOfThings.Game

  def current_player(game_id) do
    {:ok, state} = Game.get_state(game_id)
    state.round.current_player
  end

  test "it can create a game with additional players that can take turns" do
    bots = Bots.create_game(4)
    game_id = bots.game_id

    {:ok, player_ids} = Game.player_ids(game_id)
    assert player_ids |> length == 4

    :ok = Game.start_game(game_id)
    :ok = Bots.answer(bots)

    {:ok, state} = Game.get_state(game_id)
    assert state.status == :round_guessing

    first_player = current_player(game_id)
    :ok = Bots.take_turn(bots, false)

    second_player = current_player(game_id)
    assert second_player != first_player

    :ok = Bots.take_turn(bots, true)
    assert second_player == current_player(game_id)
    {:ok, state} = Game.get_state(game_id)
    assert state.round.active_players |> length == 3
  end
end
