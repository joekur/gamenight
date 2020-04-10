defmodule GamenightWeb.PageControllerTest do
  use GamenightWeb.ConnCase

  test "GET /", %{conn: conn} do
    conn = get(conn, "/")
    html_response(conn, 200)
  end
end
