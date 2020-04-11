defmodule GamenightWeb.Router do
  use GamenightWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", GamenightWeb do
    pipe_through :browser

    get "/", PageController, :index
    resources "/games", GameController, only: [:new]

    get "/*path", GameController, :show
  end

  # Other scopes may use custom stacks.
  # scope "/api", GamenightWeb do
  #   pipe_through :api
  # end
end
