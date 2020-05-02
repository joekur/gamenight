defmodule Gamenight.Telestrations.Game do
  use GenServer

  alias __MODULE__

  defmodule State do
    @derive Jason.Encoder
    defstruct [
      game_id: nil,
      vip: nil,
      player_ids: [],
      player_names: %{}, # player_id => name
      round: nil, # %Round{}
      status: :lobby,
    ]
  end

  defmodule Round do
    @derive Jason.Encoder
    defstruct [
      step: 0,
      stories: %{}, # player_id => %Story{}
      submitted: %{}, # player_id => bool
      current_storyteller: nil,
      storytelling_step: 0,
    ]
  end

  defmodule Story do
    @derive Jason.Encoder
    defstruct [
      writings: [], # []%Writing{}
      drawings: [], # []%Drawing{}
    ]
  end

  defmodule Writing do
    @derive Jason.Encoder
    defstruct [:text, :player_id]
  end

  defmodule Drawing do
    @derive Jason.Encoder
    defstruct [:src, :player_id]
  end

  @statuses %{
    lobby: :lobby,
    writing: :writing,
    drawing: :drawing,
    interpreting: :interpreting,
    show_and_tell: :show_and_tell,
    round_end: :round_end,
  }
  def statuses, do: @statuses

  @min_players 3

  def find_game(game_id) do
    Gamenight.GameRegistry.find_game(game_id)
  end

  def create_game do
    game_id = Gamenight.SlugGenerator.new_slug
    state = %State{game_id: game_id}

    Gamenight.GameRegistry.start_link(__MODULE__, state, game_id, Gamenight.Games.types.telestrations)

    {:ok, game_id}
  end

  def get_state(game_id), do: try_call(game_id, :get_state)
  def get_player_state(game_id, player_id), do: try_call(game_id, {:get_player_state, player_id})
  def request_join(game_id, player_name), do: try_call(game_id, {:request_join, player_name})
  def start_game(game_id), do: try_call(game_id, :start_game)
  def write_story(game_id, player_id, writing), do: try_call(game_id, {:write_story, player_id, writing})
  def draw_story(game_id, player_id, drawing_src), do: try_call(game_id, {:draw_story, player_id, drawing_src})
  def step_forward_storytelling(game_id, player_id), do: try_call(game_id, {:step_forward_storytelling, player_id})
  def step_back_storytelling(game_id, player_id), do: try_call(game_id, {:step_back_storytelling, player_id})
  def start_next_round(game_id), do: try_call(game_id, :start_next_round)

