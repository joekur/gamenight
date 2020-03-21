defmodule GamenightWeb.GameController do
  use GamenightWeb, :controller

  def new(conn, _params) do
    render(conn, "new.html")
  end

  def create(conn, _params) do
  end

  def show(conn, _params) do
    render(conn, "show.html")
  end
end
