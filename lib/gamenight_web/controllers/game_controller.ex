defmodule GamenightWeb.GameController do
  use GamenightWeb, :controller
  plug :put_layout, "game.html"

  def new(conn, _params) do
    {:ok, game_id} = Gamenight.GameOfThings.Game.create_game # TODO what if it's already started or theres an error?

    redirect(conn, to: "/#{game_id}")
  end

  def show(conn, %{"path" => path}) do
    game_id = path |> List.first
    case Gamenight.GameOfThings.Game.find_game(game_id) do
      {_pid, _} ->
        render(conn, "show.html", game_id: game_id |> String.upcase)
      _ ->
        redirect(conn, to: "/")
    end
  end
end
