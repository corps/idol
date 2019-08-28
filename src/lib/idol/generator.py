import operator
import idol.scripter as scripter

from typing import Dict, List, Union, Generic, TypeVar, Optional, Callable, Tuple

from .build_env import BuildEnv
from .utils import as_path, relative_path_from
from .functional import OrderedObj, Conflictable, flatten_to_list
from .schema import Module, Type

T = TypeVar("T")
R = TypeVar("R")
A = TypeVar("A")
B = TypeVar("B")
C = TypeVar("C")
T_con = TypeVar("T_con", contravariant=True)


class Codegen:
    pass


class Scaffold:
    pass


class Supplemental:
    pass


class Absolute:
    pass


class Keys:
    absolute = Absolute()
    supplemental = Supplemental()
    scaffold = Scaffold()
    codegen = Codegen()


OutputTypeSpecifier = Union[Codegen, Scaffold]


def output_type_specifier(
    k: Union[Codegen, Scaffold], v: A
) -> Callable[[OutputTypeSpecifier], Optional[A]]:
    return lambda x: v if x is k else None


OutputSpecifier = Union[Codegen, Scaffold, Supplemental]


def output_specifier(
    k: Union[Codegen, Scaffold, Supplemental], v: A
) -> Callable[[OutputSpecifier], Optional[A]]:
    return lambda x: v if x is k else None


DependencySpecifier = Union[Codegen, Scaffold, Supplemental, Absolute]


def dependency_specifier(
    k: Union[Codegen, Scaffold, Supplemental, Absolute], v: A
) -> Callable[[DependencySpecifier], Optional[A]]:
    return lambda x: v if x is k else None


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


class OutputTypeMapping(Generic[T]):
    codegen: T
    scaffold: T

    def __init__(self, codegen: T, scaffold: T):
        self.codegen = codegen
        self.scaffold = scaffold

    def join(self, concat: Callable[[T, T], T]) -> T:
        return concat(self.codegen, self.scaffold)

    def zip(self, other: "OutputTypeMapping[R]") -> "OutputTypeMapping[Tuple[T, R]]":
        return OutputTypeMapping((self.codegen, other.codegen), (self.scaffold, other.scaffold))

    @staticmethod
    def lift(val: T) -> "OutputTypeMapping[T]":
        return OutputTypeMapping(val, val)


class OutputMapping(Generic[T, R]):
    type_mapping: OutputTypeMapping[T]
    supplemental: R

    def __init__(self, type_mapping: OutputTypeMapping[T], supplemental: R):
        self.type_mapping = type_mapping
        self.supplemental = supplemental


class OutputTypeMapper(Generic[T, R]):
    scaffold: Callable[[T], R]
    codegen: Callable[[T], R]

    def __init__(self, codegen: Callable[[T], R], scaffold: [[T], R]):
        self.scaffold = scaffold
        self.codegen = codegen

    def composed(self, other: "OutputTypeMapper[R, A]") -> "OutputTypeMapper[T, A]":
        return OutputTypeMapper(
            lambda a: other.codegen(self.codegen(a)), lambda a: other.scaffold(self.scaffold(a))
        )

    @classmethod
    def from_one(cls, handler: Callable[[T], R]) -> "OutputTypeMapper[T, R]":
        return cls(handler, handler)

    @classmethod
    def lift(cls, mapping: "OutputTypeMapping[Callable[[T], R]]") -> "OutputTypeMapper[T, R]":
        return cls(mapping.codegen, mapping.scaffold)

    @property
    def for_mapping(self) -> Callable[[OutputTypeMapping[T]], OutputTypeMapping[R]]:
        def handler(t: OutputTypeMapping[T]) -> OutputTypeMapping[R]:
            return OutputTypeMapping(self.codegen(t.codegen), self.scaffold(t.scaffold))

        return handler

    @property
    def for_specifier(self) -> Callable[[Callable[[OutputTypeSpecifier], T]], R]:
        def handler(t: Callable[[OutputTypeSpecifier], T]) -> R:
            if t(Keys.scaffold) is not None:
                return self.scaffold(t(Keys.scaffold))
            elif t(Keys.codegen) is not None:
                return self.codegen(t(Keys.codegen))

        return handler


class OutputMapper(Generic[T, R]):
    output_type_mapper: OutputTypeMapper[T, R]
    supplemental_mapper: Callable[[T], R]

    def __init__(
        self, output_type_mapper: OutputTypeMapper[T, R], supplemental_mapper: Callable[[T], R]
    ):
        self.output_type_mapper = output_type_mapper
        self.supplemental_mapper = supplemental_mapper

    @property
    def for_specifier(self) -> Callable[[Callable[[OutputSpecifier], T]], R]:
        def handler(t: Callable[[OutputSpecifier], T]) -> R:
            if t(Keys.supplemental) is not None:
                return self.supplemental_mapper(t(Keys.supplemental))

            return self.output_type_mapper.for_specifier(t)

        return handler


OutputTypePathConfig = OrderedObj[Conflictable[str]]


