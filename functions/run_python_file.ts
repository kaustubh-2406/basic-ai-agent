import type OpenAI from "openai";
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

export const schema_run_python_file: OpenAI.Chat.Completions.ChatCompletionTool =
  {
    type: "function",
    function: {
      name: "run_python_file",
      description: "Execute the specified python file with specified arguments",
      parameters: {
        type: "object",
        properties: {
          file_path: {
            type: "string",
            description: "Path of pythong file",
          },
          args: {
            type: "array",
            items: { type: "string" },
            description: "list of arguments to run the python file with",
          },
        },
      },
    },
  };

export async function run_python_file(params: {
  working_directory: string;
  file_path: string;
  args: string[] | null;
}): Promise<string> {
  const { args, file_path, working_directory } = params;

  try {
    const workingDirectoryAbs = path.resolve(working_directory);
    const absoluteFilePath = path.resolve(workingDirectoryAbs, file_path);

    // Ensure the file is inside the permitted working directory.
    const relativePath = path.relative(workingDirectoryAbs, absoluteFilePath);

    const isValidPath =
      relativePath === "" ||
      (relativePath !== ".." &&
        !relativePath.startsWith(`..${path.sep}`) &&
        !path.isAbsolute(relativePath));

    if (!isValidPath) {
      return `Error: Cannot execute "${file_path}" as it is outside the permitted working directory`;
    }

    // Ensure the file has a .py extension.
    if (!absoluteFilePath.endsWith(".py")) {
      return `Error: "${file_path}" is not a Python file`;
    }

    // Ensure the path exists and points to a regular file.
    const stats = await fs.stat(absoluteFilePath).catch(() => null);

    if (!stats?.isFile()) {
      return `Error: "${file_path}" does not exist or is not a regular file`;
    }

    // Execute Python with the provided arguments.
    const commandArgs = [absoluteFilePath, ...(args ?? [])];

    const { error, stdout, stderr } = await new Promise<{
      error: (Error & { code?: string | number; killed?: boolean }) | null;
      stdout: string;
      stderr: string;
    }>((resolve) => {
      execFile(
        "python",
        commandArgs,
        {
          cwd: workingDirectoryAbs,
          timeout: 30_000,
          encoding: "utf8",
        },
        (error, stdout, stderr) => {
          resolve({
            error,
            stdout,
            stderr,
          });
        },
      );
    });

    if (error) {
      if (typeof error.code === "number") {
        return `Process exited with code ${error.code}`;
      }

      if (error.killed) {
        return "Error: Python process timed out after 30 seconds";
      }

      return `Error: ${error.message}`;
    }

    const stdoutText = stdout.trim();
    const stderrText = stderr.trim();

    if (stdoutText === "" && stderrText === "") {
      return "No output produced";
    }

    let output = "";

    if (stdoutText) {
      output += `STDOUT: ${stdoutText}\n`;
    }

    if (stderrText) {
      output += `STDERR: ${stderrText}\n`;
    }

    return output;
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : String(error)}`;
  }
}
