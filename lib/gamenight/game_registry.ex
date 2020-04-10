defmodule Gamenight.GameRegistry do
  @type game_type :: :game_of_things | :liebrary

  def start_link(module, state, game_id, game_type) do
    {:ok, _pid} = GenServer.start_link(module, state, name: service_name(game_id, game_type))
  end

  def find_game(game_id) do
    Registry.lookup(Gamenight.Registry, String.upcase(game_id)) |> Enum.at(0)
  end

  defp service_name(game_id, game_type) do
    {:via, Registry, {Gamenight.Registry, game_id, game_type}}
  end

end
