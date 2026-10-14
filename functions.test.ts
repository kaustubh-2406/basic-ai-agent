import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { get_files_info } from "./functions/get_files_info.ts";
import { get_file_content } from "./functions/get_file_content.ts";
import { write_file } from "./functions/write_file.ts";
import { run_python_file } from "./functions/run_python_file.ts";
import { call_function } from "./call_function.ts";

const working_directory = "calculator";

test("get_files_info", () => {
  assert.match(get_files_info({ working_directory, directory: "." }), /main\.py: file_size=\d+ bytes, is_dir=false/);
  assert.match(get_files_info({ working_directory, directory: "pkg" }), /calculator\.py/);
  assert.match(get_files_info({ working_directory, directory: "/bin" }), /outside the permitted working directory/);
  assert.match(get_files_info({ working_directory, directory: "../" }), /outside the permitted working directory/);
});

test("get_file_content", () => {
  assert.match(get_file_content({ working_directory, file_path: "main.py" }), /def main/);
  assert.match(get_file_content({ working_directory, file_path: "pkg/calculator.py" }), /class Calculator/);
  assert.match(get_file_content({ working_directory, file_path: "/bin/cat" }), /outside the permitted working directory/);
  assert.match(get_file_content({ working_directory, file_path: "pkg/does_not_exist.py" }), /File not found/);
});

test("write_file", async (t) => {
  t.after(() => fs.rmSync("calculator/pkg/morelorem.txt", { force: true }));

  assert.match(
    await write_file({ working_directory, file_path: "pkg/morelorem.txt", content: "lorem ipsum dolor sit amet" }),
    /Successfully wrote to "pkg\/morelorem.txt" \(26 characters written\)/,
  );
  assert.equal(fs.readFileSync("calculator/pkg/morelorem.txt", "utf8"), "lorem ipsum dolor sit amet");
  assert.match(
    await write_file({ working_directory, file_path: "/tmp/temp.txt", content: "nope" }),
    /outside the permitted working directory/,
  );
});

test("run_python_file", async () => {
  assert.match(await run_python_file({ working_directory, file_path: "main.py", args: null }), /Usage/);
  assert.match(await run_python_file({ working_directory, file_path: "main.py", args: ["3 + 5"] }), /8/);
  assert.match(await run_python_file({ working_directory, file_path: "tests.py", args: null }), /OK/);
  assert.match(await run_python_file({ working_directory, file_path: "../main.py", args: null }), /outside the permitted working directory/);
  assert.match(await run_python_file({ working_directory, file_path: "nonexistent.py", args: null }), /does not exist/);
  assert.match(await run_python_file({ working_directory, file_path: "README.md", args: null }), /not a Python file/);
});

test("call_function awaits async tools", async () => {
  const result = await call_function({
    id: "1",
    type: "function",
    function: { name: "run_python_file", arguments: JSON.stringify({ file_path: "main.py", args: ["3 + 5"] }) },
  });
  assert.equal(typeof result.content, "string");
  assert.match(result.content as string, /8/);
});
