import re
from typing import List

from idol.schema import Reference


def get_tag_value(tags: List[str], tag: str, d: str):
    if tags:
        for t in tags:
            pre = t.index(tag + ":")
            if pre == 0:
                return t[len(tag) + 1:]

    return d


def snakify(name):
    first_pass = re.sub("(.)([A-Z][a-z]+)", r"\1_\2", name)
    return re.sub("([a-z0-9])([A-Z])", r"\1_\2", first_pass).lower()


def as_path(name: str):
    return "/".join(snakify(p) for p in name.split(".")) + ".py"


def as_python_module_path(path: str):
    return "." + path[:-3].replace("../", ".").replace("/", ".")


def relative_path_from(f: str, t: str) -> str:
    to_parts = t.split("/")
    from_parts = f.split("/")
    parts = []
    i = len(from_parts) - 1

    while i >= 0 and from_parts[:i] != to_parts[:i]:
        parts.append("..")
        i -= 1

    while i < len(to_parts):
        parts.append(to_parts[i])
        i += 1

    return "/".join(parts)


def as_qualified_ident(reference: Reference) -> str:
    cameled = camelify(reference.qualified_name)
    return cameled[0].upper() + cameled[1:]


def camelify(name: str) -> str:
    return ""
