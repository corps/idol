from cached_property import cached_property

import idol.scripter as scripter
from typing import Dict, List, Union, TypeVar, Callable, Tuple, Any, Optional, Iterable

from idol.py.schema.primitive_type import PrimitiveType
from idol.py.schema.reference import Reference
from idol.py.schema.struct_kind import StructKind
from idol.py.schema.type import Type
from .build_env import BuildEnv
from .functional import OrderedObj, Alt, StringSet, naive_object_concat
from idol.py.schema.module import Module
from idol.py.schema.type_struct import TypeStruct
import os.path

A = TypeVar("A")


class Path:
    path: str

    def __init__(self, path: str):
        self.path = path

    def __eq__(self, other):
        return self.path == other.path

    @property
    def is_module(self):
        return not self.path.endswith(".py")

    def import_path_to(self, to_path: "Path") -> "ImportPath":
        # Special case for relative path to self => is_local
        if self == to_path:
            return ImportPath(to_path, "")

        if to_path.is_module:
            return ImportPath.module(to_path.path)

        if self.is_module:
            raise ValueError("Absolute modules cannot express relative import paths!")

        from_parts = self.path.split("/")
        to_parts = to_path.path.split("/")
        parts = []
        i = len(from_parts)

        while i > 0 and from_parts[:i] != to_parts[:i]:
            parts.append("..")
            i -= 1

        while i < len(to_parts):
            parts.append(to_parts[i])
            i += 1

        return ImportPath(to_path, "/".join(parts))

    def __str__(self):
        return self.path


class ImportPath:
    path: Path
    rel_path: str

    def __init__(self, path: Path, rel_path: str):
        self.path = path
        self.rel_path = rel_path

    def __str__(self):
        return str(self.path)

    @classmethod
    def module(cls, module: str) -> "ImportPath":
        return cls(Path(module), module)

    @property
    def is_module(self):
        return self.path.is_module

    @staticmethod
    def as_python_module_path(rel_path: str) -> str:
        if rel_path == "":
            raise ValueError("is_local path cannot be a python module path!")

        if rel_path.endswith(".py"):
            if rel_path[0] != ".":
                rel_path = "./" + rel_path
            return rel_path[:-3].replace("../", ".").replace("/", ".")

        return rel_path


class Exported:
    path: Path
    ident: str
    source_state: Optional["GeneratorAcc"]

    def __init__(self, path: Path, ident: str, source_state: Optional["GeneratorAcc"] = None):
        self.ident = ident
        self.path = path

        if not path.is_module and not source_state:
            raise ValueError(f"source_state parameter required for non module {path}")

        self.source_state = source_state


class GeneratorParams:
    def __init__(
        self,
        all_modules: OrderedObj[Module],
        all_types: OrderedObj[Type],
        scaffold_types: OrderedObj[Type],
        output_dir: str,
        options: Dict[str, Union[List[str], bool]],
    ):
        self.all_modules = all_modules
        self.all_types = all_types
        self.scaffold_types = scaffold_types
        self.output_dir = output_dir
        self.options = options


def includes_tag(tags: Optional[Iterable[str]], tag: str) -> bool:
    return bool(tags) and tag in list(tags)


def get_tag_value(tags: Optional[Iterable[str]], d: str, tag: str) -> str:
    if not tags:
        return d

    for t in tags:
        if t.startswith(tag + ":"):
            return t[len(tag) + 1 :]

    return d


def get_tag_values(tags: Optional[Iterable[str]], tag: str) -> List[str]:
    if not tags:
        return []

    result: List[str] = []

    for t in tags:
        if t.startswith(tag + ":"):
            result.append(t[len(tag) + 1 :])

    return result


