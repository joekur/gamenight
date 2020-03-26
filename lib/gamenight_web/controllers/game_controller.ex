defmodule GamenightWeb.GameController do
  use GamenightWeb, :controller

  def new(conn, _params) do
    game_id = SlugGenerator.new_slug # TODO what about random collisions?
    Gamenight.Liebrary.Game.start_game(game_id) # TODO what if it's already started or theres an error?

    redirect(conn, to: "/games/#{game_id}")
  end

  def show(conn, %{"id" => game_id}) do
    case Gamenight.Liebrary.Game.find_game(game_id) do
      {pid, _} ->
        render(conn, "show.html", game_id: game_id)
      _ ->
        redirect(conn, to: "/")
    end
  end
end
