defmodule Gamenight.Liebrary.Game do

  defstruct [
    id: nil,
    status: :wait_for_players,
    players: %{},
    current_round: 1,
  ]

  def create(id) do
  end

end
