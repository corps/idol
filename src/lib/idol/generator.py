import functools
import operator
import idol.scripter as scripter
from enum import Enum
from abc import ABC, abstractmethod

from typing import Dict, List, Union, Generic, TypeVar, Callable, Tuple, Any, cast, Iterable

from .build_env import BuildEnv
from .functional import OrderedObj, Alt, mset, Disjoint, naive_object_concat
from .schema import Module, Type, Reference, PrimitiveType, TypeStruct, StructKind, Field

A = TypeVar("A")
B = TypeVar("B")
C = TypeVar("C")
D = TypeVar("D")


class Identifier(ABC):
    @property
    @abstractmethod
    def as_name(self) -> str:
        pass


Ident = TypeVar("Ident", bound=Identifier)


class Path:
    path: str

    def __init__(self, path: str):
        self.path = path

    @property
    def is_local(self):
        return self.path == ""

    @staticmethod
    def is_path_local(path: "Path") -> bool:
        return path.is_local

    def __eq__(self, other):
        return self.path == other.path

    def relative_path_to(self, to_path: "Path") -> "Path":
        # Special case for relative path to self => is_local
        if self == to_path:
            return Path("")

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

        return Path("/".join(parts))

    @property
    def as_python_module_path(self):
        if self.is_local:
            raise ValueError("is_local path cannot be a python module path!")

        if self.path.endswith(".py"):
            return "." + self.path[:-3].replace("../", ".").replace("/", ".")
        return self.path


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


class OutputTypeKind(Enum):
    CODEGEN = "codegen"
    SCAFFOLD = "scaffold"


class OutputKind(OutputTypeKind):
    SUPPLEMENTAL = "supplemental"


class OutputTypeMapping(Generic[A]):
    codegen: A
    scaffold: A

    def __init__(self, codegen: A, scaffold: A):
        self.codegen = codegen
        self.scaffold = scaffold

    @classmethod
    def lift(cls, a: A) -> "OutputTypeMapping[A]":
        return OutputTypeMapping(a, a)

    def zip(self, other: "OutputTypeMapping[B]") -> "OutputTypeMapping[Tuple[A, B]]":
        return OutputTypeMapping((self.codegen, other.codegen), (self.scaffold, other.scaffold))

    def join(self) -> A:
        return self.codegen + self.scaffold

    def apply_from(self, f: "OutputTypeMapping[Callable[[A], B]]") -> "OutputTypeMapping[B]":
        return OutputTypeMapping(f.codegen(self.codegen), f.scaffold(self.scaffold))

    def pick(self, output_type_kind: OutputTypeKind) -> A:
        if output_type_kind == OutputTypeKind.CODEGEN:
            return self.codegen

        if output_type_kind == OutputTypeKind.SCAFFOLD:
            return self.scaffold

        raise ValueError(f"Unexpected OutputTypeKind {output_type_kind}")

    def concat(self, other: "OutputTypeMapping[A]") -> "OutputTypeMapping[A]":
        return naive_object_concat(self, other)

    __add__ = concat


class OutputMapping(Generic[A, B]):
    type_mapping: OutputTypeMapping[A]
    supplemental: B

    def __init__(self, type_mapping: OutputTypeMapping[A], supplemental: B):
        self.type_mapping = type_mapping
        self.supplemental = supplemental

    def pick(self, output_kind: OutputKind) -> Union[A, B]:
        if output_kind == OutputKind.SUPPLEMENTAL:
            return self.supplemental

        return self.type_mapping.pick(output_kind)

    def apply_types_from(self, f: OutputTypeMapping[Callable[[A], C]]) -> "OutputMapping[C, B]":
        return OutputMapping(
            self.type_mapping.apply_from(f),
            self.supplemental
        )

    def apply_from(self,
                   f: "OutputMapping[Callable[[A], C], Callable[[B], D]]") -> "OutputMapping[C, D]":
        return OutputMapping(
            self.type_mapping.apply_from(f.type_mapping),
            f.supplemental(self.supplemental)
        )

    @staticmethod
    def lift(a: A) -> "OutputMapping[A, A]":
        return OutputMapping(OutputTypeMapping.lift(a), a)

    def concat(self, other: "OutputMapping[A, B]") -> "OutputMapping[A, B]":
        return naive_object_concat(self, other)

    __add__ = concat


class Tags:
    field_tags: List[str]
    type_tags: List[str]

    def __init__(self, field_tags=[], type_tags=[]):
        self.field_tags = field_tags
        self.type_tags = type_tags


class Deconstructor:
    @staticmethod
    def otherwise(*args, v: A) -> List[Callable[[], A]]:
        return [lambda: v]


