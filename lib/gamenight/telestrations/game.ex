defmodule Gamenight.Telestrations.Game do
  use GenServer

  alias __MODULE__

  @derive Jason.Encoder
  defstruct [
    game_id: nil,
    player_ids: [],
    player_names: %{},
    round: %{},
  ]

  def find_game(game_id) do
    Gamenight.GameRegistry.find_game(game_id)
  end

  def create_game do
    game_id = Gamenight.SlugGenerator.new_slug
    state = %Game{game_id: game_id}

    Gamenight.GameRegistry.start_link(__MODULE__, state, game_id, Gamenight.Games.types.telestrations)

    {:ok, game_id}
  end
end
