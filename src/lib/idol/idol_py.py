#! /usr/bin/env python3

from typing import List, Callable, Tuple, Iterable, Dict, Any

from idol import scripter
from idol.cli import start, CliConfig
from idol.functional import OrderedObj, flatten_to_ordered_obj, Conflictable
from idol.generator import (
    GeneratorParams,
    GeneratorConfig as BaseGeneratorConfig,
    OutputTypeSpecifier,
    dependency_specifier,
    Keys,
    output_type_specifier,
    TypeHandler,
    TypeStructHandler,
    ScalarHandler,
    Tags,
    TypedOutputBuilder,
    MaterialTypeHandler, SinglePassGeneratorOutput, render, build)
from idol.schema import *
from idol.utils import as_qualified_ident
import os.path


class GeneratorConfig(BaseGeneratorConfig):
    idol_py_path: str

    def __init__(self, params: GeneratorParams):
        super(GeneratorConfig, self).__init__(params)
        self.idol_py_path = self.codegen_root + "/__idol__.py"

    def idol_py_imports(
            self, module: Callable[[OutputTypeSpecifier], str], *imports
    ) -> OrderedObj[set]:
        path = self.resolve_path(module, dependency_specifier(Keys.supplemental, self.idol_py_path))
        return OrderedObj({path: set(f"{i} as {i}_" for i in imports)})

    def codegen_reference_import(
            self, module: Callable[[OutputTypeSpecifier], str], reference: Reference
    ) -> OrderedObj[set]:
        path = self.resolve_path(
            module, output_type_specifier(Keys.codegen, reference.qualified_name)
        )
        return OrderedObj({path: {as_qualified_ident(reference)}})

    def scaffold_reference_import(
            self, module: Callable[[OutputTypeSpecifier], str], reference: Reference
    ) -> OrderedObj[set]:
        path = self.resolve_path(
            module, output_type_specifier(Keys.scaffold, reference.qualified_name)
        )
        qualified_name = as_qualified_ident(reference)
        return OrderedObj({path: {f"{reference.type_name} as {qualified_name}"}})

    def scalar_import_handler(
            self, module: Callable[[OutputTypeSpecifier], str]
    ) -> ScalarHandler[OrderedObj[set]]:
        new_class = OrderedObj({"types": {"new_class"}})
        return ScalarHandler(
            literal=lambda *args: self.idol_py_imports(module, "Literal") + new_class,
            primitive=lambda primitive_type, tags: self.idol_py_imports(
                module, "Any" if primitive_type == PrimitiveType.ANY else "Primitive"
            )
                                                   + new_class,
            alias=lambda reference, tags: self.codegen_reference_import(module, reference),
        )

    def type_struct_import_handler(
            self, module: Callable[[OutputTypeSpecifier], str]
    ) -> TypeStructHandler[OrderedObj[set]]:
        return TypeStructHandler(
            scalar=lambda type_struct, tags: self.scalar_import_handler(module).map_type_struct(
                type_struct, tags
            ),
            repeated=lambda scalar_imports, tags: scalar_imports
                                                  + self.idol_py_imports(module, "List"),
            map=lambda scalar_imports, tags: scalar_imports + self.idol_py_imports(module, "Map"),
        )

    def field_type_struct_import_handler(
            self, module: Callable[[OutputTypeSpecifier], str]
    ) -> TypeStructHandler[OrderedObj[set]]:
        scalar_handler = self.scalar_import_handler(module)
        type_struct_handler = self.type_struct_import_handler(module)

        scalar_handler = ScalarHandler(
            alias=scalar_handler.alias,
            literal=lambda *args: OrderedObj(),
            primitive=lambda *args: OrderedObj(),
        )

        return TypeStructHandler(
            scalar=lambda type_struct, tags: scalar_handler.map_type_struct(type_struct, tags),
            repeated=type_struct_handler.repeated,
            map=type_struct_handler.map,
        )

    def type_import_handler(
            self, module: Callable[[OutputTypeSpecifier], str]
    ) -> TypeHandler[OrderedObj[set], OrderedObj[set]]:
        type_handler = self.type_struct_import_handler(module)
        field_handler = self.field_type_struct_import_handler(module)
        return TypeHandler(
            type_struct=lambda type, type_struct, tags: type_handler.map_type_struct(
                type_struct, tags
            ),
            enum=lambda type, options: self.idol_py_imports(module, "Enum"),
            field=lambda type_struct, tags: field_handler.map_type_struct(type_struct, tags),
            struct=lambda type, fields: flatten_to_ordered_obj(fields.values())
                                        + self.idol_py_imports(module, "Struct"),
        )


