defmodule Gamenight.Games do
  @types %{
    game_of_things: :game_of_things,
    liebrary: :liebrary,
    telestrations: :telestrations,
  }
  def types, do: @types
end
