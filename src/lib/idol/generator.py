import operator

from typing import Dict, List, Union, Generic, TypeVar, Type as TypingType, Optional, Callable, \
    Tuple

from .utils import as_path, relative_path_from
from .functional import OrderedObj, Conflictable
from .schema import Module, Type

T = TypeVar("T")
R = TypeVar("R")
A = TypeVar("A")
B = TypeVar("B")
C = TypeVar("C")

from collections import namedtuple


class GeneratorParams:
    def __init__(self, all_modules: OrderedObj[Module], all_types: OrderedObj[Type],
                 scaffold_types: OrderedObj[Type], output_dir: str,
                 options: Dict[str, Union[List[str], bool]]):
        self.all_modules = all_modules
        self.all_types = all_types
        self.scaffold_types = scaffold_types
        self.output_dir = output_dir
        self.options = options


class NamedUnion(Generic[T]):
    keys: List[str] = []
    value: Dict[str, Optional[T]]

    def __init__(self, key: str, value: T):
        self.value = {k: None for k in self.keys}
        assert key in self.value
        self.value[key] = value


class OutputTypeSpecifier(NamedUnion):
    keys = ['codegen', 'scaffold']

    @classmethod
    def for_codegen(cls, value: T) -> 'OutputTypeSpecifier[T]':
        return cls("codegen", value)

    @classmethod
    def for_scaffold(cls, value: T) -> 'OutputTypeSpecifier[T]':
        return cls("scaffold", value)

    @property
    def codegen(self) -> Optional[T]:
        return self.value['codegen']

    @property
    def scaffold(self) -> Optional[T]:
        return self.value['scaffold']


class OutputSpecifier(OutputTypeSpecifier[T]):
    keys = OutputTypeSpecifier.keys + ['supplemental']

    @classmethod
    def for_supplemental(cls, value: T) -> 'OutputSpecifier[T]':
        return cls("supplemental", value)

    @property
    def supplemental(self) -> Optional[T]:
        return self.value['supplemental']


class DependencySpecifier(OutputSpecifier[T]):
    keys = OutputSpecifier.keys + ['absolute']

    @classmethod
    def for_absolute(cls, value: T) -> 'DependencySpecifier[T]':
        return cls("absolute", value)

    @property
    def absolute(self) -> Optional[T]:
        return self.value['absolute']


class OutputTypeMapping(Generic[T]):
    codegen: T
    scaffold: T

    def __init__(self, codegen: T, scaffold: T):
        self.codegen = codegen
        self.scaffold = scaffold

    def join(self, concat: Callable[[T, T], T]) -> T:
        return concat(self.codegen, self.scaffold)

    def zip(self, other: 'OutputTypeMapping[R]') -> 'OutputTypeMapping[Tuple[T, R]]':
        return OutputTypeMapping((self.codegen, other.codegen), (self.scaffold, other.scaffold))

    @staticmethod
    def lift(val: T) -> 'OutputTypeMapping[T]':
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

    def composed(self, other: 'OutputTypeMapper[R, A]') -> 'OutputTypeMapper[T, A]':
        return OutputTypeMapper(lambda a: other.codegen(self.codegen(a)),
                                lambda a: other.scaffold(self.scaffold(a)))

    @classmethod
    def from_one(cls, handler: Callable[[T], R]) -> 'OutputTypeMapper[T, R]':
        return cls(handler, handler)

    @classmethod
    def lift(cls, mapping: 'OutputTypeMapping[Callable[[T], R]]') -> 'OutputTypeMapper[T, R]':
        return cls(mapping.codegen, mapping.scaffold)

    @property
    def for_mapping(self) -> Callable[[OutputTypeMapping[T]], OutputTypeMapping[R]]:
        def handler(t: OutputTypeMapping[T]) -> OutputTypeMapping[R]:
            return OutputTypeMapping(self.codegen(t.codegen), self.scaffold(t.scaffold))

        return handler

    @property
    def for_specifier(self) -> Callable[[OutputTypeSpecifier[T]], R]:
        def handler(t: OutputTypeSpecifier[T]) -> R:
            if t.scaffold is not None:
                return self.scaffold(t.scaffold)
            elif t.codegen is not None:
                return self.codegen(t.codegen)

            raise ValueError("OutputTypeSpecifier has unexpected value " + str(t.value))

        return handler


