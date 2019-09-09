import idol.scripter as scripter
from typing import Dict, List, Union, TypeVar, Callable, Tuple, Any, Optional
from .build_env import BuildEnv
from .functional import OrderedObj, Alt, mset, Disjoint, naive_object_concat, Acc
from .schema import Module, Type, Reference, PrimitiveType, TypeStruct, StructKind, Field

A = TypeVar("A")
B = TypeVar("B")
C = TypeVar("C")
D = TypeVar("D")


class Path:
    path: str

    def __init__(self, path: str):
        self.path = path

    def __eq__(self, other):
        return self.path == other.path

    def import_path_to(self, to_path: "Path") -> "ImportPath":
        # Special case for relative path to self => is_local
        if self == to_path:
            return ImportPath("")

        from_parts = self.path.split("/")
        to_parts = to_path.path.split("/")
        parts = []
        i = len(from_parts) - 1

        while i >= 0 and from_parts[:i] != to_parts[:i]:
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

    @staticmethod
    def as_python_module_path(rel_path: str) -> str:
        if rel_path == "":
            raise ValueError("is_local path cannot be a python module path!")

        if rel_path.endswith(".py"):
            return "." + rel_path[:-3].replace("../", ".").replace("/", ".")

        return rel_path


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


class Tags:
    field_tags: List[str]
    type_tags: List[str]

    def __init__(self, field_tags=[], type_tags=[]):
        self.field_tags = field_tags
        self.type_tags = type_tags


class ScalarDeconstructor:
    type_struct: TypeStruct

    def __init__(self, type_struct: TypeStruct):
        self.type_struct = type_struct
        pass

    def get_primitive(self) -> Alt[PrimitiveType]:
        if self.type_struct.is_alias or self.type_struct.is_literal:
            return Alt.empty()

        return Alt.lift(self.type_struct.primitive_type)

    def get_literal(self) -> Alt[Tuple[PrimitiveType, Any]]:
        if self.type_struct.is_alias or self.type_struct.is_literal:
            return Alt.empty()

        return Alt.lift((self.type_struct.primitive_type, self.type_struct.literal_value))

    def get_alias(self) -> Alt[Reference]:
        if not self.type_struct.is_alias:
            return Alt.empty()

        return Alt.lift(self.type_struct.reference)


class TypeStructDeconstructor:
    type_struct: TypeStruct

    def __init__(self, type_struct: TypeStruct):
        self.type_struct = type_struct

    def get_scalar(self) -> Alt[ScalarDeconstructor]:
        if self.type_struct.struct_kind != StructKind.SCALAR:
            return Alt.empty()

        return Alt.lift(ScalarDeconstructor(self.type_struct))

    def get_repeated(self) -> Alt[ScalarDeconstructor]:
        if self.type_struct.struct_kind != StructKind.REPEATED:
            return Alt.empty()

        return Alt.lift(ScalarDeconstructor(self.type_struct))

    def get_map(self) -> Alt[ScalarDeconstructor]:
        if self.type_struct.struct_kind != StructKind.MAP:
            return Alt.empty()

        return Alt.lift(ScalarDeconstructor(self.type_struct))


class TypeDeconstructor:
    t: Type

    def __init__(self, t: Type):
        self.t = t

    def get_typestruct(self) -> Alt[TypeStructDeconstructor]:
        if not self.t.is_a:
            return Alt.empty()

        return Alt.lift(TypeStructDeconstructor(self.t.is_a))

    def get_enum(self) -> Alt[List[str]]:
        if self.t.is_a or not self.t.is_enum:
            return Alt.empty()

        return Alt.lift(self.t.options)

    def get_struct(self) -> Alt[OrderedObj[Field]]:
        if self.t.is_a or self.t.is_enum:
            return Alt.empty()

        return Alt.lift(OrderedObj(dict(self.t.fields.items())))


