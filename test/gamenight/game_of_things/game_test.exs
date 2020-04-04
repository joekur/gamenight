defmodule Gamenight.GameOfThings.GameTest do
  use ExUnit.Case

  alias Gamenight.GameOfThings.Game

  def player_ids(game_id) do
    {:ok, player_ids} = Game.player_ids(game_id)
    player_ids
  end

  def first_player_id(game_id) do
    player_ids(game_id) |> List.first
  end

  def started_game do
    {:ok, game_id} = Game.create_game

    Game.request_join(game_id, "Alice")
    Game.request_join(game_id, "Bob")
    Game.request_join(game_id, "George")

    player_id = first_player_id(game_id)
    :ok = Game.add_prompt(game_id, player_id, "First prompt")
    :ok = Game.add_prompt(game_id, player_id, "Second prompt")
    :ok = Game.add_prompt(game_id, player_id, "Third prompt")

    Game.start_game(game_id)

    game_id
  end

  test "it can create a new game" do
    {:ok, game_id} = Game.create_game
    {:ok, state} = Game.get_state(game_id)
    assert state.status == :lobby
  end

  test "it can join new players" do
    {:ok, game_id} = Game.create_game
    {:ok, %{player_id: player_id, name: name}} = Game.request_join(game_id, "John")
    assert name == "John"
    assert String.length(player_id) > 1
  end

  test "it does not allow joining if the game has already started" do
    game_id = started_game()

    {status, resp} = Game.request_join(game_id, "Unlucky")
    assert status == :error
    assert String.length(resp.message) > 1
  end

  test "after joining you can submit prompts" do
    {:ok, game_id} = Game.create_game
    {:ok, %{player_id: player_id, name: _name}} = Game.request_join(game_id, "John")

    :ok = Game.add_prompt(game_id, player_id, "First prompt")
  end

  test "after starting the game players can submit answers" do
    game_id = started_game()

    {:ok, state} = Game.get_state(game_id)
    assert state.status == :round_answers
    assert state.round.prompt != nil

    player_ids = player_ids(game_id)

    Enum.each(player_ids, fn player_id ->
      :ok = Game.submit_answer(game_id, player_id, "answer #{player_id}")
    end)

    {:ok, state} = Game.get_state(game_id)
    assert state.status == :round_guessing
  end
end
