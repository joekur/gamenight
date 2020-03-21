defmodule GamenightWeb.PageController do
  use GamenightWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
end