class ScalarTypingHandler(ScalarHandler):
    def literal(self, primitive_type: PrimitiveType, value, tags: Tags = Tags()) -> str:
        return self.primitive(primitive_type, tags)

    def primitive(self, primitive_type: PrimitiveType, tags: Tags = Tags()) -> str:
        return self.scalar_name_mappings[primitive_type]

    def alias(self, alias: Reference, tags: Tags = Tags()) -> str:
        return as_qualified_ident(alias)

    scalar_name_mappings = {
        PrimitiveType.BOOL: "bool",
        PrimitiveType.INT: "int",
        PrimitiveType.STRING: "str",
        PrimitiveType.DOUBLE: "float",
        PrimitiveType.ANY: "Any_",
    }


class ScalarSubclassingTypeHandler(TypeHandler):
    scalar_typing_handler: ScalarHandler[str]

    def __init__(self, scalar_typing_handler: ScalarHandler[str] = ScalarTypingHandler()):
        super(ScalarSubclassingTypeHandler, self).__init__()
        self.scalar_typing_handler = scalar_typing_handler

    def type_struct(
            self, t: Type, type_struct: TypeStruct, tags: Tags = Tags()
    ) -> List:
        scalar_handler: ScalarHandler[List] = ScalarHandler(
            alias=lambda reference, tags: [],
            primitive=lambda prim_type, tags: (
                self.as_new_class(t.named, ["Primitive_"])
            ),
            literal=lambda prim_type, value, tags: (
                self.as_new_class(t.named, ["Literal_"], value=scripter.literal(value))
            ),
        )

        typing = self.scalar_typing_handler.map_type_struct(type_struct, tags)

        return TypeStructHandler(
            scalar=lambda *args: scalar_handler.map_type_struct(*args),
            map=lambda *args: self.as_new_class(t.named, [], inner_class=typing),
            repeated=lambda *args: self.as_new_class(t.named, [], inner_class=typing),
        ).map_type_struct(type_struct, tags)

    def noop(self, *args) -> List:
        return []

    enum = noop
    field = noop
    struct = noop

    def as_new_class(
            self, reference: Reference, base_class: Iterable[str], **class_dict
    ) -> List:
        ref_ident = as_qualified_ident(reference)
        ref_local = scripter.index_access(
            scripter.invocation("locals"), scripter.literal(ref_ident)
        )

        return [scripter.assignment(
            ref_local,
            scripter.invocation(
                "new_class",
                scripter.literal(ref_ident),
                scripter.tuple(ref_local, *base_class),
                **class_dict,
            ),
        )]


class TypeStructTypingHandler(TypeStructHandler):
    scalar_dec_handler: ScalarHandler[List[str]]
    scalar_handler: ScalarHandler[str]

    def __init__(self, scalar_handler: ScalarHandler[str] = ScalarTypingHandler()):
        self.scalar_handler = scalar_handler
        super(TypeStructTypingHandler, self).__init__()

    def scalar(self, type_struct: TypeStruct, tags: Tags = Tags()) -> str:
        return self.scalar_handler.map_type_struct(type_struct, tags)

    def repeated(self, scalar: str, tags: Tags = Tags()) -> str:
        return scripter.type_parameterized("List_", scalar)

    def map(self, scalar: Tuple[List[str], str], tags: Tags = Tags()) -> str:
        return scripter.type_parameterized("Map_", scalar)


