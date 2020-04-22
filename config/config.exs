# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
use Mix.Config

config :gamenight,
  ecto_repos: [Gamenight.Repo]

# Configures the endpoint
config :gamenight, GamenightWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "xpy+pLINLFafS8VWBnW2XDwPZghDSHCmQBNeFOxRtgGIgj1z9aVkl4SKPYAhpxsa",
  render_errors: [view: GamenightWeb.ErrorView, accepts: ~w(html json)],
  pubsub: [name: Gamenight.PubSub, adapter: Phoenix.PubSub.PG2],
  live_view: [signing_salt: "1j4rrrEZ"]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id],
  backends: [:console, Sentry.LoggerBackend]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env()}.exs"
