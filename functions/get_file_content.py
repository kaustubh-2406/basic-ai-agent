import os
from config import MAX_CHARS


schema_get_file_content = {
    "type": "function",
    "function": {
        "name": "get_file_content",
        "description": "Reads and returns the content of a specified file",
        "parameters": {
            "type": "object",
            "properties": {
                "file_path": {
                    "type": "string",
                    "description": "Path of file to read",
                },
            },
        },
    },
}


def get_file_content(working_directory: str, file_path: str) -> str:
    try:
        working_directory_abs = os.path.abspath(working_directory)
        filepath = os.path.normpath(
            os.path.join(working_directory_abs, file_path))

        is_valid_path = os.path.commonpath(
            [working_directory_abs, filepath]) == working_directory_abs

        if not is_valid_path:
            return f'Error: Cannot read "{file_path}" as it is outside the permitted working directory'

        if not os.path.isfile(filepath):
            return f'Error: File not found or is not a regular file: "{file_path}"'

        with open(filepath, "r") as f:
            content = f.read(MAX_CHARS)

            if f.read(1):
                content += f'[{file_path} truncated: True'

            return content

    except Exception as e:
        print(f"Error: {e}")
