import re
from typing import List

from idol.schema import Reference

#
# def get_tag_value(tags: List[str], tag: str, d: str):
#     if tags:
#         for t in tags:
#             pre = t.index(tag + ":")
#             if pre == 0:
#                 return t[len(tag) + 1:]
#
#     return d

#
# def as_qualified_ident(reference: Reference) -> str:
#     cameled = camelify(reference.module_name)
#     return cameled[0].upper() + cameled[1:] + reference.type_name
#
#
# def camelify(name: str) -> str:
#     return "".join(p[0].upper() + p[1:] for p in re.split("[._]", name) if p)
