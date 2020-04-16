defmodule Gamenight.Telestrations.BotsTest do
  use ExUnit.Case

  alias Gamenight.Telestrations.Bots
  alias Gamenight.Telestrations.Game

  def current_player(game_id) do
    {:ok, state} = Game.get_state(game_id)
    state.round.current_player
  end

  test "it can create a game with additional players that can take turns" do
    bots = Bots.create_game(4)
    game_id = bots.game_id

    {:ok, state} = Game.get_state(game_id)
    assert state.player_ids |> length == 4

    :ok = Game.start_game(game_id)
    Bots.write_stories(bots)

    {:ok, state} = Game.get_state(game_id)
    assert state.status == Game.statuses().drawing

    Bots.draw_stories(bots)

    {:ok, state} = Game.get_state(game_id)
    assert state.status == Game.statuses().interpreting
  end
end
