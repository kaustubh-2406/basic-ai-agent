import path from "node:path";
import fs from "node:fs/promises";

import type OpenAI from "openai";

export const schema_write_file: OpenAI.Chat.Completions.ChatCompletionTool = {
  type: "function",
  function: {
    name: "write_file",
    description:
      "Write specified content to a specified file to the working directory",
    parameters: {
      type: "object",
      properties: {
        file_path: {
          type: "string",
          description: "File path to write to",
        },
        content: {
          type: "string",
          description: "Content for the file",
        },
      },
    },
  },
};

export async function write_file(args: {
  working_directory: string;
  file_path: string;
  content: string;
}): Promise<string> {
  const { content, file_path, working_directory } = args;

  try {
    const workingDirectoryAbs = path.resolve(working_directory);
    const absoluteFilePath = path.resolve(workingDirectoryAbs, file_path);

    const relativePath = path.relative(workingDirectoryAbs, absoluteFilePath);
    const isValidPath =
      relativePath === "" ||
      (!relativePath.startsWith(`..${path.sep}`) &&
        relativePath !== ".." &&
        !path.isAbsolute(relativePath));

    if (!isValidPath) {
      return `Error: Cannot write to "${file_path}" as it is outside the permitted working directory`;
    }

    try {
      const stats = await fs.stat(absoluteFilePath);
      if (stats.isDirectory()) {
        return `Error: Cannot write to "${file_path}" as it is a directory`;
      }
    } catch (error: any) {
      if (error.code !== "ENOENT") throw error;
    }

    await fs.mkdir(path.dirname(absoluteFilePath), { recursive: true });

    await fs.writeFile(absoluteFilePath, content, "utf8");

    return `Successfully wrote to "${file_path}" (${content.length} characters written)`;
  } catch (error: any) {
    return `Error: ${error.message}`;
  }
}
