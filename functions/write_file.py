import os

schema_write_file = {
    "type": "function",
    "function": {
        "name": "write_file",
        "description": "Write specified content to a specified file to the working directory",
        "parameters": {
            "type": "object",
            "properties": {
                "file_path": {
                    "type": "string",
                    "description": "File path to write to",
                },
                "content": {
                    "type": "string",
                    "description": "Content for the file",
                }
            },
        },
    },
}


def write_file(working_directory: str, file_path: str, content: str) -> str:
    try:
        working_directory_abs = os.path.abspath(working_directory)
        absolute_file_path = os.path.normpath(
            os.path.join(working_directory_abs, file_path))

        is_valid_path = os.path.commonpath(
            [working_directory_abs, absolute_file_path]) == working_directory_abs

        if not is_valid_path:
            return f'Error: Cannot write to "{file_path}" as it is outside the permitted working directory'

        if os.path.isdir(absolute_file_path):
            return f'Error: Cannot write to "{file_path}" as it is a directory'

        os.makedirs(os.path.dirname(absolute_file_path), exist_ok=True)

        with open(absolute_file_path, "w") as f:
            f.write(content)
            return f'Successfully wrote to "{file_path}" ({len(content)} characters written)'

    except Exception as e:
        return f'Error: {e}'
