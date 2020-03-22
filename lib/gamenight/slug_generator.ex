defmodule SlugGenerator do
  @chars "ABCDEFGHIJKLMNOPQRSTUVWXYZ" |> String.split("", trim: true)
  @length 4

  def new_slug do
    Enum.reduce((1..@length), [], fn (_i, acc) ->
      [Enum.random(@chars) | acc]
    end) |> Enum.join("")
  end
end
