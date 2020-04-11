defmodule Gamenight.GameOfThings.PromptsTest do
  use ExUnit.Case

  alias Gamenight.GameOfThings.Prompts

  test "it returns the list of prompts" do
    assert Prompts.fetch_prompt(Prompts, 0) == "Things that you shouldn't do naked."
  end

  test "it produces a randomized seed which you can use to cycle through prompts" do
    seed = Prompts.random_seed(Prompts)
    length = Prompts.all(Prompts) |> length

    {prompt_list, seed} = Enum.reduce(0..length-1, {[], seed}, fn _i, {prompt_list, seed} ->
      {:ok, prompt, new_seed} = Prompts.next_prompt(Prompts, seed)

      {[prompt | prompt_list], new_seed}
    end)
    :error = Prompts.next_prompt(Prompts, seed)

    assert prompt_list == prompt_list |> Enum.uniq
  end
end