class TypeStructContext:
    field_tags: List[str]
    type_tags: List[str]
    is_type_bound: bool
    type_display_name: str
    field_name: Optional[str]

    @property
    def is_declarable(self):
        return self.is_type_bound

    def __init__(
        self,
        type_display_name: str,
        field_name: Optional[str] = None,
        field_tags: Optional[List[str]] = None,
        type_tags: Optional[List[str]] = None,
    ):
        self.type_display_name = type_display_name
        self.field_name = field_name
        self.field_tags = field_tags or []
        self.type_tags = type_tags or []
        self.is_type_bound = type_tags is not None and field_tags is None


class ScalarContext:
    is_contained: bool
    typestruct_context: TypeStructContext

    def __init__(self, typestruct_context: TypeStructContext, is_contained: bool):
        self.typestruct_context = typestruct_context
        self.is_contained = is_contained

    @property
    def is_type_bound(self):
        return self.typestruct_context.is_type_bound

    @property
    def is_declarable(self):
        return not self.is_contained and self.is_type_bound


class ScalarDeconstructor:
    type_struct: TypeStruct
    context: ScalarContext

    def __init__(self, type_struct: TypeStruct, context: ScalarContext):
        self.type_struct = type_struct
        self.context = context

    def get_primitive(self) -> Alt[PrimitiveType]:
        if self.type_struct.is_alias or self.type_struct.is_literal:
            return Alt.empty()

        return Alt.lift(self.type_struct.primitive_type)

    def get_literal(self) -> Alt[Tuple[PrimitiveType, Any]]:
        if self.type_struct.is_alias or not self.type_struct.is_literal:
            return Alt.empty()

        return Alt.lift((self.type_struct.primitive_type, self.type_struct.literal_value))

    def get_alias(self) -> Alt[Reference]:
        if not self.type_struct.is_alias:
            return Alt.empty()

        return Alt.lift(self.type_struct.reference)


class TypeStructDeconstructor:
    type_struct: TypeStruct
    context: TypeStructContext

    def __init__(self, type_struct: TypeStruct, context: TypeStructContext):
        self.type_struct = type_struct
        self.context = context

    def get_scalar(self) -> Alt[ScalarDeconstructor]:
        if self.type_struct.struct_kind != StructKind.SCALAR:
            return Alt.empty()

        return Alt.lift(ScalarDeconstructor(self.type_struct, ScalarContext(self.context, False)))

    def get_repeated(self) -> Alt[ScalarDeconstructor]:
        if self.type_struct.struct_kind != StructKind.REPEATED:
            return Alt.empty()

        return Alt.lift(ScalarDeconstructor(self.type_struct, ScalarContext(self.context, False)))

    def get_map(self) -> Alt[ScalarDeconstructor]:
        if self.type_struct.struct_kind != StructKind.MAP:
            return Alt.empty()

        return Alt.lift(ScalarDeconstructor(self.type_struct, ScalarContext(self.context, False)))


class TypeDeconstructor:
    t: Type

    def __init__(self, t: Type):
        self.t = t

    def get_typestruct(self) -> Alt[TypeStructDeconstructor]:
        if not self.t.is_a:
            return Alt.empty()

        return Alt.lift(
            TypeStructDeconstructor(
                self.t.is_a,
                TypeStructContext(
                    type_display_name=self.t.named.qualified_name, type_tags=list(self.t.tags)
                ),
            )
        )

    def get_enum(self) -> Alt[List[str]]:
        if self.t.is_a or not self.t.is_enum:
            return Alt.empty()

        return Alt.lift(self.t.options)

    def get_struct(self) -> Alt[OrderedObj[TypeStructDeconstructor]]:
        if self.t.is_a or self.t.is_enum:
            return Alt.empty()

        return Alt.lift(
            OrderedObj(
                {
                    k: TypeStructDeconstructor(
                        v.type_struct,
                        TypeStructContext(
                            type_display_name=v.type_struct.type_display_name,
                            field_name=v.field_name,
                            field_tags=list(v.tags),
                        ),
                    )
                    for k, v in self.t.fields.items()
                }
            )
        )


