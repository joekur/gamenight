defmodule Gamenight.Liebrary.Game do
  use GenServer

  alias __MODULE__

  @derive Jason.Encoder
  defstruct [
    game_id: nil,
    status: :lobby,
    players: %{},
    round: %{}, # TODO use a struct or a typed map here?
  ]

  @min_players 2
  @max_players 8

  def find_game(game_id) do
    Registry.lookup(Gamenight.Registry, game_id)
      |> Enum.at(0)
  end

  def create_game do
    game_id = Gamenight.SlugGenerator.new_slug # TODO what about random collisions?
    state = %Game{game_id: game_id}

    Gamenight.GameRegistry.start_link(__MODULE__, state, game_id, :liebrary)

    {:ok, game_id}
  end

  def get_state(game_id) do
    # TODO we may not want to expose some of the state,
    # such as the current book's actual title
    try_call(game_id, :get_state)
  end

  def request_join(game_id, player_name), do: try_call(game_id, {:request_join, player_name})

  def start_game(game_id), do: try_call(game_id, :start_game)

  def submit_lie(game_id, player_id, lie), do: try_call(game_id, {:submit_lie, player_id, lie})

  def submit_vote(game_id, player_id, vote_id), do: try_call(game_id, {:submit_vote, player_id, vote_id})

  def player_ids(game_id) do
    case get_state(game_id) do
      {:ok, state} ->
        {:ok, state.players |> Map.keys}
      resp -> resp
    end
  end

  # Server

  def init(init_arg) do
    {:ok, init_arg}
  end

  def handle_call(:get_state, _from, state) do
    {:reply, {:ok, state}, state}
  end

  def handle_call(:status, _from, state) do
    {:reply, state.status, state}
  end

  def handle_call({:request_join, player_name}, _from, state) do
    cond do
      state.status != :lobby ->
        {:reply, error_response("Game has already started"), state}
      num_players(state) >= @max_players ->
        {:reply, error_response("No more players allowed"), state}
      true ->
        player_id = UUID.uuid4()
        state = %{state | players: Map.put(state.players, player_id, player_name)}

        response = %{player_id: player_id, name: player_name}
        {:reply, {:ok, response}, state}
    end
  end

  def handle_call(:start_game, _from, state) do
    cond do
      num_players(state) < @min_players ->
        {:reply, error_response("Not enough players"), state}
      true ->
        state = %{state | status: :round_lies}
                |> setup_first_round()
        {:reply, :ok, state}
    end
  end

  def handle_call({:submit_lie, player_id, lie}, _from, state) do
    # TODO handle cases where you can't submit a lie right now
    state = put_in(state.round.lies[player_id], lie)
            |> check_submissions_complete

    {:reply, :ok, state}
  end

  def handle_call({:submit_vote, player_id, vote_id}, _from, state) do
    # TODO check valid player_id
    # TODO check valid vote_id
    # TODO check if all votes in to progress game
    cond do
      state.round.votes |> Map.has_key?(player_id)->
        {:reply, error_response("You have already voted"), state}
      true ->
        state = put_in(state.round.votes[player_id], vote_id)
                |> check_voting_complete
        {:reply, :ok, state}
    end
  end

  defp num_players(state) do
    state.players |> Map.keys |> length
  end

  defp error_response(message) do
    {:error, %{message: message}}
  end

  defp try_call(game_id, message) do
    case Game.find_game(game_id) do
      nil ->
        error_response("Game does not exist")
      {pid, _} ->
        GenServer.call(pid, message)
    end
  end

  defp check_submissions_complete(state) do
    lie_count = state.round.lies |> Map.keys |> length

    if lie_count == num_players(state) do
      %{state | status: :round_voting}
      |> setup_voting_lists
    else
      state
    end
  end

  defp setup_voting_lists(state) do
    # Each player gets a uniquely-ordered list of submissions to vote
    # on, designated by a list of player_id's and including on extra
    # uuid designated for the real first line of the book.
    real_uuid = UUID.uuid4()
    player_ids = state |> get_player_ids()
    all_ids = [real_uuid | player_ids]

    voting_lists = Enum.reduce(player_ids, %{}, fn player_id, acc ->
      list = List.delete(all_ids, player_id) |> Enum.shuffle
      Map.put(acc, player_id, list)
    end)

    state = put_in(state.round.voting_lists, voting_lists)
    put_in(state.round.real_id, real_uuid)
  end

  defp check_voting_complete(state) do
    vote_count = state.round.votes |> Map.keys |> length

    if vote_count == num_players(state) do
      %{state | status: :round_results}
      |> calculate_points
    else
      state
    end
  end

  defp calculate_points(state) do
    # TODO actually calculate
    state
  end

  defp setup_first_round(state) do
    number = (state.round[:number] || 0) + 1
    round = %{
      number: number,
      lies: %{},
      book: random_book(),
      votes: %{},
      voting_lists: %{},
      real_id: nil,
    }
    %{state | round: round}
  end

  defp random_book() do
    # TODO make sure we don't repeat, don't read the file
    # each time we call this
    {:ok, book} = "#{:code.priv_dir(:gamenight)}/data/liebrary_books.csv"
                  |> File.stream!
                  |> CSV.decode(headers: true)
                  |> Enum.take_random(1)
                  |> List.first

    book
  end

  defp get_player_ids(state) do
    state.players |> Map.keys
  end

end
