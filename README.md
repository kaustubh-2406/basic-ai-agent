# Build your own ai-agent

A basic version of `ai-agent` built by following the [boot.dev](https://www.boot.dev/courses/build-ai-agent-python) course, ported from Python to TypeScript.

> This is a personal exploration project, not production software. Expect rough edges and breaking changes.

## Basic introduction

```bash
├── calculator/        # small Python project the agent works on (its sandbox)
├── functions/         # tool definitions and implementations
├── call_function.ts   # dispatches tool calls from the model
├── prompts.ts         # system prompt
├── main.ts            # agent loop
└── README.md
```

The agent talks to OpenRouter (`openrouter/free` model) and can list files, read files, write files and run Python files. All tool calls are restricted to `calculator/`.

## Setup

```bash
pnpm install
echo "OPENROUTER_API_KEY=<your key>" > .env
pnpm build
```

## Usage

```bash
node --env-file=.env dist/main.js "<prompt>" [-v | --verbose]
```

`-v` prints the prompt, each tool result and token usage. The agent stops after 20 turns.

## Tests

```bash
pnpm test
```

Runs `functions.test.ts` against the tools in `calculator/`. Needs `python` on your PATH.

## Trying the agent

1. `node --env-file=.env dist/main.js "write 'hello' to main.txt"`

   Expect `calculator/main.txt` to contain "hello".

2. Introduce a bug in `calculator/` and ask the agent to fix it. For example, change the precedence of `+` to 3 in `calculator/pkg/calculator.py`, then run:

   ```bash
   node --env-file=.env dist/main.js "Fix the bug: 3 + 7 * 2 shouldn't be 20." --verbose
   ```

## Future plans

- [ ] Convert to Effect
- [ ] Maybe introduce a web search tool.
- [ ] Watch a file / process / command and trigger a workflow based on that.
- [ ] MCP support could be interesting to implement. (However, can be too much work 😅)