def import_expr(exported: Exported, as_ident: str = None) -> "Expression":
    def inner(state: GeneratorAcc, path: Path) -> str:
        return state.import_ident(path, exported, as_ident)

    return inner


def as_expression(expr: str) -> "Expression":
    def inner(state: GeneratorAcc, path: Path) -> str:
        return expr

    return inner


def get_material_type_deconstructor(all_types: OrderedObj[Type], t: Type) -> TypeDeconstructor:
    def search_type(type_decon: TypeDeconstructor) -> TypeDeconstructor:
        return Alt(
            search_type(TypeDeconstructor(all_types.obj[alias.qualified_name].with_tags(t.tags)))
            for type_struct in type_decon.get_typestruct()
            for scalar in type_struct.get_scalar()
            for alias in scalar.get_alias()
        ).get_or(type_decon)

    return search_type(TypeDeconstructor(t))


class GeneratorConfig:
    codegen_root: str
    name: str
    path_mappings: Dict[str, Callable[[Reference], str]]
    params: GeneratorParams

    def __init__(self, params: GeneratorParams):
        self.params = params
        self.codegen_root = "codegen"
        self.name = "idol_py"
        self.path_mappings = {}

    def paths_of(self, **k: Dict[str, Reference]) -> Dict[str, str]:
        return {group: self.path_mappings[group](ref) for group, ref in k.items()}

    @staticmethod
    def one_file_per_type(r: Reference) -> str:
        return r.as_qn_path

    @staticmethod
    def one_file_per_module(r: Reference) -> str:
        return r.as_module_path

    @staticmethod
    def flat_namespace(r: Reference) -> str:
        return r.as_type_path

    def in_codegen_dir(self, m: Callable[[Reference], str]) -> Callable[[Reference], str]:
        def in_codegen_dir(r: Reference):
            return f"{self.codegen_root}/{m(r)}"

        return in_codegen_dir

    def with_path_mappings(self, path_mappings: Dict[str, Callable[[Reference], str]]):
        self.path_mappings = path_mappings


class IdentifiersAcc:
    # path -> IdentityName -> sources mset
    idents: OrderedObj[OrderedObj[StringSet]]

    def __init__(self):
        self.idents = OrderedObj()

    def concat(self, other: "IdentifiersAcc") -> "IdentifiersAcc":
        return naive_object_concat(self, other)

    __add__ = concat

    def add_identifier(self, into_path: Path, ident: str, source: str) -> str:
        sources = Alt(
            sources
            for path_idents in self.idents.get(into_path.path)
            for sources in path_idents.get(ident)
        ).get_or(StringSet([source]))

        if source not in sources:
            raise ValueError(
                f"Cannot create ident {ident} in {into_path.path}, conflicts with existing definition."
            )

        self.idents += OrderedObj({into_path.path: OrderedObj({ident: StringSet([source])})})
        return ident

    def get_identifier_sources(self, path: Path, ident: str) -> Alt[StringSet]:
        return Alt(
            idents
            for path_idents in self.idents.get(path.path)
            for idents in path_idents.get(ident)
        )

    def unwrap_conflicts(self) -> List[Tuple[str, str, StringSet]]:
        return [
            (path, ident, sources)
            for path, mod in self.idents
            for ident, sources in mod
            if len(sources) > 1
        ]


