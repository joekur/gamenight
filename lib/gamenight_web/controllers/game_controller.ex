defmodule GamenightWeb.GameController do
  use GamenightWeb, :controller
  plug :put_layout, "game.html"

  def new(conn, params) do
    case create_game(params["type"]) do
      {:ok, game_id} ->
        redirect(conn, to: "/#{game_id}")
      :error ->
        conn
        |> put_flash(:error, "Could not create game - unknown game type")
        |> redirect(to: "/")
    end
  end

  def join(conn, %{"game_id" => game_id}) do
    redirect(conn, to: "/#{game_id}")
  end

  def show(conn, %{"path" => path}) do
    game_id = path |> List.first
    case Gamenight.GameRegistry.find_game(game_id) do
      {_pid, type} ->
        render(conn, "show.html", game_id: game_id |> String.upcase, game_type: type)
      _ ->
        conn
        |> put_flash(:error, "Game not found")
        |> redirect(to: "/")
    end
  end

  defp create_game(type) do
    case type do
      "game_of_things" -> Gamenight.GameOfThings.Game.create_game
      "liebrary" ->       Gamenight.Liebrary.Game.create_game
      "telestrations" ->  Gamenight.Telestrations.Game.create_game
      _ ->                :error
    end
  end
end
