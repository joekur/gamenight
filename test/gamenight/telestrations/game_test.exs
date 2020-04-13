defmodule Gamenight.Telestrations.GameTest do
  use ExUnit.Case

  alias Gamenight.Telestrations.Game

  def started_game do
    {:ok, game_id} = Game.create_game

    Game.request_join(game_id, "Alice")
    Game.request_join(game_id, "Bob")
    Game.request_join(game_id, "George")

    Game.start_game(game_id)

    game_id
  end

  def get_status(game_id) do
    {:ok, state} = Game.get_state(game_id)
    state.status
  end

  def player_ids(game_id) do
    {:ok, state} = Game.get_state(game_id)
    state.player_ids
  end

  test "it can create a new game" do
    {:ok, game_id} = Game.create_game
    {:ok, state} = Game.get_state(game_id)
    assert state.status == Game.statuses.lobby
  end

  test "it can join new players" do
    {:ok, game_id} = Game.create_game
    {:ok, %{player_id: player_id, name: name}} = Game.request_join(game_id, "John")
    assert name == "John"
    assert String.length(player_id) > 1

    {:ok, state} = Game.get_state(game_id)
    assert state.player_ids == [player_id]
    assert state.player_names[player_id] == name
  end

  test "it can start the game with 3 players" do
    {:ok, game_id} = Game.create_game
    {:ok, _} = Game.request_join(game_id, "Bob")
    {:ok, _} = Game.request_join(game_id, "Alice")
    {:ok, _} = Game.request_join(game_id, "John")

    :ok = Game.start_game(game_id)

    {:ok, state} = Game.get_state(game_id)
    assert state.status == Game.statuses.writing
  end

  test "it moves to drawing after everyone has written their story" do
    game_id = started_game()

    Enum.each(game_id |> player_ids, fn player_id ->
      :ok = Game.write_story(game_id, player_id, "story #{player_id}")
    end)

    {:ok, state} = Game.get_state(game_id)
    assert state.status == Game.statuses.drawing

    Enum.each(game_id |> player_ids, fn player_id ->
      writing = state.round.stories[player_id].writings |> List.first
      assert writing.text == "story #{player_id}"
      assert writing.player_id == player_id
    end)
  end

  test "it switches between drawing and writing until it's gone all the way around" do
    # 3 players
    game_id = started_game()

    {:ok, state} = Game.get_state(game_id)
    assert state.status == Game.statuses.writing
    assert state.round.step == 0

    Enum.each(game_id |> player_ids, fn player_id ->
      :ok = Game.write_story(game_id, player_id, "story #{player_id}")
    end)

    {:ok, state} = Game.get_state(game_id)
    assert state.status == Game.statuses.drawing
    assert state.round.step == 1

    Enum.each(game_id |> player_ids, fn player_id ->
      :ok = Game.draw_story(game_id, player_id, "src #{player_id}")
    end)

    {:ok, state} = Game.get_state(game_id)
    assert state.status == Game.statuses.writing
    assert state.round.step == 2

    Enum.each(game_id |> player_ids, fn player_id ->
      :ok = Game.write_story(game_id, player_id, "story #{player_id}")
    end)

    {:ok, state} = Game.get_state(game_id)
    assert state.status == Game.statuses.show_and_tell
    assert state.round.current_storyteller != nil
  end
end