class ImportsAcc:
    # into_path -> from_path -> from_ident -> into_idents
    imports: OrderedObj[OrderedObj[OrderedObj[StringSet]]]

    def __init__(self):
        self.imports = OrderedObj()

    def concat(self, other: "ImportsAcc") -> "ImportsAcc":
        return naive_object_concat(self, other)

    __add__ = concat

    def add_import(self, into_path: Path, from_path: ImportPath, from_ident: str, into_ident: str):
        self.imports += OrderedObj(
            {
                into_path.path: OrderedObj(
                    {from_path.rel_path: OrderedObj({from_ident: StringSet([into_ident])})}
                )
            }
        )

    def get_imported_as_idents(
        self, into_path: Path, from_path: ImportPath, from_ident: str
    ) -> Alt[StringSet]:
        return Alt(
            into_idents
            for imported_from in self.imports.get(into_path.path)
            for from_idents in imported_from.get(from_path.rel_path)
            for into_idents in from_idents.get(from_ident)
        )

    def render(self, into_path: str) -> List[str]:
        return Alt(
            [
                scripter.from_import(
                    ImportPath.as_python_module_path(rel_path),
                    *[
                        f"{from_ident} as {as_ident}" if from_ident != as_ident else from_ident
                        for from_ident, as_idents in decons
                        for as_ident in as_idents
                    ],
                )
                for rel_path, decons in imports
                if rel_path
            ]
            for imports in self.imports.get(into_path)
        ).get_or([])


class GeneratorAcc:
    idents: IdentifiersAcc
    imports: ImportsAcc
    content: OrderedObj[List]
    group_of_path: OrderedObj[StringSet]
    external_source_roots: Dict["GeneratorAcc", str]
    uniq: int

    def __init__(self):
        self.idents = IdentifiersAcc()
        self.imports = ImportsAcc()
        self.content = OrderedObj()
        self.group_of_path = OrderedObj()
        self.external_source_roots = {}
        self.uniq = 0

    def add_external_source_root(self, source_state: "GeneratorAcc", rel_path: str):
        self.external_source_roots[source_state] = rel_path

    def validate(self) -> "GeneratorAcc":
        path_errors = [
            f"Conflict in paths: Multiple ({' '.join(conflicts)}) types of {path} found"
            for path, path_groups in self.group_of_path
            for conflicts in Alt.unwrap_conflicts(path_groups)
        ]

        if path_errors:
            raise ValueError("\n".join(path_errors))

        conflicts = self.idents.unwrap_conflicts()
        if conflicts:
            raise ValueError(
                "Found conflicting identifiers:\n"
                + "\n  ".join(
                    f"ident {ident} was defined or imported into {path} by conflicting sources: {' '.join(sources)}"
                    for path, ident, sources in conflicts
                )
            )

        return self

    def render(self, comment_headers=Dict[str, List]) -> OrderedObj[str]:
        self.validate()

        return OrderedObj.from_iterable(
            OrderedObj(
                {
                    path: scripter.render(
                        scripter.comments(
                            lines
                            for group in groups
                            if group in comment_headers
                            for lines in comment_headers[group]
                        )
                        + self.imports.render(path)
                        + self.content.get(path).get_or([])
                    )
                }
            )
            for path, groups in self.group_of_path
            if self.content.get(path)
        )

    def add_content(self, path: Path, content: Union[str, List[str]]):
        if isinstance(content, str):
            content = [content]

        self.content += OrderedObj({path.path: content})

    def reserve_path(self, **lookup) -> Path:
        group, path = Alt(lookup.items()).unwrap()
        groups = self.group_of_path.get(path).get_or(StringSet([group]))

        if group in groups:
            self.group_of_path += OrderedObj({path: StringSet([group])})
            return Path(path)

        raise ValueError(
            f"Conflict:  cannot create file {path} for group {group}, already exists for {' '.join(groups)}"
        )

    def import_ident(
        self, into_path: Path, exported: Exported, as_ident: Optional[str] = None
    ) -> str:
        ident = exported.ident
        if as_ident is None:
            as_ident = ident

        # No imports actually required.
        if into_path == exported.path:
            return exported.ident

        export_path = exported.path

        # Handle pathing mapping of exports from external source states.
        if exported.source_state and exported.source_state is not self:
            rel_root = self.external_source_roots[exported.source_state]
            export_path = Path(os.path.join(rel_root, export_path.path))

        from_path = into_path.import_path_to(export_path)

        if not from_path.is_module and not exported.source_state.idents.get_identifier_sources(
            exported.path, ident
        ):
            raise ValueError(
                f"identifier {ident} required by {into_path} does not exist in {from_path}"
            )

        imported_as = self.imports.get_imported_as_idents(into_path, from_path, ident).get_or(
            StringSet([])
        )

        if imported_as:
            return sorted(imported_as)[0]

        as_ident = self.create_ident(into_path, as_ident, from_path.path.path)
        self.imports.add_import(into_path, from_path, ident, as_ident)

        return as_ident

    def create_ident(self, into_path: Path, as_ident: str, source: str) -> str:
        as_ident = get_safe_ident(as_ident)

        while source not in self.idents.get_identifier_sources(into_path, as_ident).get_or(
            StringSet([source])
        ):
            as_ident += "_"

        self.idents.add_identifier(into_path, as_ident, source)
        return as_ident

    def add_content_with_ident(
        self, path: Path, ident: str, scriptable: Callable[[str], Union[str, List]]
    ) -> str:
        self.idents.add_identifier(path, ident, self.get_unique_source(path))
        self.add_content(path, scriptable(ident))
        return ident

    def get_unique_source(self, path: Path) -> str:
        self.uniq += 1
        return path.path + "." + str(self.uniq)