class ScalarDeconstructor:
    type_struct: TypeStruct

    def __init__(self, type_struct: TypeStruct):
        self.type_struct = type_struct
        pass

    def when_primitive(self, cb: Callable[[PrimitiveType], A]) -> List[Callable[[], A]]:
        if self.type_struct.is_alias or self.type_struct.is_literal:
            return []

        @functools.wraps(cb)
        def inner() -> A:
            return cast(A, cb(self.type_struct.primitive_type))

        return cast(List[Callable[[], A]], [inner])

    def when_literal(self, cb: Callable[[PrimitiveType, Any], A]) -> List[Callable[[], A]]:
        if self.type_struct.is_alias or self.type_struct.is_literal:
            return []

        @functools.wraps(cb)
        def inner() -> A:
            return cast(A, cb(self.type_struct.primitive_type, self.type_struct.literal_value))

        return cast(List[Callable[[], A]], [inner])

    def when_alias(self, cb: Callable[[Reference], A]) -> List[Callable[[], A]]:
        if not self.type_struct.is_alias:
            return []

        @functools.wraps(cb)
        def inner() -> A:
            return cast(A, cb(self.type_struct.reference))

        return cast(List[Callable[[], A]], [inner])


class TypeStructDeconstructor:
    type_struct: TypeStruct

    def __init__(self, type_struct: TypeStruct):
        self.type_struct = type_struct

    def when_scalar(self, cb: Callable[[ScalarDeconstructor], A]) -> List[Callable[[], A]]:
        if self.type_struct.struct_kind != StructKind.SCALAR:
            return []

        @functools.wraps(cb)
        def inner() -> A:
            return cast(A, cb(ScalarDeconstructor(self.type_struct)))

        return cast(List[Callable[[], A]], [inner])

    def when_repeated(self, cb: Callable[[ScalarDeconstructor], A]) -> List[Callable[[], A]]:
        if self.type_struct.struct_kind != StructKind.REPEATED:
            return []

        @functools.wraps(cb)
        def inner() -> A:
            return cast(A, cb(ScalarDeconstructor(self.type_struct)))

        return cast(List[Callable[[], A]], [inner])

    def when_map(self, cb: Callable[[ScalarDeconstructor], A]) -> List[Callable[[], A]]:
        if self.type_struct.struct_kind != StructKind.MAP:
            return []

        @functools.wraps(cb)
        def inner() -> A:
            return cast(A, cb(ScalarDeconstructor(self.type_struct)))

        return cast(List[Callable[[], A]], [inner])


class TypeDeconstructor:
    t: Type

    def __init__(self, t: Type):
        self.t = t

    def when_type_struct(self, cb: Callable[[TypeStructDeconstructor], A]) -> List[Callable[[], A]]:
        if not self.t.is_a:
            return []

        @functools.wraps(cb)
        def inner() -> A:
            return cast(A, cb(TypeStructDeconstructor(self.t.is_a)))

        return cast(List[Callable[[], A]], [inner])

    def when_enum(self, cb: Callable[[List[str]], A]) -> List[Callable[[], A]]:
        if self.t.is_a or not self.t.is_enum:
            return []

        @functools.wraps(cb)
        def inner() -> A:
            return cast(A, cb(self.t.options))

        return cast(List[Callable[[], A]], [inner])

    def when_struct(self, cb: Callable[[OrderedObj[Field]], A]) -> List[Callable[[], A]]:
        if self.t.is_a or not self.t.is_enum:
            return []

        @functools.wraps(cb)
        def inner() -> A:
            return cast(A, cb(OrderedObj(dict(self.t.fields.items()))))

        return cast(List[Callable[[], A]], [inner])


def get_material_type_deconstructor(all_types: OrderedObj[Type], t: Type) -> TypeDeconstructor:
    def search_type(type_decon: TypeDeconstructor) -> TypeDeconstructor:
        def search_type_struct(ts_decon: TypeStructDeconstructor) -> Alt[TypeDeconstructor]:
            def search_scalar(scalar_decon: ScalarDeconstructor) -> Alt[TypeDeconstructor]:
                def lookup_alias(r: Reference) -> TypeDeconstructor:
                    return search_type(
                        TypeDeconstructor(all_types.obj[r.qualified_name]))

                return Alt.mapply(scalar_decon.when_alias(lookup_alias))

            return Alt.unfold(ts_decon.when_scalar(search_scalar))

        return Alt.unfold(type_decon.when_type_struct(search_type_struct)).get_or(type_decon)

    return search_type(TypeDeconstructor(t))


class GeneratorConfig:
    codegen_root: str
    qualified_names_to_path: OutputTypeMapping[OrderedObj[Path]]
    name: str
    params: GeneratorParams

    def __init__(self, params: GeneratorParams):
        self.params = params
        self.codegen_root = "codegen"
        self.name = "idol_py"
        self.qualified_names_to_path = OutputTypeMapping(OrderedObj(), OrderedObj())

    @staticmethod
    def one_file_per_type(t: Type) -> str:
        return t.named.as_qn_path

    @staticmethod
    def one_file_per_module(t: Type) -> str:
        return t.named.as_module_path

    @staticmethod
    def flat_namespace(t: Type) -> str:
        return t.named.as_type_path

    def vary_by_scaffold_inclusion(
            self, without_scaffold: Callable[[Type], str], with_scaffold: Callable[[Type], str]
    ) -> Callable[[Type], str]:
        def vary(t: Type) -> str:
            if t.named.qualified_name in self.params.scaffold_types.obj:
                return with_scaffold(t)
            return without_scaffold(t)

        return vary

    def with_path_config(self,
                         path_of_output_type: OutputTypeMapping[Callable[[Type], str]] = None):
        if path_of_output_type is None:
            path_of_output_type = OutputTypeMapping.lift(GeneratorConfig.one_file_per_type)

        # Append codegen_root to all codegen outputs paths and map the path for all names
        wrap_path_of_output: OutputTypeMapping[Callable[[OrderedObj[Type]], OrderedObj[Path]]] = \
            path_of_output_type.apply_from(OutputTypeMapping(
                codegen=lambda f: lambda o: o.map(lambda t: Path(f"{self.codegen_root}/{f(t)}")),
                scaffold=lambda f: lambda o: o.map(lambda t: Path(f(t))),
            ))

        self.qualified_names_to_path = OutputTypeMapping.lift(self.params.all_types).apply_from(
            wrap_path_of_output)


