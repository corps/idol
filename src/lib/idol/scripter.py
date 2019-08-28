from typing import Iterable, List

import black


def render(inner, mode=black.FileMode()):
    return black.format_str("\n".join(flatten_inner(inner)), mode=mode)


def from_import(module_name: str, *things: List[str]) -> str:
    things_str = ", ".join(things)
    return f"from {module_name} import {things_str}"


def flatten_inner(inner):
    if isinstance(inner, str):
        yield inner

    try:
        for block in inner:
            for line in flatten_inner(block):
                yield f"  {line}"
    except TypeError:
        pass

    yield str(inner)


def comment(s: str):
    s = s.replace("#", "\\#")
    return f"# {s}"
