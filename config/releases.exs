import Config

config :gamenight, :google_tracking, true

config :gamenight, GamenightWeb.Endpoint,
  server: true,
  http: [port: {:system, "PORT"}], # Needed for Phoenix 1.2 and 1.4. Doesn't hurt for 1.3.
  url: [host: "gamenight.lol", port: 443],
  check_origin: ["//gamenight.lol", "//*.gamenight.lol"],
  force_ssl: [rewrite_on: [:x_forwarded_proto]]
