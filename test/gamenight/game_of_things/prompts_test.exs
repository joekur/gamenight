defmodule Gamenight.GameOfThings.PromptsTest do
  use ExUnit.Case

  alias Gamenight.GameOfThings.Prompts

  test "it returns the list of prompts" do
    {:ok, prompts} = Prompts.start_link([])
    assert Prompts.fetch_prompt(prompts, 0) == "Things that you shouldn't do naked."
  end

  test "it produces a randomized seed which you can use to cycle through prompts" do
    {:ok, prompts} = Prompts.start_link([])
    seed = Prompts.random_seed(prompts)
    length = Prompts.all(prompts) |> length

    {prompt_list, seed} = Enum.reduce(0..length-1, {[], seed}, fn _i, {prompt_list, seed} ->
      {:ok, prompt, new_seed} = Prompts.next_prompt(prompts, seed)

      {[prompt | prompt_list], new_seed}
    end)
    :error = Prompts.next_prompt(prompts, seed)

    assert prompt_list == prompt_list |> Enum.uniq
  end
end
