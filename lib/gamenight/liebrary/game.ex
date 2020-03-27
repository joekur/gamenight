defmodule Gamenight.Liebrary.Game do
  use GenServer

  alias __MODULE__

  @derive Jason.Encoder
  defstruct [
    game_id: nil,
    status: :wait_for_players,
    players: %{},
    current_round: 1,
  ]

  def find_game(game_id) do
    Registry.lookup(Gamenight.Registry, game_id)
      |> Enum.at(0)
  end

  def start_game(game_id) do
    state = %Game{game_id: game_id}

    GenServer.start_link(__MODULE__, state, name: service_name(game_id))
  end

  def get_state(game_id) do
    try_call(game_id, :get_state)
  end

  def request_join(game_id, player_name) do
    try_call(game_id, {:request_join, player_name})
  end

  def max_players, do: 8

  def init(init_arg) do
    {:ok, init_arg}
  end

  def handle_call(:get_state, _from, state) do
    {:reply, state, state}
  end

  def handle_call(:status, _from, state) do
    {:reply, state.status, state}
  end

  def handle_call({:request_join, player_name}, _from, state) do
    cond do
      state.status != :wait_for_players ->
        {:reply, error_response("Game has already started"), state}
      num_players(state) >= max_players ->
        {:reply, error_response("No more players allowed"), state}
      true ->
        player_id = UUID.uuid4()
        state = %{state | players: Map.put(state.players, player_id, player_name)}

        response = %{player_id: player_id, name: player_name}
        {:reply, {:ok, response}, state}
    end
  end

  defp num_players(state) do
    state.players |> Map.keys |> length
  end

  defp error_response(message) do
    {:error, %{message: "Game does not exist"}}
  end

  defp try_call(game_id, message) do
    case Gamenight.Liebrary.Game.find_game(game_id) do
      nil ->
        error_response("Game does not exist")
      {pid, _} ->
        GenServer.call(pid, message)
    end
  end

  defp service_name(game_id), do:
    Gamenight.Application.service_name(game_id)

end
