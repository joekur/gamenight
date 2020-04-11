defmodule Gamenight.GameOfThings.Prompts do
  use Agent

  def start_link(_opts) do
    Agent.start_link(fn -> load_prompts() end, name: __MODULE__)
  end

  def random_seed(prompts) do
    length = prompts |> all() |> length

    (0..length-1) |> Enum.shuffle
  end

  def next_prompt(prompts, [index | new_seed]) do
    prompt = fetch_prompt(prompts, index)
    {:ok, prompt, new_seed}
  end
  def next_prompt(_prompts, []), do: :error

  def fetch_prompt(prompts, index) do
    Agent.get(prompts, &Enum.at(&1, index))
  end

  def all(prompts) do
    Agent.get(prompts, fn list -> list end)
  end

  defp load_prompts do
    "#{:code.priv_dir(:gamenight)}/data/game_of_things/prompts.csv"
                  |> File.stream!
                  |> CSV.decode(headers: true)
                  |> Stream.map(fn {:ok, row} -> row["prompt"] end)
                  |> Enum.to_list
  end
end
