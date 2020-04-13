defmodule Gamenight.GameOfThings.Game do
  use GenServer

  alias __MODULE__
  alias Gamenight.GameOfThings.Prompts

  @derive Jason.Encoder
  defstruct [
    game_id: nil,
    status: :lobby,
    players: %{},
    round: %{},
    custom_prompts: [],
    scores: %{},
    prompts_seed: nil
  ]

  # TODO change back to 3
  @min_players 3

  def find_game(game_id) do
    Gamenight.GameRegistry.find_game(game_id)
  end

  def create_game do
    game_id = Gamenight.SlugGenerator.new_slug # TODO what about random collisions?
    state = %Game{game_id: game_id}

    Gamenight.GameRegistry.start_link(__MODULE__, state, game_id, Gamenight.Games.types.game_of_things)

    {:ok, game_id}
  end

  def get_state(game_id) do
    try_call(game_id, :get_state)
  end

  def request_join(game_id, player_name), do: try_call(game_id, {:request_join, player_name})

  def start_game(game_id), do: try_call(game_id, :start_game)

  def add_prompt(game_id, player_id, prompt), do: try_call(game_id, {:add_prompt, player_id, prompt})

  def submit_answer(game_id, player_id, answer), do: try_call(game_id, {:submit_answer, player_id, answer})

  def guess(game_id, player_id, prompt_id, guess_id), do: try_call(game_id, {:guess, player_id, prompt_id, guess_id})

  def start_next_round(game_id, player_id), do: try_call(game_id, {:start_next_round, player_id})

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
    player_name = player_name |> String.trim

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
    prompts = [prompt | state.custom_prompts]
    state = Map.put(state, :custom_prompts, prompts)

    {:reply, :ok, state}
  end

  def handle_call(:start_game, _from, state) do
    cond do
      num_players(state) < @min_players ->
        {:reply, error_response("Not enough players"), state}
      true ->
        state = state
                |> setup_game()
                |> start_round()
        {:reply, :ok, state}
    end
  end

  def handle_call({:submit_answer, player_id, answer}, _from, state) do
    cond do
      Enum.member?(get_player_ids(state), player_id) ->
        state = put_in(state.round.answers[player_id], answer)
                |> check_all_answers_in

        {:reply, :ok, state}
      true ->
        {:reply, invalid_player_response(), state}
    end
  end

  def handle_call({:guess, player_id, answer_id, guessed_player_id}, _from, state) do
    last_guess = %{
      player_id: player_id,
      guessed_answer_id: answer_id,
      guessed_player_id: guessed_player_id,
      key: UUID.uuid4(),
    }

    cond do
      !Enum.member?(get_player_ids(state), player_id) ->
        {:reply, invalid_player_response(), state}
      player_id != state.round.current_player ->
        {:reply, error_response("Not your turn"), state}
      answer_id == guessed_player_id ->
        last_guess = Map.put(last_guess, :correct, true)
        state = handle_correct_guess(player_id, guessed_player_id, state)
                |> check_round_complete()
        state = put_in(state.round.last_guess, last_guess)

        {:reply, :ok, state}
      true ->
        last_guess = Map.put(last_guess, :correct, false)
        state = handle_wrong_guess(state)
        state = put_in(state.round.last_guess, last_guess)

        {:reply, :ok, state}
    end
  end

  def handle_call({:start_next_round, _player_id}, _from, state) do
    {:reply, :ok, state |> start_round}
  end

  defp handle_correct_guess(player_id, guess_id, state) do
    state = update_in(state.scores[player_id], &(&1 + 1))
    state = update_in(state.round.active_players, &(List.delete(&1, guess_id)))
    update_in(state.round.answer_ids, &(List.delete(&1, guess_id)))
  end

  defp check_round_complete(state) do
    if length(state.round.active_players) <= 1 do
      %{state | status: :round_results}
    else
      state
    end
  end

  defp handle_wrong_guess(state) do
    current_player = state.round.current_player
    next_player = next_element_in_list(state.round.active_players, current_player)

    put_in(state.round.current_player, next_player)
  end

  # Returns the element in @list following the provided @element, with wraparound.
  # Ie - for a list [1,2,3], the next element after 2 is 3, and the next after 3 is 1
  defp next_element_in_list(list, element) do
    element_index = list |> Enum.find_index(&(&1 == element))
    next_index = element_index + 1
    next_index = if (next_index >= length(list)), do: 0, else: next_index

    list |> Enum.at(next_index)
  end

  defp num_players(state) do
    state.players |> Map.keys |> length
  end

  defp error_response(message) do
    {:error, %{message: message}}
  end

  defp invalid_player_response do
    error_response("Invalid player. Please reload the page and try again.")
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
    scores = Enum.reduce(state |> get_player_ids, %{}, fn player_id, acc ->
      Map.put(acc, player_id, 0)
    end)

    state
    |> Map.put(:custom_prompts, state.custom_prompts |> Enum.shuffle)
    |> Map.put(:scores, scores)
    |> Map.put(:prompts_seed, Prompts.random_seed(Prompts))
  end

  defp start_round(state) do
    {prompt, state} = take_next_prompt(state)
    player_ids = state |> get_player_ids

    current_player = if state.round |> Map.has_key?(:current_player) do
      # continue turns leaving off after the last player of the last round
      next_element_in_list(player_ids, state.round.current_player)
    else
      player_ids |> List.first
    end

    round = %{
      prompt: prompt,
      answers: %{},
      active_players: player_ids,
      answer_ids: player_ids |> Enum.shuffle, # this is the order we'll show the answers
      current_player: current_player,
      last_guess: nil
    }

    state
    |> Map.put(:round, round)
    |> Map.put(:status, :round_answers)
  end

  defp take_next_prompt(state) do
    if state.custom_prompts |> length > 0 do
      [prompt | rest] = state.custom_prompts
      {prompt, %{state | custom_prompts: rest}}
    else
      {:ok, prompt, seed} = Prompts.next_prompt(Prompts, state.prompts_seed)
      {prompt, %{state | prompts_seed: seed}}
    end
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
end
