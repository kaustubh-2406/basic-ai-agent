import type OpenAI from "openai";
import { get_file_content } from "./functions/get_file_content.ts";
import { get_files_info } from "./functions/get_files_info.ts";
import { run_python_file } from "./functions/run_python_file.ts";
import { write_file } from "./functions/write_file.ts";

const function_map: Record<string, Function> = {
  write_file: write_file,
  get_files_info: get_files_info,
  run_python_file: run_python_file,
  get_file_content: get_file_content,
};

export async function call_function(
  tool_call: OpenAI.Chat.Completions.ChatCompletionMessageToolCall,
  verbose: boolean = false,
): Promise<OpenAI.ChatCompletionToolMessageParam> {
  if (tool_call.type !== "function") {
    return {
      role: "tool",
      tool_call_id: tool_call.id,
      content: JSON.stringify(tool_call),
    };
  }

  const function_name = tool_call.function.name;
  const function_args = JSON.parse(tool_call.function.arguments);

  const fn = function_map[function_name];
  if (!fn) {
    return {
      role: "tool",
      tool_call_id: tool_call.id,
      content: `Error: Unknown function: ${function_name}`,
    };
  }

  const working_directory = "./calculator/";
  const result = await fn({ ...function_args, working_directory });

  return {
    role: "tool",
    tool_call_id: tool_call.id,
    content: result,
  };
}
