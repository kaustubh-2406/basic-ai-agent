import fs from "node:fs";
import path from "node:path";
import type OpenAI from "openai";

export const schema_get_files_info: OpenAI.Chat.Completions.ChatCompletionTool =
  {
    type: "function",
    function: {
      name: "get_files_info",
      description:
        "Lists files in a specified directory relative to the working directory, providing file size and directory status",
      parameters: {
        type: "object",
        properties: {
          directory: {
            type: "string",
            description:
              "Directory path to list files from, relative to the working directory (default is the working directory itself)",
          },
        },
        additionalProperties: false,
      },
    },
  };

export function get_files_info(args: {
  working_directory: string;
  directory?: string;
}): string {
  const { working_directory, directory = "." } = args;

  try {
    const workingDirectoryAbs = path.resolve(working_directory);
    const targetPath = path.resolve(workingDirectoryAbs, directory);

    // Ensure the target directory is inside the permitted working directory.
    const relativePath = path.relative(workingDirectoryAbs, targetPath);

    const isValidPath =
      relativePath === "" ||
      (relativePath !== ".." &&
        !relativePath.startsWith(`..${path.sep}`) &&
        !path.isAbsolute(relativePath));

    if (!isValidPath) {
      return `Error: Cannot list "${directory}" as it is outside the permitted working directory`;
    }

    if (!fs.statSync(targetPath, { throwIfNoEntry: false })?.isDirectory()) {
      return `Error: "${directory}" is not a directory`;
    }

    let output = "Result for current directory:\n";

    for (const item of fs.readdirSync(targetPath, { withFileTypes: true })) {
      const itemPath = path.join(targetPath, item.name);
      const stats = fs.statSync(itemPath);

      output += `${item.name}: file_size=${stats.size} bytes, is_dir=${stats.isDirectory()}\n`;
    }

    return output;
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : String(error)}`;
  }
}
