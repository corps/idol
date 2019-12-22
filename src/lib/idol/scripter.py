from typing import Iterable, List, Dict, Optional, Callable, Union

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


def from_import(module_name: str, *things) -> str:
    things_str = ", ".join(things)
    return f"from {module_name} import {things_str}"


def flatten_inner(inner, indent=0):
    if isinstance(inner, str):
        yield inner
        return

    try:
        for block in inner:
            for line in flatten_inner(block, indent + 1):
                yield ("    " * indent) + line
        return
    except TypeError:
        pass

    yield str(inner)


def comments(comments: Iterable[str]) -> List:
    return [f"# {s}" for s in comments for s in [s.replace("#", "\\#")]]


def assignment(ident: str, expr: str, typing=None) -> str:
    typing = f": {typing}" if typing else ""
    return f"{ident}{typing} = {expr}"


def assignable(expr: str, typing=None) -> Callable[[str], str]:
    return lambda ident: assignment(ident, expr, typing)


def typing(ident: str, typing: str) -> str:
    return f"{ident}: {typing}"


def shadow_assignment(ident: str, expr: str) -> List:
    return [
        assignment(ident, expr),
        assignment(index_access(invocation("locals"), literal(ident)), expr),
    ]


def commented(
    comment: Iterable[str], scriptable: Callable[[str], Union[List, str]]
) -> Callable[[str], List]:
    def wrapped(ident: str) -> List:
        script = scriptable(ident)
        return comments(comment) + (script if isinstance(script, list) else [script])

    return wrapped


def declare_and_shadow(
    declaration: str, shadow_expr: str, dec_typing: Optional[str] = None
) -> Callable[[str], List]:
    def scriptable(ident: str):
        return [assignment(ident, declaration, dec_typing)] + shadow_assignment(ident, shadow_expr)

    return scriptable


def invocation(callable: str, *args, **kwds):
    kwds = [f"{k}={v}" for k, v in kwds.items()]
    args = list(args) + kwds
    args = ", ".join(args)
    return f"{callable}({args})"


def index_access(expr: str, *keys):
    return f"{expr}[{', '.join(keys)}]"


def prop_access(value: str, *props):
    props = [value] + list(props)
    return ".".join(props)


def tuple(*values):
    return f"({', '.join(values)},)"


def type_parameterized(cons: str, *type_params) -> str:
    type_params = "".join(f"[{tp}]" for tp in type_params)
    return cons + type_params


def literal(value) -> str:
    return repr(value)


def thunk(expr: str) -> str:
    return f"(lambda: {expr})"


def array(values: Iterable[str]):
    return f"[{', '.join(values)}]"


def class_dec(
    class_name: str,
    super_classes: Iterable[str],
    body: Iterable,
    doc_str: Optional[Iterable[str]] = None,
    decorators: Optional[Iterable[str]] = None,
) -> List:
    super_str: str = ", ".join(super_classes) if super_classes else "object"
    return ["@" + dec for dec in (decorators or [])] + [
        f"class {class_name}({super_str}):",
        (['"""'] + list(doc_str) + ['"""'] if doc_str else []) + (list(body) or ["pass"]),
    ]


def nameable_class_dec(
    super_classes: Iterable[str],
    body: Iterable,
    doc_str: Optional[Iterable[str]] = None,
    decorators: Optional[Iterable[str]] = None,
) -> Callable[[str], List]:
    def nameable(ident: str) -> List:
        return class_dec(ident, super_classes, body, doc_str=doc_str, decorators=decorators)

    return nameable


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
