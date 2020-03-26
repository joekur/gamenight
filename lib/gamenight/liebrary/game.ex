defmodule Gamenight.Liebrary.Game do
  use GenServer

  alias __MODULE__

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

  def init(init_arg) do
    {:ok, init_arg}
  end

  def handle_call(:status, _from, state) do
    {:reply, state.status, state}
  end

  defp service_name(game_id), do:
    Gamenight.Application.service_name(game_id)

end