def get_material_type_deconstructor(all_types: OrderedObj[Type], t: Type) -> TypeDeconstructor:
    def search_type(type_decon: TypeDeconstructor) -> TypeDeconstructor:
        return Alt(
            search_type(TypeDeconstructor(all_types.obj[alias.qualified_name]))
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
    idents: OrderedObj[OrderedObj[mset]]

    def __init__(self):
        self.idents = OrderedObj()

    def concat(self, other: "IdentifiersAcc") -> "IdentifiersAcc":
        return naive_object_concat(self, other)

    __add__ = concat

    def add_identifier(self, into_path: Path, ident: str, source: str):
        self.get_identifier_sources(into_path, ident).add(source)

    def get_identifier_sources(self, path: Path, ident: str) -> mset:
        return self.idents.set_default(path.path, OrderedObj()).set_default(ident, mset([]))

    def unwrap_conflicts(self) -> List[Tuple[str, str, mset]]:
        return [
            err
            for mod, path in self.idents
            for err in Disjoint((path, ident, sources) for sources, ident in mod).unwrap_errors()
        ]


class ImportsAcc:
    # into_path -> from_path -> from_ident -> into_idents
    imports: OrderedObj[OrderedObj[OrderedObj[mset]]]

    def __init__(self):
        self.imports = OrderedObj()

    def concat(self, other: "ImportsAcc") -> "ImportsAcc":
        return naive_object_concat(self, other)

    __add__ = concat

    def add_import(self, into_path: Path, from_path: ImportPath, from_ident: str, into_ident: str):
        self.get_imported_as_idents(into_path, from_path, from_ident).add(into_ident)

    def get_imported_as_idents(
            self, into_path: Path, from_path: ImportPath, from_ident: str
    ) -> mset:
        return (
            self.imports.obj.setdefault(into_path.path, OrderedObj())
                .obj.setdefault(from_path.rel_path, OrderedObj())
                .obj.setdefault(from_ident, mset([]))
        )

    def render(self, into_path: str) -> List[str]:
        return [
            scripter.from_import(
                ImportPath.as_python_module_path(rel_path),
                *[
                    f"{from_ident} as {as_ident}"
                    for as_idents, from_ident in decons
                    for as_ident in as_idents
                ],
            )
            for decons, rel_path in self.imports.obj[into_path]
        ]


class GeneratorAcc:
    idents: IdentifiersAcc
    imports: ImportsAcc
    content: OrderedObj[List]
    group_of_path: OrderedObj[str]

    def __init__(self, ):
        self.idents = IdentifiersAcc()
        self.imports = ImportsAcc()
        self.content = OrderedObj()
        self.group_of_path = OrderedObj()

    def concat(self, other: "GeneratorAcc") -> "GeneratorAcc":
        return naive_object_concat(self, other)

    __add__ = concat

    def acc(self) -> Acc["GeneratorAcc"]:
        return Acc(self, GeneratorAcc())

    def render(self) -> OrderedObj[str]:
        return OrderedObj.from_iterable(
            OrderedObj({path: scripter.render(self.imports.render(path) + self.content.obj[path])})
            for path in self.group_of_path.keys()
        )


class GeneratorFolds:
    config: GeneratorConfig

    def __init__(self, config: GeneratorConfig):
        self.config = config

    def add_content(self, path: Path, content: Union[str, List[str]]) -> Tuple[None, GeneratorAcc]:
        update = GeneratorAcc()

        if isinstance(content, str):
            content = [content]

        update.content.update(path.path, content)
        return update

    def get_path_by_reference(
            self, state: GeneratorAcc, **lookup: Dict[str, Reference]
    ) -> Tuple[Path, GeneratorAcc]:
        group, ref = Disjoint(lookup.items()).get_or_fail("Expected dict with one key!")
        path = self.config.path_mappings[group](ref)
        return self.get_path(state, **{group: path})

    def get_path(self, state: GeneratorAcc, **lookup) -> Tuple[Path, GeneratorAcc]:
        group, path = Disjoint(lookup.items()).get_or_fail("Expected dict with one key!")

        # But don't create path twice if it is ok not to do so.

        if state.group_of_path.obj.get(path, group) != group:
            raise ValueError(
                f"Conflict: Both a {state.group_of_path.obj[path]} and a {group} file found for path {path}"
            )

        update = GeneratorAcc()
        update.group_of_path.set_default(path, group)
        return Path(path), update

    def import_ident(
            self,
            state: GeneratorAcc,
            from_path: ImportPath,
            into_path: Path,
            ident: str,
            as_ident: Optional[str] = None,
    ) -> Tuple[str, GeneratorAcc]:
        if as_ident is None:
            as_ident = ident

        if not state.idents.get_identifier_sources(from_path.path, ident):
            raise ValueError(
                f"identifier {ident} required by {into_path} does not exist in {from_path}"
            )

        imported_into = state.imports.get_imported_as_idents(into_path, from_path, ident)

        if imported_into:
            return sorted(imported_into)[0], GeneratorAcc()

        acc = state.acc()
        state, as_ident = acc(self.add_ident(state, into_path, as_ident, from_path))
        state, _ = acc(self.add_imported(into_path, from_path, ident, as_ident))

        return as_ident, acc.update

    def add_imported(
            self, into_path: Path, from_path: ImportPath, from_ident: str, as_ident: str
    ) -> Tuple[None, GeneratorAcc]:
        update = GeneratorAcc()
        update.imports.add_import(into_path, from_path, from_ident, as_ident)
        return None, update

    def add_ident(
            self, state: GeneratorAcc, into_path: Path, as_ident: str, source: ImportPath
    ) -> Tuple[str, GeneratorAcc]:
        as_ident = get_safe_ident(as_ident)

        while state.idents.get_identifier_sources(into_path, as_ident):
            as_ident += "_"

        update = GeneratorAcc()
        update.idents.get_identifier_sources(into_path, as_ident).add(source.path)
        return as_ident, update


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
    for contents, path in output:
        if contents:
            build_env.write_build_file(path, contents)

    return lambda output_dir: build_env.finalize(output_dir)
