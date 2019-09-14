import idol.scripter as scripter
from typing import Dict, List, Union, TypeVar, Callable, Tuple, Any, Optional
from .build_env import BuildEnv
from .functional import OrderedObj, Alt, StringSet, Disjoint, naive_object_concat, Conjunct
from .schema import Module, Type, Reference, PrimitiveType, TypeStruct, StructKind

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

    @property
    def is_module(self):
        return self.path.is_module

    @staticmethod
    def as_python_module_path(rel_path: str) -> str:
        if rel_path == "":
            raise ValueError("is_local path cannot be a python module path!")

        if rel_path.endswith(".py"):
            return "." + rel_path[:-3].replace("../", ".").replace("/", ".")

        return rel_path


class Exported:
    path: Path
    ident: str

    def __init__(self, path: Path, ident: str):
        self.ident = ident
        self.path = path


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


class TypeStructContext:
    field_tags: List[str]
    type_tags: List[str]
    is_type_bound: bool

    @property
    def is_declarable(self):
        return self.is_type_bound

    def __init__(
            self, field_tags: Optional[List[str]] = None, type_tags: Optional[List[str]] = None
    ):
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
            TypeStructDeconstructor(self.t.is_a, TypeStructContext(type_tags=self.t.tags))
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
                    k: TypeStructDeconstructor(v.type_struct, TypeStructContext(field_tags=v.tags))
                    for k, v in self.t.fields.items()
                }
            )
        )


def import_expr(exported: Exported, as_ident: str = None) -> "Expression":
    def inner(state: GeneratorAcc, path: Path) -> str:
        return state.import_ident(path, exported, as_ident)

    return inner


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

    def add_identifier(self, into_path: Path, ident: str, source: str = None) -> str:
        if source is None:
            source = into_path.path
        self.idents += OrderedObj({into_path.path: OrderedObj({ident: StringSet([source])})})
        return ident

    def get_identifier_sources(self, path: Path, ident: str) -> Alt[StringSet]:
        return Alt(
            idents
            for path_idents in self.idents.get(path.path)
            for idents in path_idents.get(ident)
        )

    def unwrap_conflicts(self) -> Disjoint[Tuple[str, str, StringSet]]:
        return Disjoint(
            (path, ident, sources) for path, mod in self.idents for ident, sources in mod
        )


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
            for from_idents in imported_from.get(from_path.path.path)
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
            ]
            for imports in self.imports.get(into_path)
        ).get_or([])


class GeneratorAcc:
    idents: IdentifiersAcc
    imports: ImportsAcc
    content: OrderedObj[List]
    group_of_path: OrderedObj[StringSet]
    uniq: int

    def __init__(self, ):
        self.idents = IdentifiersAcc()
        self.imports = ImportsAcc()
        self.content = OrderedObj()
        self.group_of_path = OrderedObj()
        self.uniq = 0

    def concat(self, other: "GeneratorAcc") -> "GeneratorAcc":
        return naive_object_concat(self, other)

    __add__ = concat

    def validate(self) -> "GeneratorAcc":
        for path_errors in Conjunct(
                f"Conflict in paths: Multiple ({' '.join(conflicts)}) types of {path} found"
                for path_groups, path in self.group_of_path
                for conflicts in Disjoint(path_groups).unwrap_errors()
        ):
            raise ValueError("\n".join(path_errors))

        for conflicts in self.idents.unwrap_conflicts().unwrap_errors():
            raise ValueError(
                "Found conflicting identifiers:\n"
                + "  \n".join(
                    f"ident {ident} was defined or imported into {path} by {len(sources)} different sources"
                    for path, ident, sources in conflicts
                )
            )

        return self

    def render(self, comment_headers=Dict[str, List]) -> OrderedObj[str]:
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
        )

    def add_content(self, path: Path, content: Union[str, List[str]]):
        if isinstance(content, str):
            content = [content]

        self.content += OrderedObj({path.path: content})

    def reserve_path(self, **lookup) -> Path:
        group, path = Disjoint(lookup.items()).get_or_fail("reserve_path requires one kwd!")
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

        from_path = into_path.import_path_to(exported.path)

        if not from_path.is_module and not self.idents.get_identifier_sources(
                from_path.path, ident
        ):
            raise ValueError(
                f"identifier {ident} required by {into_path} does not exist in {from_path}"
            )

        imported_as = self.imports.get_imported_as_idents(into_path, from_path, ident)

        if imported_as:
            return sorted(imported_as.unwrap())[0]

        as_ident = self.create_ident(into_path, as_ident, from_path)
        self.imports.add_import(into_path, from_path, ident, as_ident)

        return as_ident

    def create_ident(self, into_path: Path, as_ident: str, source: ImportPath = None) -> str:
        if source is None:
            source = into_path.import_path_to(into_path)

        as_ident = get_safe_ident(as_ident)

        while source not in self.idents.get_identifier_sources(into_path, as_ident).get_or(
                StringSet([source or ""])
        ):
            as_ident += "_"

        self.idents.add_identifier(into_path, as_ident, source.path.path)
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


class GeneratorFileContext:
    path: Path
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
