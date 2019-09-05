from typing import Iterable, List, Dict

import black


def render(inner, mode=black.FileMode()):
    body = "\n".join(flatten_inner(inner))
    try:
        return black.format_str(body, mode=mode)
    except:
        print("")
        print(body)
        print("")
        raise


def from_import(module_name: str, *things: List[str]) -> str:
    things_str = ", ".join(things)
    return f"from {module_name} import {things_str}"


def flatten_inner(inner, indent=0):
    if isinstance(inner, str):
        yield inner
        return

    try:
        for block in inner:
            for line in flatten_inner(block, indent + 1):
                yield ("  " * indent) + line
        return
    except TypeError:
        pass

    yield str(inner)


def comment(s: str):
    s = s.replace("#", "\\#")
    return f"# {s}"


def assignment(target: str, value: str, typing=None) -> str:
    typing = f": {typing}" if typing else ""
    return f"{target}{typing} = {value}"


def invocation(callable: str, *args, **kwds):
    kwds = [f"{k}={v}" for k, v in kwds.items()]
    args = list(args) + kwds
    args = ", ".join(args)
    return f"{callable}({args})"


def index_access(value: str, key: str):
    return f"{value}[{key}]"


def prop_access(value: str, *props):
    props = [value] + list(props)
    return ".".join(props)


def tuple(*values):
    return f"({', '.join(values)},)"


def type_parameterized(cons: str, *type_params) -> str:
    type_params = "".join(f"[{tp}]" for tp in type_params)
    return cons + type_params


def literal(value):
    return repr(value)


def array(values: Iterable[str]):
    return f"[{', '.join(values)}]"


def class_dec(class_name: str, super_classes: Iterable[str], body: Iterable) -> List:
    super_str: str = ", ".join(super_classes) if super_classes else "object"
    return [f"class {class_name}({super_str}):", list(body) or ["pass"]]


def func_dec(
        func_name: str,
        args: List[str] = [],
        body: Iterable = ["pass"],
        kwds: Dict[str, str] = {},
        typing: str = "",
        decorators: Iterable[str] = [],
) -> List:
    if typing:
        typing = f" -> {typing}"

    return list(f"@{d}" for d in decorators) + [
        f"def {invocation(func_name, *args, **kwds)}{typing}:",
        list(body),
    ]


def ret(v: str):
    return f"return {v}"
