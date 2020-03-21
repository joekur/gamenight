defmodule Gamenight.Repo do
  use Ecto.Repo,
    otp_app: :gamenight,
    adapter: Ecto.Adapters.Postgres
end
