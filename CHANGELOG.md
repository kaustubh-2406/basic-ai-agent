# Changelog

A running log of what changed while exploring. No versions, no releases.

## 2026-10-14

- Ported the agent from Python to TypeScript (Node, OpenAI SDK against OpenRouter).
- Fixed the agent loop hanging forever when the model replied without tool calls.
- Fixed the turn limit counting tool calls instead of model turns.
- Fixed token usage being added once per tool call instead of once per response.
- Fixed verbose tool output dropping the first 200 characters.
- Fixed empty tool results not being sent back to the model.
- Updated README for the TypeScript setup.
- Fixed `call_function` not awaiting async tools (`write_file`, `run_python_file`), which sent a Promise back as the tool result.
- Fixed `run_python_file` schema declaring `args` as a string instead of an array of strings.
- Ported the Python tool tests to `node:test` (`pnpm test`).

## Earlier

- Basic Python agent built from the boot.dev course, with `get_files_info`, `get_file_content`, `write_file` and `run_python_file` tools, sandboxed to `calculator/`.