class GeneratorConfig:
    codegen_root: str
    qualified_names_to_path: OutputTypeMapping[OrderedObj[str]]
    name: str
    params: GeneratorParams

    def __init__(self, params: GeneratorParams):
        self.params = params
        self.codegen_root = "codegen"
        self.name = "idol_py"
        self.qualified_names_to_path = OutputTypeMapping(OrderedObj(), OrderedObj())

    @staticmethod
    def one_file_per_type(t: Type) -> str:
        return as_path(t.named.qualified_name)

    @staticmethod
    def one_file_per_module(t: Type) -> str:
        return as_path(t.named.module_name)

    @staticmethod
    def flat_namespace(t: Type) -> str:
        return as_path(t.named.type_name)

    def vary_on_scaffold(
        self, without_scaffold: Callable[[Type], str], with_scaffold: Callable[[Type], str]
    ) -> Callable[[Type], str]:
        def vary(t: Type) -> str:
            if t.named.qualified_name in self.params.scaffold_types.obj:
                return with_scaffold(t)
            return without_scaffold(t)

        return vary

    def with_path_config(self, path_of_output_type: OutputTypeMapper[Type, str] = None):
        if path_of_output_type is None:
            path_of_output_type = OutputTypeMapper(
                GeneratorConfig.one_file_per_type,
                self.vary_on_scaffold(
                    GeneratorConfig.one_file_per_module, GeneratorConfig.one_file_per_type
                ),
            )

        # Append codegen to all codegen outputs.
        path_of_output_type = path_of_output_type.composed(
            OutputTypeMapper(lambda path: f"{self.codegen_root}/" + path, lambda path: path)
        )

        self.qualified_names_to_path = OutputTypeMapper.from_one(
            lambda path_of: self.params.all_types.map(lambda t: path_of(t[0]))
        ).for_mapping(path_of_output_type)

    def resolve_path(
        self, f: Callable[[OutputSpecifier], str], t: Callable[[DependencySpecifier], str]
    ) -> str:
        if t(Keys.absolute) is not None:
            return t(Keys.absolute)

        output_type_path_mapper = OutputTypeMapper.lift(
            OutputTypeMapper.from_one(lambda o: lambda qn: o.obj[qn]).for_mapping(
                self.qualified_names_to_path
            )
        )

        path_mapper = OutputMapper(output_type_path_mapper, lambda supplemental: supplemental)

        from_path = path_mapper.for_specifier(f)
        to_path = path_mapper.for_specifier(t)

        if from_path is None or to_path is None:
            raise ValueError(f"Could not find {t} -> {f} in resolve_path")

        # Special case: local import.
        if from_path == to_path:
            return ""

        return relative_path_from(from_path, to_path)


def import_line(names: set, module: str) -> str:
    return scripter.from_import(module, *sorted(names))


def imports_obj_as_code(imports: OrderedObj[set]) -> List[str]:
    return list(imports.map(import_line).values())


class TypedOutputBuilder:
    imports: OrderedObj[set]
    comment_header: str
    body: List[str]

    def __init__(
        self, body: List = [], imports: OrderedObj[set] = OrderedObj(), comment_header: str = ""
    ):
        self.imports = imports
        self.body = body
        self.comment_header = comment_header

    def __str__(self):
        imports = scripter.render(imports_obj_as_code(self.imports))
        comments = scripter.render(scripter.comment(self.comment_header))
        body = scripter.render(self.body)
        return scripter.render((comments, imports, body))

    def concat(self, other: "TypedOutputBuilder") -> "TypedOutputBuilder":
        return TypedOutputBuilder(
            self.body + other.body,
            self.imports + other.imports,
            other.comment_header if other.comment_header else self.comment_header,
        )

    __add__ = concat


TypedGeneratorOutput = OrderedObj[TypedOutputBuilder]
RenderedFilesOutput = OrderedObj[Conflictable[str]]


class SinglePassGeneratorOutput:
    codegen: TypedGeneratorOutput
    scaffold: TypedGeneratorOutput
    supplemental: RenderedFilesOutput

    def __init__(
        self,
        codegen: TypedGeneratorOutput,
        scaffold: TypedGeneratorOutput,
        supplemental: RenderedFilesOutput,
    ):
        self.codegen = codegen
        self.scaffold = scaffold
        self.supplemental = supplemental

    def concat(self, other: "SinglePassGeneratorOutput") -> "SinglePassGeneratorOutput":
        return SinglePassGeneratorOutput(
            self.codegen + other.codegen,
            self.scaffold + other.scaffold,
            self.supplemental + other.supplemental,
        )

    __add__ = concat

    def as_mapping(self) -> OutputMapping[TypedGeneratorOutput, RenderedFilesOutput]:
        return OutputMapping(OutputTypeMapping(self.codegen, self.scaffold), self.supplemental)


def render(config: GeneratorConfig, output: SinglePassGeneratorOutput) -> RenderedFilesOutput:
    def lookup_and_render(
        t: Tuple[RenderedFilesOutput, OrderedObj[str]]
    ) -> OrderedObj[Conflictable[str]]:
        files, path_config = t

        return files.zip_with_keys_from(path_config).map(
            lambda file: Conflictable([str(file)] if file else [])
        )

    type_outputs = output.as_mapping().type_mapping

    rendered_output_type_files = (
        OutputTypeMapper.from_one(lookup_and_render)
        .for_mapping(type_outputs.zip(config.qualified_names_to_path))
        .join(operator.add)
    )

    return rendered_output_type_files + output.supplemental


def build(config: GeneratorConfig, output: RenderedFilesOutput) -> Callable[[str], None]:
    all_errors = flatten_to_list(
        c.unwrap_conflicts(
            (lambda conflicts: f"Generated {len(conflicts)} separate outputs for path {path}.")
        )
        for c, path in output
    )

    if all_errors:
        raise Exception("\n".join(all_errors))

    build_env = BuildEnv(config.name, config.codegen_root)
    for file, path in output:
        contents = file.unwrap()
        if contents:
            build_env.write_build_file(path, contents)

    return lambda output_dir: build_env.finalize(output_dir)