##### Server

  def init(init_arg) do
    {:ok, init_arg}
  end

  def handle_call(:get_state, _from, state) do
    {:reply, {:ok, state}, state}
  end

  def handle_call({:get_player_state, player_id}, _from, state) do
    # Don't return large 'stories' key
    round = if state.round do
      {_, round} = state.round |> Map.from_struct |> pop_in([:stories])
      round
    else
      nil
    end
    player_state = %{state |> Map.from_struct | round: round}

    player_state = if player_id != nil do
      additional = %{
        me: %{
          current_writing: current_writing(state, player_id),
          current_drawing: current_drawing(state, player_id),
          receiving_from_player_id: receiving_from_player_id(state, player_id),
          passing_to_player_id: passing_to_player_id(state, player_id),
          storytelling_writing: current_storytelling_writing(state),
          storytelling_drawing: current_storytelling_drawing(state),
        },
      }

      player_state |> Map.merge(additional)
    else
      player_state
    end

    {:reply, {:ok, player_state}, state}
  end

  def handle_call({:request_join, player_name}, _from, state) do
    player_name = player_name |> String.trim

    cond do
      state.status != :lobby ->
        {:reply, error_response("Game has already started"), state}
      true ->
        player_id = UUID.uuid4()
        state = state
                |> Map.put(:vip, state.vip || player_id)
                |> Map.put(:player_ids, append_to_tail(state.player_ids, player_id))
                |> Map.put(:player_names, Map.put(state.player_names, player_id, player_name))

        response = %{player_id: player_id, name: player_name}
        {:reply, {:ok, response}, state}
    end
  end

  def handle_call(:start_game, _from, state) do
    cond do
      state.status != @statuses.lobby ->
        {:reply, error_response("Game already started"), state}
      num_players(state) < @min_players ->
        {:reply, error_response("Not enough players"), state}
      true ->
        state = state |> start_round()
        {:reply, :ok, state}
    end
  end

  def handle_call({:write_story, player_id, text}, _from, state) do
    cond do
      !Enum.member?([@statuses.writing, @statuses.interpreting], state.status) ->
        {:reply, error_response("Invalid request"), state}
      state.round.submitted[player_id] ->
        {:reply, error_response("Already submitted"), state}
      true ->
        original_author = current_original_author(state, player_id)
        writing = %Writing{player_id: player_id, text: text}

        state = update_in(
          state.round.stories[original_author].writings,
          &(append_to_tail(&1, writing))
        )
        state = put_in(state.round.submitted[player_id], true)
                |> check_all_submitted

        {:reply, :ok, state}
    end
  end

  def handle_call({:draw_story, player_id, drawing_src}, _from, state) do
    cond do
      state.status != @statuses.drawing ->
        {:reply, error_response("Invalid request"), state}
      state.round.submitted[player_id] ->
        {:reply, error_response("Already submitted"), state}
      true ->
        original_author = current_original_author(state, player_id)
        drawing = %Drawing{player_id: player_id, src: drawing_src}

        state = update_in(
          state.round.stories[original_author].drawings,
          &(append_to_tail(&1, drawing))
        )
        state = put_in(state.round.submitted[player_id], true)
                |> check_all_submitted

        {:reply, :ok, state}
    end
  end

  def handle_call({:step_forward_storytelling, player_id}, _from, state) do
    cond do
      state.status != @statuses.show_and_tell ->
        {:reply, error_response("Not currently show-and-telling"), state}
      player_id != state.round.current_storyteller ->
        {:reply, error_response("You are not the current show-and-teller"), state}
      true ->
        next_step = state.round.storytelling_step + 1

        if next_step > length(state.player_ids) - 1 do
          state = state |> next_storyteller
          {:reply, :ok, state}
        else
          {:reply, :ok, put_in(state.round.storytelling_step, next_step)}
        end
    end
  end

  def handle_call({:step_back_storytelling, player_id}, _from, state) do
    cond do
      state.status != @statuses.show_and_tell ->
        {:reply, error_response("Not currently show-and-telling"), state}
      player_id != state.round.current_storyteller ->
        {:reply, error_response("You are not the current show-and-teller"), state}
      state.round.storytelling_step == 0 ->
        {:reply, error_response("Can not move back further"), state}
      true ->
        {:reply, :ok, update_in(state.round.storytelling_step, &(&1 - 1))}
    end
  end

  def handle_call(:start_next_round, _from, state) do
    state = state |> start_round()

    {:reply, :ok, state}
  end

  def next_storyteller(state) do
    current_storyteller = state.round.current_storyteller
    next_storyteller = next_element(state.player_ids, current_storyteller, 1)

    if next_storyteller == state.player_ids |> List.first do # we've looped back around
      %{state | status: @statuses.round_end}
    else
      state = put_in(state.round.storytelling_step, 0)
      put_in(state.round.current_storyteller, next_storyteller)
    end
  end

  defp check_all_submitted(state) do
    all_submitted = state.round.submitted
                    |> Map.values
                    |> Enum.all?(fn el -> el == true end)

    if all_submitted do
      state |> next_step()
    else
      state
    end
  end

  defp next_step(state) do
    if state.round.step == length(state.player_ids) - 1 do
      state |> start_show_and_tell
    else
      next_status = if state.status == @statuses.drawing do
        @statuses.interpreting
      else
        @statuses.drawing
      end

      state = update_in(state.round.step, &(&1 + 1))
      put_in(state.round.submitted, build_player_map(state, false))
      |> Map.put(:status, next_status)
    end
  end

  defp start_show_and_tell(state) do
    put_in(state.round.current_storyteller, state.player_ids |> List.first)
    |> Map.put(:status, @statuses.show_and_tell)
  end

  # Player ID for who authored the original story for the writing/drawing
  # this player_id is currently telestrating
  defp current_original_author(state, player_id) do
    # Stories are passed to the right, therefore we move back to the
    # left by which "step" we are in
    if game_on?(state) do
      next_element(state.player_ids, player_id, -1 * state.round.step)
    else
      nil
    end
  end

  defp current_writing(state, player_id) do
    author = current_original_author(state, player_id)

    if author && state.status == @statuses.drawing do
      state.round.stories[author].writings |> List.last
    else
      nil
    end
  end

  defp current_drawing(state, player_id) do
    author = current_original_author(state, player_id)

    if author && state.status == @statuses.interpreting do
      state.round.stories[author].drawings |> List.last
    else
      nil
    end
  end

  defp receiving_from_player_id(state, player_id) do
    if game_on?(state) do
      next_element(state.player_ids, player_id, -1)
    else
      nil
    end
  end

  defp passing_to_player_id(state, player_id) do
    if game_on?(state) do
      next_element(state.player_ids, player_id, 1)
    else
      nil
    end
  end

  defp game_on?(state) do
    Enum.member?([@statuses.writing, @statuses.drawing, @statuses.interpreting], state.status)
  end

  defp current_storytelling_writing(%{status: :show_and_tell} = state) do
    step = state.round.storytelling_step
    author = state.round.current_storyteller

    if rem(step, 2) == 0 do
      index = div(step, 2)
      state.round.stories[author].writings |> Enum.at(index)
    else
      nil
    end
  end
  defp current_storytelling_writing(_), do: nil

  defp current_storytelling_drawing(%{status: :show_and_tell} = state) do
    step = state.round.storytelling_step
    author = state.round.current_storyteller

    if rem(step, 2) == 1 do
      index = div(step, 2)
      state.round.stories[author].drawings |> Enum.at(index)
    else
      nil
    end
  end
  defp current_storytelling_drawing(_), do: nil

  defp next_element(list, el, by) do
    element_index = list |> Enum.find_index(&(&1 == el))
    result_index = rem(element_index + by, length(list))

    list |> Enum.at(result_index)
  end

  defp start_round(state) do
    round = %Round{
      step: 0,
      stories: build_player_map(state, %Story{}),
      submitted: build_player_map(state, false),
    }

    state
    |> Map.put(:player_ids, state.player_ids |> Enum.shuffle)
    |> Map.put(:status, @statuses.writing)
    |> Map.put(:round, round)
  end

  defp try_call(game_id, message) do
    case Game.find_game(game_id) do
      nil ->
        error_response("Game does not exist")
      {pid, _} ->
        GenServer.call(pid, message)
    end
  end

  defp error_response(message) do
    {:error, %{message: message}}
  end

  defp build_player_map(state, default_value) do
    Enum.reduce(state.player_ids, %{}, fn player_id, acc ->
      Map.put(acc, player_id, default_value)
    end)
  end

  defp append_to_tail(list, el) do
    List.insert_at(list, length(list), el)
  end

  defp num_players(state) do
    state.player_ids |> length
  end
end
