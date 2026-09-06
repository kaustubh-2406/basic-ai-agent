import os
from pathlib import Path

schema_get_files_info = {
    "type": "function",
    "function": {
        "name": "get_files_info",
        "description": "Lists files in a specified directory relative to the working directory, providing file size and directory status",
        "parameters": {
            "type": "object",
            "properties": {
                "directory": {
                    "type": "string",
                    "description": "Directory path to list files from, relative to the working directory (default is the working directory itself)",
                },
            },
        },
    },
}


def get_files_info(working_directory: str, directory: str = ".") -> str:
    try:
        working_directory_abs = os.path.abspath(working_directory)
        target_path = os.path.normpath(
            os.path.join(working_directory_abs, directory))

        is_valid_path = os.path.commonpath(
            [working_directory_abs, target_path]) == working_directory_abs

        if not is_valid_path:
            return f'Error: Cannot list "{directory}" as it is outside the permitted working directory'

        if not Path(target_path).is_dir():
            return f'Error: "{directory}" is not a directory'

        out = "Result for current directory:\n"
        for item in Path(target_path).iterdir():
            name = item.name
            size = item.stat().st_size
            is_dir = item.is_dir()
            out += f"{name}: file_size={size} bytes, is_dir={is_dir}\n"

        return out

    except Exception as e:
        return f'Error: {e}'
