defmodule GamenightWeb.GameControllerTest do
  use GamenightWeb.ConnCase

  describe "new" do
    test "creates a new 'Game of Things' game", %{conn: conn} do
      conn = get(conn, "/games/new?type=game_of_things")
      game_id = redirected_to(conn) |> String.split("/") |> Enum.at(1)
      {_pid, :game_of_things} = Gamenight.GameRegistry.find_game(game_id)
    end

    test "creates a new 'Liebrary' game", %{conn: conn} do
      conn = get(conn, "/games/new?type=liebrary")
      game_id = redirected_to(conn) |> String.split("/") |> Enum.at(1)
      {_pid, :liebrary} = Gamenight.GameRegistry.find_game(game_id)
    end

    test "creates a new 'Telestrations' game", %{conn: conn} do
      conn = get(conn, "/games/new?type=telestrations")
      game_id = redirected_to(conn) |> String.split("/") |> Enum.at(1)
      {_pid, :telestrations} = Gamenight.GameRegistry.find_game(game_id)
    end
  end

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
