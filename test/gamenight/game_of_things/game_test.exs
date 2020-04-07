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

  def game_in_guessing do
    game_id = started_game()
    player_ids = player_ids(game_id)

    Enum.each(player_ids, fn player_id ->
      :ok = Game.submit_answer(game_id, player_id, "answer #{player_id}")
    end)

    game_id
  end

  def current_player(game_id) do
    {:ok, state} = Game.get_state(game_id)
    state.round.current_player
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
    assert state.round.active_players |> length == player_ids |> length
    assert state.round.answer_ids |> length == player_ids |> length
  end

  test "only valid player ids can submit answers" do
    game_id = started_game()

    {status, resp} = Game.submit_answer(game_id, nil, "my answer")
    assert status == :error
    assert String.length(resp.message) > 1

    {status, resp} = Game.submit_answer(game_id, "bad_player_id", "my answer")
    assert status == :error
    assert String.length(resp.message) > 1
  end

  test "guessing correctly removes that player and their answer from the active lists" do
    game_id = started_game()
    player_ids = player_ids(game_id)

    Enum.each(player_ids, fn player_id ->
      :ok = Game.submit_answer(game_id, player_id, "answer #{player_id}")
    end)

    {:ok, state} = Game.get_state(game_id)
    current_player = state.round.current_player
    other_player = state.round.active_players |> Enum.at(1)

    :ok = Game.guess(game_id, current_player, other_player, other_player)

    {:ok, state} = Game.get_state(game_id)
    assert state.round.current_player == current_player
    assert !Enum.member?(state.round.active_players, other_player)
    assert !Enum.member?(state.round.answer_ids, other_player)
    assert state.scores[current_player] == 1
  end

  test "guessing incorrectly moves the current player down the line" do
    game_id = game_in_guessing()
    player_ids = player_ids(game_id)

    turns = Enum.reduce(0..6, [], fn _i, turns ->
      current_player = current_player(game_id)
      other_players = player_ids |> List.delete(current_player)
      :ok = Game.guess(
        game_id,
        current_player,
        other_players |> Enum.at(0),
        other_players |> Enum.at(1)
      )

      [current_player | turns]
    end)

    assert turns |> Enum.slice(0, 3) |> Enum.sort ==
      player_ids |> Enum.sort
    assert turns |> Enum.slice(3, 3) |> Enum.sort ==
      player_ids |> Enum.sort
  end

  test "guessing records the last guess in the state" do
    game_id = game_in_guessing()
    current_player = current_player(game_id)

    other_players = player_ids(game_id) |> List.delete(current_player)
    guess_answer = other_players |> List.first
    guess_player = guess_answer
    :ok = Game.guess(game_id, current_player, guess_answer, guess_player)
    {:ok, state} = Game.get_state(game_id)

    last_guess = state.round.last_guess
    assert last_guess.player_id == current_player
    assert last_guess.guessed_answer_id == guess_answer
    assert last_guess.guessed_player_id == guess_player
    assert last_guess.correct == true
    assert last_guess.key != nil

    other_players = player_ids(game_id) |> List.delete(current_player)
    guess_answer = current_player
    guess_player = other_players |> List.first
    :ok = Game.guess(game_id, current_player, guess_answer, guess_player)
    {:ok, state} = Game.get_state(game_id)

    last_guess = state.round.last_guess
    assert last_guess.player_id == current_player
    assert last_guess.guessed_answer_id == guess_answer
    assert last_guess.guessed_player_id == guess_player
    assert last_guess.correct == false
    assert last_guess.key != nil
  end

  test "only the current player can guess" do
    game_id = game_in_guessing()
    current_player = current_player(game_id)

    {status, resp} = Game.guess(game_id, nil, current_player, current_player)
    assert status == :error
    assert String.length(resp.message) > 1

    {status, resp} = Game.guess(game_id, "bad player id", current_player, current_player)
    assert status == :error
    assert String.length(resp.message) > 1

    waiting_player = player_ids(game_id) |> List.delete(current_player) |> List.first
    {status, resp} = Game.guess(game_id, waiting_player, current_player, current_player)
    assert status == :error
    assert String.length(resp.message) > 1
  end

  test "once all have been guessed but the last current player's, we move to the next round" do
    game_id = game_in_guessing()

    {:ok, state} = Game.get_state(game_id)
    first_prompt = state.round.prompt
    current_player = current_player(game_id)
    other_players = player_ids(game_id) |> List.delete(current_player)

    Enum.each(other_players, fn player_id ->
      :ok = Game.guess(game_id, current_player, player_id, player_id)
    end)

    {:ok, state} = Game.get_state(game_id)
    assert state.scores[current_player] == 2
    assert state.status == :round_results

    :ok = Game.start_next_round(game_id, current_player)

    {:ok, state} = Game.get_state(game_id)
    assert state.status == :round_answers
    assert state.round.prompt != first_prompt
  end
end
