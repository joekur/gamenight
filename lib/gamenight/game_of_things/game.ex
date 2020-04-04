defmodule Gamenight.GameOfThings.Game do
  use GenServer

  alias __MODULE__

  @derive Jason.Encoder
  defstruct [
    game_id: nil,
    status: :lobby,
    players: %{},
    round: %{},
    prompts: [],
  ]

  @min_players 3
  @min_prompts 1

  def find_game(game_id) do
    Registry.lookup(Gamenight.Registry, game_id)
      |> Enum.at(0)
  end

  def create_game do
    game_id = Gamenight.SlugGenerator.new_slug # TODO what about random collisions?
    state = %Game{game_id: game_id}

    {:ok, _pid} = GenServer.start_link(__MODULE__, state, name: service_name(game_id))

    {:ok, game_id}
  end

  def get_state(game_id) do
    # TODO we may not want to expose some of the state,
    # such as the current book's actual title
    try_call(game_id, :get_state)
  end

  def request_join(game_id, player_name), do: try_call(game_id, {:request_join, player_name})

  def start_game(game_id), do: try_call(game_id, :start_game)

  def add_prompt(game_id, player_id, prompt), do: try_call(game_id, {:add_prompt, player_id, prompt})

  def submit_answer(game_id, player_id, answer), do: try_call(game_id, {:submit_answer, player_id, answer})

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
      true ->
        player_id = UUID.uuid4()
        state = %{state | players: Map.put(state.players, player_id, player_name)}

        response = %{player_id: player_id, name: player_name}
        {:reply, {:ok, response}, state}
    end
  end

  def handle_call({:add_prompt, _player_id, prompt}, _from, state) do
    prompts = [prompt | state.prompts]
    state = Map.put(state, :prompts, prompts)

    {:reply, :ok, state}
  end

  def handle_call(:start_game, _from, state) do
    cond do
      num_players(state) < @min_players ->
        {:reply, error_response("Not enough players"), state}
      num_prompts(state) < @min_prompts ->
        {:reply, error_response("Not enough prompts"), state}
      true ->
        state = state
                |> setup_game()
                |> start_round()
        {:reply, :ok, state}
    end
  end

  def handle_call({:submit_answer, player_id, answer}, _from, state) do
    # TODO handle cases where you can't submit an answer
    state = put_in(state.round.answers[player_id], answer)
            |> check_all_answers_in

    {:reply, :ok, state}
  end

  defp num_players(state) do
    state.players |> Map.keys |> length
  end

  defp num_prompts(state) do
    state.prompts |> length
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

  defp setup_game(state) do
    prompts = state.prompts |> Enum.shuffle

    state
    |> Map.put(:prompts, prompts)
    |> Map.put(:status, :round_answers)
  end

  defp start_round(state) do
    [prompt | rest] = state.prompts

    scores = Enum.reduce(state |> get_player_ids, %{}, fn player_id, acc ->
      Map.put(acc, player_id, 0)
    end)

    round = %{prompt: prompt, answers: %{}, scores: scores}

    state
    |> Map.put(:prompts, rest)
    |> Map.put(:round, round)
  end

  defp check_all_answers_in(state) do
    answer_count = state.round.answers |> Map.keys |> length

    if answer_count == num_players(state) do
      %{state | status: :round_guessing}
    else
      state
    end
  end

  defp get_player_ids(state) do
    state.players |> Map.keys
  end

  defp service_name(game_id), do:
    Gamenight.Application.service_name(game_id)

end
