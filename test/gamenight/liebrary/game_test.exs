defmodule Gamenight.Liebrary.GameTest do
  use ExUnit.Case

  alias Gamenight.Liebrary.Game

  def first_player_id(game_id) do
    {:ok, player_ids} = Game.player_ids(game_id)
    player_ids |> List.first
  end

  def started_game do
    {:ok, game_id} = Game.create_game
    Game.request_join(game_id, "Alice")
    Game.request_join(game_id, "Bob")
    Game.start_game(game_id)

    game_id
  end

  def game_in_voting do
    game_id = started_game()
    {:ok, player_ids} = Game.player_ids(game_id)

    Enum.each(player_ids, fn player_id ->
      :ok = Game.submit_lie(game_id, player_id, "my lie #{player_id}")
    end)

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

  test "it has a limit on the number of players" do
    {:ok, game_id} = Game.create_game

    for _i <- 1..8 do
      {:ok, _resp} = Game.request_join(game_id, "Player")
    end

    {status, resp} = Game.request_join(game_id, "Unlucky")
    assert status == :error
    assert String.length(resp.message) > 1
  end

  test "it does not allow joining if the game has already started" do
    game_id = started_game()

    {status, resp} = Game.request_join(game_id, "Unlucky")
    assert status == :error
    assert String.length(resp.message) > 1
  end

  test "after starting the game, each player can submit a lie" do
    game_id = started_game()
    player_id = first_player_id(game_id)
    :ok = Game.submit_lie(game_id, player_id, "my lie")

    {:ok, state} = Game.get_state(game_id)
    assert state.round.lies[player_id] == "my lie"
  end

  test "once everyone has submitted a lie, the game progresses to voting" do
    game_id = started_game()
    {:ok, player_ids} = Game.player_ids(game_id)
    Enum.each(player_ids, fn player_id ->
      :ok = Game.submit_lie(game_id, player_id, "my lie #{player_id}")
    end)

    {:ok, state} = Game.get_state(game_id)
    assert state.status == :round_voting
  end

  test "after submissions, each player can vote once" do
    game_id = game_in_voting()
    {:ok, player_ids} = Game.player_ids(game_id)
    player_1_id = player_ids |> Enum.at(0)
    player_2_id = player_ids |> Enum.at(1)

    {:ok, state} = Game.get_state(game_id)
    assert state.status == :round_voting
    assert state.round.votes == %{}

    :ok = Game.submit_vote(game_id, player_1_id, player_2_id)

    {:ok, state} = Game.get_state(game_id)
    assert state.round.votes[player_1_id] == player_2_id

    {status, resp} = Game.submit_vote(game_id, player_1_id, player_2_id)
    assert status == :error
    assert String.length(resp.message) > 1
  end

  test "once progressed to voting, each player is given a list of player ids along with an id for the real title to vote on" do
    game_id = game_in_voting()
    {:ok, player_ids} = Game.player_ids(game_id)
    player_1_id = player_ids |> Enum.at(0)
    player_2_id = player_ids |> Enum.at(1)

    {:ok, state} = Game.get_state(game_id)
    assert state.round.voting_lists[player_1_id] |> length == 2
    assert state.round.voting_lists[player_2_id] |> length == 2
    assert !Enum.member?(state.round.voting_lists[player_1_id], player_1_id)
    assert Enum.member?(state.round.voting_lists[player_1_id], player_2_id)
  end

  test "once everyone votes, it progresses to round_results status" do
    game_id = game_in_voting()
    {:ok, player_ids} = Game.player_ids(game_id)
    player_1_id = player_ids |> Enum.at(0)
    player_2_id = player_ids |> Enum.at(1)

    :ok = Game.submit_vote(game_id, player_1_id, player_2_id)
    :ok = Game.submit_vote(game_id, player_2_id, player_1_id)

    {:ok, state} = Game.get_state(game_id)
    assert state.status == :round_results
  end
end
