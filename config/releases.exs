import Config

config :gamenight, :google_tracking, true

config :gamenight, GamenightWeb.Endpoint,
  server: true,
  http: [port: {:system, "PORT"}], # Needed for Phoenix 1.2 and 1.4. Doesn't hurt for 1.3.
  url: [host: "gamenight.lol", port: 443],
  check_origin: ["//gamenight.lol", "//*.gamenight.lol"],
  force_ssl: [rewrite_on: [:x_forwarded_proto]]

config :sentry,
  dsn: "https://01d0c96684b74d3bb50e9cc43c3e5e1a@o381835.ingest.sentry.io/5209812",
  environment_name: :prod,
  enable_source_code_context: true,
  root_source_code_path: File.cwd!,
  tags: %{
    env: "production"
  },
  included_environments: [:prod]
