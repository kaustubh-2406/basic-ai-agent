import fs from "node:fs";
import path from "node:path";
import type OpenAI from "openai";

const MAX_CHARS = 10_000;

export const schema_get_file_content: OpenAI.Chat.Completions.ChatCompletionTool =
  {
    type: "function",
    function: {
      name: "get_file_content",
      description: "Reads and returns the content of a specified file",
      parameters: {
        type: "object",
        properties: {
          file_path: {
            type: "string",
            description: "Path of file to read",
          },
        },
        required: ["file_path"],
        additionalProperties: false,
      },
    },
  };

export function get_file_content(args: {
  working_directory: string;
  file_path: string;
}): string {
  const { working_directory, file_path } = args;

  try {
    const workingDirectoryAbs = path.resolve(working_directory);
    const filepath = path.resolve(workingDirectoryAbs, file_path);

    const relativePath = path.relative(workingDirectoryAbs, filepath);

    const isValidPath =
      relativePath === "" ||
      (relativePath !== ".." &&
        !relativePath.startsWith(`..${path.sep}`) &&
        !path.isAbsolute(relativePath));

    if (!isValidPath) {
      return `Error: Cannot read "${file_path}" as it is outside the permitted working directory`;
    }

    if (!fs.statSync(filepath, { throwIfNoEntry: false })?.isFile()) {
      return `Error: File not found or is not a regular file: "${file_path}"`;
    }

    const fd = fs.openSync(filepath, "r");

    try {
      const buffer = Buffer.alloc(MAX_CHARS);
      const bytesRead = fs.readSync(fd, buffer, 0, MAX_CHARS, 0);

      let content = buffer.subarray(0, bytesRead).toString("utf8");

      if (fs.fstatSync(fd).size > bytesRead) {
        content += `[${file_path} truncated: True`;
      }

      return content;
    } finally {
      fs.closeSync(fd);
    }
  } catch (error) {
    console.error(
      `Error: ${error instanceof Error ? error.message : String(error)}`,
    );
    return "";
  }
}