class TypeDeclarationHandler(TypeHandler):
    type_struct_handler: TypeStructHandler[str]
    scalar_subclassing_handler: TypeHandler[List[str], Any]

    def __init__(
            self,
            type_struct_handler: TypeStructHandler[str] = TypeStructTypingHandler(),
            scalar_subclassing_handler: TypeHandler[
                List[str], Any] = ScalarSubclassingTypeHandler(),
    ):
        super(TypeDeclarationHandler, self).__init__()
        self.type_struct_handler = type_struct_handler
        self.scalar_subclassing_handler = scalar_subclassing_handler

    def enum(self, t: Type, options: List[str]) -> List:
        return scripter.class_dec(
            as_qualified_ident(t.named),
            ("Enum_",),
            [scripter.assignment(o.upper(), scripter.literal(o)) for o in options],
        )

    def type_struct(self, t: Type, type_struct: TypeStruct, tags: Tags = Tags()) -> List:
        return [
            scripter.assignment(
                as_qualified_ident(t.named),
                self.type_struct_handler.map_type_struct(type_struct, tags),
            )
        ]

    def field(self, type_struct: TypeStruct, tags: Tags = Tags()) -> str:
        return self.type_struct_handler.map_type_struct(type_struct, tags)

    def struct(self, t: Type, fields: OrderedObj[str]) -> List:
        return [scripter.class_dec(as_qualified_ident(t.named), ("Struct_",),
                                   self.struct_class_methods(t, fields))]

    def struct_class_methods(self, t: Type, fields: OrderedObj[str]) -> Iterable:
        for field_type, field_name in fields:
            getter = scripter.invocation(scripter.prop_access(field_type, "wrap"),
                                         scripter.invocation(
                                             scripter.prop_access("self", "_orig", "get"),
                                             scripter.literal(field_name)))

            setter = scripter.assignment(
                scripter.index_access(scripter.prop_access("self", "_orig"),
                                      scripter.literal(field_name)),
                scripter.invocation(scripter.prop_access(field_type, "unwrap"), "v"))

            prop_name = safe_name(field_name)

            yield scripter.func_dec(prop_name, ["self"],
                                    typing=field_type,
                                    decorators=["property"],
                                    body=[
                                        scripter.ret(getter)
                                    ])

            yield scripter.func_dec(prop_name, ["self", "v"],
                                    typing=field_type,
                                    decorators=[f"{prop_name}.setter"],
                                    body=[
                                        setter
                                    ])

        yield scripter.assignment("fields", scripter.array(
            scripter.array((
                scripter.literal(field_name),
                scripter.literal(safe_name(field_name)),
                field_type,
                scripter.literal({
                    "optional": "optional" in t.fields[field_name].tags
                })
            )) for field_type, field_name in fields
        ))

    def map_type(self, t: Type) -> List:
        return super(TypeDeclarationHandler, self).map_type(
            t
        ) + self.scalar_subclassing_handler.map_type(t)


class ScaffoldTypeHandler(MaterialTypeHandler):
    config: GeneratorConfig

    def __init__(self, all_types: Dict[str, Type], config: GeneratorConfig):
        super(ScaffoldTypeHandler, self).__init__(all_types)
        self.config = config

    def type_struct(self, t: Type) -> TypedOutputBuilder:
        return TypedOutputBuilder(
            [scripter.assignment(t.named.type_name, as_qualified_ident(t.named))],
            imports=self.config.codegen_reference_import(
                output_type_specifier(Keys.codegen, t.named.qualified_name), t.named)
        )

    def struct(self, t: Type) -> TypedOutputBuilder:
        return TypedOutputBuilder(
            scripter.class_dec(t.named.type_name, [as_qualified_ident(t.named)], []),
            imports=self.config.codegen_reference_import(
                output_type_specifier(Keys.codegen, t.named.qualified_name), t.named))

    def enum(self, t: Type) -> TypedOutputBuilder:
        return TypedOutputBuilder(
            scripter.class_dec(t.named.type_name, [as_qualified_ident(t.named)], []),
            imports=self.config.codegen_reference_import(
                output_type_specifier(Keys.codegen, t.named.qualified_name), t.named))


def idol_py_output(config: GeneratorConfig) -> SinglePassGeneratorOutput:
    return SinglePassGeneratorOutput(supplemental=OrderedObj({
        config.idol_py_path: Conflictable([
            open(os.path.join(os.path.dirname(__file__), "__idol__.py"), encoding='utf-8').read()
        ])
    }))


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


def safe_name(name: str) -> str:
    if name in KEYWORDS:
        return name + "_"

    return name


def run_generator(params: GeneratorParams, config: GeneratorConfig,
                  type_dec_handler: TypeHandler[TypedOutputBuilder, Any] = None,
                  scaffold_type_handler: MaterialTypeHandler[
                      TypedOutputBuilder] = None) -> SinglePassGeneratorOutput:
    if type_dec_handler is None:
        type_dec_handler = TypeDeclarationHandler()

    if scaffold_type_handler is None:
        scaffold_type_handler = ScaffoldTypeHandler(params.all_types.obj, config)

    return SinglePassGeneratorOutput(
        codegen=params.all_types.map(lambda t, qn: TypedOutputBuilder(type_dec_handler.map_type(t),
                                                                      imports=config.type_import_handler(
                                                                          output_type_specifier(
                                                                              Keys.codegen,
                                                                              qn)).map_type(t))),
        scaffold=params.scaffold_types.map(lambda t, qn: scaffold_type_handler.map_type(t)),
    ).concat(idol_py_output(config))


def main():
    params: GeneratorParams = start(
        CliConfig(
            args={
                "target": "idol module names whose contents will have extensible types scaffolded.",
                "output": "a directory to generate the scaffolds and codegen into.",
            }
        )
    )

    config = GeneratorConfig(params)
    config.with_path_config()

    pojos = run_generator(params, config)
    rendered = render(config, pojos)
    move_to = build(config, rendered)
    move_to(params.output_dir)


if __name__ == "__main__":
    main()