class OutputContext:
    kind: OutputKind
    path: Path
    config: GeneratorConfig

    def __init__(self,
                 config: GeneratorConfig,
                 kind: OutputKind,
                 path_or_qn: str):
        self.kind = kind

        if kind == OutputKind.CODEGEN:
            self.path = config.qualified_names_to_path.codegen.obj[path_or_qn]

        if kind == OutputKind.SCAFFOLD:
            self.path = config.qualified_names_to_path.scaffold.obj[path_or_qn]

        if kind == OutputKind.SUPPLEMENTAL:
            self.path = Path(path_or_qn)

        self.config = config


class ImportProvider:
    context: OutputContext

    def __init__(self, context: OutputContext):
        self.context = context

    @property
    def path(self) -> Path:
        return self.context.path

    def import_from_abs(
            self, abs: Path, ident: str, as_ident: str
    ) -> OrderedObj[mset]:
        as_import = ident
        if ident != as_ident:
            as_import = f"{ident} as {as_ident}"

        return OrderedObj({abs.path: mset([as_import])})

    def import_from_path(
            self, path: Path, ident: str, as_ident: str
    ) -> OrderedObj[mset]:
        return self.import_from_abs(self.path.relative_path_to(path), ident, as_ident)

    def import_from_codegen(
            self, reference: Reference, output_type_kind: OutputTypeKind, ident: str, as_ident: str,
    ) -> OrderedObj[mset]:
        return self.import_from_path(
            self.context.config.qualified_names_to_path.pick(output_type_kind).obj[
                reference.qualified_name],
            ident, as_ident)


class OutputTypeBuilder:
    imports: OrderedObj[mset]
    body: List

    def __init__(
            self,
            body: List = [],
            imports: OrderedObj[mset] = OrderedObj()
    ):
        self.imports = imports
        self.body = body

    def __str__(self):
        imports = scripter.render(OutputTypeBuilder.imports_obj_as_code(self.imports))
        body = scripter.render(self.body)
        return scripter.render((imports, body))

    def concat(self, other: "OutputTypeBuilder") -> "OutputTypeBuilder":
        return OutputTypeBuilder(
            self.body + other.body,
            self.imports + other.imports,
        )

    __add__ = concat

    @staticmethod
    def import_line(names: mset, path: str) -> str:
        return scripter.from_import(Path(path).as_python_module_path, *sorted(names))

    @staticmethod
    def imports_obj_as_code(imports: OrderedObj[mset]) -> List[str]:
        return list(imports.filter(Path.is_path_local).map(OutputTypeBuilder.import_line).values())


def render(config: GeneratorConfig,
           output: OutputMapping[OrderedObj[Iterable], OrderedObj[Iterable]]) -> OrderedObj[
    Disjoint[str]]:
    def resolve_paths(
            t: Tuple[OrderedObj[Iterable], OrderedObj[Path]]
    ) -> OrderedObj[Iterable]:
        files, path_config = t
        return OrderedObj.from_iterable(
            OrderedObj({path_config.obj[k].path: files.obj[k]})
            for k in files.keys()
        )

    def render_script(
            o: OrderedObj[Iterable]
    ) -> OrderedObj[Disjoint[str]]:
        return o.map(lambda i: Disjoint([scripter.render(i)]))

    normalized_paths_output: OutputMapping[
        OrderedObj[Iterable], OrderedObj[Iterable]] = OutputMapping(
        output.type_mapping.zip(config.qualified_names_to_path) \
            .apply_from(OutputTypeMapping.lift(resolve_paths)),
        output.supplemental
    )

    rendered = normalized_paths_output.apply_from(
        OutputMapping.lift(render_script))
   
    return rendered.type_mapping.join() + rendered.supplemental


def build(config: GeneratorConfig, output: OrderedObj[Disjoint[str]]) -> Callable[[str], None]:
    all_errors = [
        f"Generated {len(conflicts)} separate outputs for path {path}."
        for c, path in output
        for conflicts in c.unwrap_errors()
    ]

    if all_errors:
        raise Exception("\n".join(all_errors))

    build_env = BuildEnv(config.name, config.codegen_root)
    for file, path in output:
        contents = file.get_or("")
        if contents:
            build_env.write_build_file(path, contents)

    return lambda output_dir: build_env.finalize(output_dir)
