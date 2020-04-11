defmodule GamenightWeb.GameControllerTest do
  use GamenightWeb.ConnCase

  describe "show" do
    test "connects to an existing game", %{conn: conn} do
      {:ok, game_id} = Gamenight.GameOfThings.Game.create_game
      conn = get(conn, "/#{game_id}")
      assert html_response(conn, 200) =~ game_id
    end

    test "it handles lowercased games", %{conn: conn} do
      {:ok, game_id} = Gamenight.GameOfThings.Game.create_game
      conn = get(conn, "/#{game_id |> String.downcase}")
      assert html_response(conn, 200) =~ game_id
    end

    test "it redirects if game doesn't exist", %{conn: conn} do
      conn = get(conn, "/ABCD")
      assert redirected_to(conn) == "/"
    end
  end
end
