defmodule GamenightWeb.GameController do
  use GamenightWeb, :controller

  def new(conn, _params) do
    render(conn, "new.html")
  end

  def create(conn, _params) do
  end

  def show(conn, %{"id" => game_id}) do
    render(conn, "show.html", game_id: game_id)
  end
end