class OutputMapper(Generic[T, R]):
    output_type_mapper: OutputTypeMapper[T, R]
    supplemental_mapper: Callable[[T], R]

    def __init__(self, output_type_mapper: OutputTypeMapper[T, R],
                 supplemental_mapper: Callable[[T], R]):
        self.output_type_mapper = output_type_mapper
        self.supplemental_mapper = supplemental_mapper

    @property
    def for_specifier(self) -> Callable[[OutputSpecifier[T]], R]:
        def handler(t: OutputSpecifier[T]) -> R:
            if t.supplemental is not None:
                return self.supplemental_mapper(t.supplemental)

            return self.output_type_mapper.for_specifier(t)

        return handler


OutputTypePathConfig = OrderedObj[Conflictable[str]]


class GeneratorConfig:
    codegen_root: str
    qualified_names_to_path: OutputTypeMapping[OutputTypePathConfig]
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

    def vary_on_scaffold(self, without_scaffold: Callable[[Type], str],
                         with_scaffold: Callable[[Type], str]) -> Callable[[Type], str]:
        def vary(t: Type) -> str:
            if t.named.qualified_name in self.params.scaffold_types.obj:
                return with_scaffold(t)
            return without_scaffold(t)

        return vary

    def with_path_config(self,
                         path_of_output_type: OutputTypeMapper[Type, str] = None):
        if path_of_output_type is None:
            path_of_output_type = OutputTypeMapper(GeneratorConfig.one_file_per_type,
                                                   self.vary_on_scaffold(
                                                       GeneratorConfig.one_file_per_module,
                                                       GeneratorConfig.one_file_per_type))

        # Append codegen to all codegen outputs.
        path_of_output_type = path_of_output_type.composed(
            OutputTypeMapper(lambda path: f"{self.codegen_root}/" + path, lambda path: path))

        self.qualified_names_to_path = OutputTypeMapper.from_one(
            lambda path_of: self.params.all_types.map(lambda t: Conflictable([path_of(t[0])]))) \
            .for_mapping(path_of_output_type)

    def resolve_path(self, f: OutputSpecifier[str], t: DependencySpecifier[str]) -> str:
        if t.absolute is not None:
            return t.absolute

        output_type_path_mapper = OutputTypeMapper.lift(
            OutputTypeMapper.from_one(lambda o: lambda qn: o.obj[qn]).for_mapping(
                self.qualified_names_to_path))

        mapper = OutputMapper(output_type_path_mapper, lambda supplemental: supplemental)

        from_path = mapper.for_specifier(f)
        to_path = mapper.for_specifier(t)

        if from_path is None or to_path is None:
            raise ValueError(f"Could not find {t} -> {f} in resolve_path")

        # Special case: local import.
        if from_path == to_path:
            return ""

        return relative_path_from(from_path, to_path)


class TypedOutputBuilder:
    imports: OrderedObj[set]
    comment_header: str
    body: List[str]

    def __init__(self, body: List[str] = [], imports: OrderedObj[set] = OrderedObj(),
                 comment_header: str = ""):
        self.imports = imports
        self.body = body
        self.comment_header = comment_header

    def __str__(self):
        pass

    def concat(self, other: 'TypedOutputBuilder') -> 'TypedOutputBuilder':
        return TypedOutputBuilder(self.body + other.body, self.imports + other.imports,
                                  other.comment_header if other.comment_header else self.comment_header)

    __add__ = concat


TypedGeneratorOutput = OrderedObj[TypedOutputBuilder]
RenderedFilesOutput = OrderedObj[Conflictable[str]]


class SinglePassGeneratorOutput:
    codegen: TypedGeneratorOutput
    scaffold: TypedGeneratorOutput
    supplemental: RenderedFilesOutput

    def __init__(self, codegen: TypedGeneratorOutput, scaffold: TypedGeneratorOutput,
                 supplemental: RenderedFilesOutput):
        self.codegen = codegen
        self.scaffold = scaffold
        self.supplemental = supplemental

    def concat(self, other: 'SinglePassGeneratorOutput') -> 'SinglePassGeneratorOutput':
        return SinglePassGeneratorOutput(self.codegen + other.codegen,
                                         self.scaffold + other.scaffold,
                                         self.supplemental + other.supplemental)

    __add__ = concat

    def as_mapping(self) -> OutputMapping[TypedGeneratorOutput, RenderedFilesOutput]:
        return OutputMapping(OutputTypeMapping(self.codegen, self.scaffold), self.supplemental)


def render(config: GeneratorConfig, output: SinglePassGeneratorOutput) -> RenderedFilesOutput:
    def lookup_and_render(output: RenderedFilesOutput,
                          path_config: OutputTypePathConfig):
        pass
