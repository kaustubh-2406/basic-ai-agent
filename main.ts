import OpenAI from "openai";
import { schema_get_files_info } from "./functions/get_files_info.ts";
import { schema_write_file } from "./functions/write_file.ts";
import { schema_run_python_file } from "./functions/run_python_file.ts";
import { schema_get_file_content } from "./functions/get_file_content.ts";
import { parseArgs } from "node:util";
import { system_prompt } from "./prompts.ts";
import { call_function } from "./call_function.ts";

const api_key = process.env.OPENROUTER_API_KEY;

if (!api_key) throw new Error("OPENROUTER_API_KEY not found");

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: api_key,
});

const available_tools = [
  schema_get_files_info,
  schema_write_file,
  schema_run_python_file,
  schema_get_file_content,
];

const MAX_TURNS = 20;

async function main() {
  const { values, positionals } = parseArgs({
    options: {
      verbose: {
        type: "boolean",
        short: "v",
        default: false,
      },
    },
    allowPositionals: true,
  });

  const is_verbose = values.verbose;
  const user_prompt = positionals[0];

  if (!user_prompt) {
    console.log("User prompt is required");
    return;
  }

  if (is_verbose) {
    console.log(`User prompt: ${user_prompt}`);
  }

  let turns = 0;
  let prompt_tokens = 0;
  let completion_tokens = 0;
  let response_message = "";
  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: system_prompt },
    { role: "user", content: user_prompt },
  ];

  while (turns < MAX_TURNS) {
    turns += 1;
    const response = await client.chat.completions.create({
      messages,
      model: "openrouter/free",
      tools: available_tools,
    });

    if (!response?.usage) throw Error("Usage property not found in response");
    prompt_tokens += response.usage.prompt_tokens;
    completion_tokens += response.usage.completion_tokens;

    const msg = response.choices[0]?.message;
    if (msg) messages.push(msg);

    if (!msg?.tool_calls?.length) {
      response_message = msg?.content ?? "";
      break;
    }

    for (const tool of msg.tool_calls) {
      const result = await call_function(tool, is_verbose);
      if (is_verbose) console.log(`-> ${result.content.slice(0, 200)}...`);
      messages.push(result);
    }

    if (turns >= MAX_TURNS) {
      console.log("Too many tool calls");
      process.exit(1);
    }
  }

  if (is_verbose) {
    console.log(`
      Prompt tokens: ${prompt_tokens}
      Response tokens: ${completion_tokens}
      ${response_message}
      `);
  } else {
    console.log(`${response_message}`);
  }
}

if (import.meta.main) {
  main();
}
