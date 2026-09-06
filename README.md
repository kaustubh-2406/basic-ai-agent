# Build your own ai-agent

A basic version of `ai-agent` that is build by following the [boot.dev](https://www.boot.dev/courses/build-ai-agent-python) course.

## Basic introduction

```bash
├── `calculator/` # calculator is basic setup that is for testing agent & tools
├── `functions/` # tool definations
├── main.py
└── README.md
```

## How to test

To test out the agent thing u can run some of the prompts to see how the agent performs

1. `uv run main.py "write 'hello' to main.txt"`

Expect the calculator/main.txt to have contnent "hello"

2. You can try to introduce a bug in `calculator/` folder and try testing / debugging with agent.

One example of this can be:

```bash
# in the calculator/calculator.py can try modifying the precendence of '+' to 3.
# this introduces a bug, and u can run the following comamnd to try fixing it.
$ uv run main.py "Fix the bug: 3 + 7 * 2 shouldn't be 20." --verbose
```

## Future plans:

- [ ] Maybe introduce a web search tool.
- [ ] Watch a file / process / command.. and trigger a workflow based on that.
- [ ] Mcp support can be intersting to implement. (However, can be too much work 😅)
