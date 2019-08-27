def as_path(name: str):
    return name.replace(".", "/") + ".py"


def as_python_module_path(path: str):
    return "." + path[:-3].replace("../", ".").replace("/", ".")


def relative_path_from(f: str, t: str) -> str:
    to_parts = t.split("/")
    from_parts = f.split("/")
    parts = []
    i = len(from_parts) - 1

    while i >= 0 and from_parts[:i] != to_parts[:i]:
        parts.append('..')
        i -= 1

    while i < len(to_parts):
        parts.append(to_parts[i])
        i += 1

    return "/".join(parts)
