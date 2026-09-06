import os
import json
import argparse
from dotenv import load_dotenv
from openai import OpenAI
from prompts import system_prompt

from call_function import call_function
from functions.get_files_info import schema_get_files_info
from functions.write_file import schema_write_file
from functions.run_python_file import schema_run_python_file
from functions.get_file_content import schema_get_file_content

load_dotenv()
api_key = os.environ.get("OPENROUTER_API_KEY")

if api_key is None:
    raise RuntimeError("OPENROUTER_API_KEY not found")

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key,
)

available_functions = [
    schema_get_files_info,
    schema_write_file,
    schema_run_python_file,
    schema_get_file_content,
]

MAX_TURNS = 20


def main():
    parser = argparse.ArgumentParser(description="Chatbot")
    parser.add_argument("user_prompt", type=str, help="User prompt")
    parser.add_argument("--verbose", action="store_true",
                        help="Enable verbose output")

    args = parser.parse_args()
    is_verbose = args.verbose

    user_prompt = args.user_prompt

    if is_verbose:
        print(f"User prompt: {user_prompt}")

    turns = 0
    prompt_tokens = 0
    completion_tokens = 0
    response_message = ""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    while turns < MAX_TURNS:
        response = client.chat.completions.create(
            model="openrouter/free",
            messages=messages,
            tools=available_functions
        )
        message = response.choices[0].message
        response_message = message.content

        messages.append(message.model_dump(exclude_none=True))

        if message.tool_calls is None:
            break

        for tool in message.tool_calls:
            result = call_function(tool, is_verbose)
            content = result.get("content", "")
            if is_verbose:
                print(f"-> {content[:200]}...")

            if len(content) == 0:
                break

            messages.append(result)

        if response.usage is None:
            raise RuntimeError("Usage property not found in response")

        prompt_tokens += response.usage.prompt_tokens
        completion_tokens += response.usage.completion_tokens
        turns += 1
    else:
        print("Too many tool calls")
        exit(1)

    if is_verbose:
        print(f"""
Prompt tokens: {prompt_tokens}
Response tokens: {completion_tokens}
{response_message}
        """)
    else:
        print(f"{response_message}")


if __name__ == "__main__":
    main()