Expression = Callable[[GeneratorAcc, Path], str]


class GeneratorContext:
    state: GeneratorAcc
    config: GeneratorConfig

    def __init__(self, state: GeneratorAcc, config: GeneratorConfig):
        self.state = state
        self.config = config


class AbstractGeneratorFileContext:
    path: Path
    state: GeneratorAcc

    def reserve_ident(self, ident: str) -> str:
        self.state.idents.add_identifier(self.path, ident, self.state.get_unique_source(self.path))
        return ident

    def export(self, ident: str, scriptable: Callable[[str], Union[str, List]]) -> Exported:
        assert self.state.idents.get_identifier_sources(self.path, ident).get_or(
            StringSet()
        ), "GeneratorFileContext.export called before identifier reserved."

        self.state.add_content(self.path, scriptable(ident))
        return Exported(self.path, ident, source_state=self.state)

    def import_ident(self, exported: Exported, as_ident: Optional[str] = None) -> str:
        return self.state.import_ident(self.path, exported, as_ident)

    def apply_expr(self, expression: Expression) -> str:
        return expression(self.state, self.path)


class GeneratorFileContext(AbstractGeneratorFileContext):
    parent: GeneratorContext

    def __init__(self, parent: GeneratorContext, path: Path):
        self.parent = parent
        self.path = path

    @property
    def state(self) -> GeneratorAcc:
        return self.parent.state

    @property
    def config(self) -> GeneratorConfig:
        return self.parent.config


class ExternFileContext(GeneratorFileContext):
    EXTERN_FILE: str = ""

    @cached_property
    def dumped_file(self) -> Path:
        content = open(self.EXTERN_FILE, encoding="utf-8").read()
        self.state.add_content(self.path, content)
        return self.path

    def export_extern(self, ident: str) -> Exported:
        return Exported(
            self.dumped_file,
            self.state.idents.add_identifier(self.dumped_file, ident, "extern"),
            source_state=self.state,
        )


def get_safe_ident(ident):
    while ident in KEYWORDS:
        ident += "_"
    return ident


KEYWORDS = {
    "False",
    "True",
    "class",
    "finally",
    "is",
    "return",
    "None",
    "continue",
    "for",
    "lambda",
    "try",
    "def",
    "from",
    "nonlocal",
    "while",
    "and",
    "del",
    "global",
    "not",
    "with",
    "as",
    "elif",
    "if",
    "or",
    "yield",
    "assert",
    "else",
    "import",
    "pass",
    "break",
    "except",
    "in",
    "raise",
}


def build(config: GeneratorConfig, output: OrderedObj[str]) -> Callable[[str], None]:
    build_env = BuildEnv(config.name, config.codegen_root)

    for path, contents in output:
        if contents:
            build_env.write_build_file(path, contents)

    return lambda output_dir: build_env.finalize(output_dir)
