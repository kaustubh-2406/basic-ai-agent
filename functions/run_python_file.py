import os
import subprocess
from pathlib import Path

schema_run_python_file = {
    "type": "function",
    "function": {
        "name": "run_python_file",
        "description": "Execute the specified python file with specified arguments",
        "parameters": {
            "type": "object",
            "properties": {
                "file_path": {
                    "type": "string",
                    "description": "Path of pythong file",
                },
                "args": {
                    "type": "string",
                    "description": "list of arguments to run the python file with",
                },
            },
        },
    },
}


def run_python_file(
    working_directory: str,
    file_path: str,
    args: list[str] | None = None
) -> str:
    try:
        working_directory_abs = os.path.abspath(working_directory)
        absolute_file_path = os.path.normpath(
            os.path.join(working_directory_abs, file_path))

        is_valid_path = os.path.commonpath(
            [working_directory_abs, absolute_file_path]) == working_directory_abs

        if not is_valid_path:
            return f'Error: Cannot execute "{file_path}" as it is outside the permitted working directory'

        if not absolute_file_path.endswith(".py"):
            return f'Error: "{file_path}" is not a Python file'

        if not Path(absolute_file_path).is_file():
            return f'Error: "{file_path}" does not exist or is not a regular file'

        command = ["python", absolute_file_path]
        if args is not None:
            command.extend(args)

        proc = subprocess.run(
            command,
            text=True,
            timeout=30,
            capture_output=True,
            cwd=working_directory_abs,
        )

        if not proc.returncode == 0:
            return f"Process exited with code {proc.returncode}"

        stderr_text = proc.stderr.strip()
        stdout_text = proc.stdout.strip()
        if stderr_text == "" and stdout_text == "":
            return "No output produced"

        out = ""
        if stdout_text:
            out += f"STDOUT: {stdout_text}\n"
        if stderr_text:
            out += f"STDERR: {stderr_text}\n"

        return out

    except Exception as e:
        return f'Error: {e}'
