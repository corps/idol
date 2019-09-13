#! /usr/bin/env python3

import os.path

from cached_property import cached_property
from typing import Callable, Any, List

from idol import scripter
from idol.cli import start, CliConfig
from idol.functional import OrderedObj, Disjoint, Alt
from idol.generator import (
    GeneratorParams,
    GeneratorConfig,
    build,
    GeneratorAcc,
    TypeDeconstructor,
    Path,
    get_material_type_deconstructor,
    TypeStructDeconstructor,
    ScalarDeconstructor,
    GeneratorContext,
    GeneratorFileContext,
    Exported)
from idol.schema import *

ExportedAny: Exported = Exported(Path("typing"), "Any")


class IdolPy(GeneratorContext):
    scaffolds: OrderedObj["IdolPyScaffoldFile"]
    codegens: OrderedObj["IdolPyCodegenFile"]
    scaffold_impl: "Callable[[IdolPy, Type, Path], IdolPyScaffoldFile]"
    codegen_impl: "Callable[[IdolPy, Type, Path], IdolPyCodegenFile]"

    def __init__(
            self,
            config: GeneratorConfig,
            scaffold_impl: "Callable[[IdolPy, Type, Path], IdolPyScaffoldFile]" = None,
            codegen_impl: "Callable[[IdolPy, Type, Path], IdolPyCodegenFile]" = None,
    ):
        super(IdolPy, self).__init__(GeneratorAcc(), config)
        self.scaffolds = OrderedObj()
        self.codegens = OrderedObj()
        self.scaffold_impl = scaffold_impl or IdolPyScaffoldFile
        self.codegen_impl = codegen_impl or IdolPyCodegenFile

    def scaffold_file(self, ref: Reference) -> "IdolPyScaffoldFile":
        path = self.state.apply(self.folds.get_path_by_reference(self.state, scaffold=ref))
        t = self.config.params.all_types[ref.qualified_name]
        scaffold_file = self.scaffold_impl(self, t, path)
        return self.scaffolds.set_default(ref.qualified_name, scaffold_file)

    def codegen_file(self, ref: Reference) -> "IdolPyCodegenFile":
        path = self.state.apply(self.folds.get_path_by_reference(self.state, codegen=ref))
        t = self.config.params.all_types[ref.qualified_name]
        codegen_file = self.codegen_impl(self, t, path)
        return self.codegens.set_default(ref.qualified_name, codegen_file)

    @cached_property
    def idol_py_file(self) -> "IdolPyFile":
        path = self.state.apply(
            self.folds.get_path(self.state, runtime=self.config.codegen_root + "/__idol__.py")
        )
        return IdolPyFile(self, path)


class IdolPyCodegenFile(GeneratorFileContext):
    t: Type
    idol_py: IdolPy
    t_decon: TypeDeconstructor

    def __init__(self, idol_py: IdolPy, t: Type, path: Path):
        self.t = t
        self.idol_py = idol_py
        self.t_decon = TypeDeconstructor(t)
        super(IdolPyCodegenFile, self).__init__(idol_py, path)

    @cached_property
    def declared_type_ident(self) -> Alt[Exported]:
        type_ident: Alt[Exported] = Alt(
            v
            for typestruct in self.typestruct
            for v in typestruct.declared_ident
        )

        return type_ident

    @property
    def default_type_ident(self) -> str:
        return self.t.named.qualified_name

    @cached_property
    def typestruct(self) -> "Alt[IdolPyCodegenTypeStruct]":
        return Alt(
            IdolPyCodegenTypeStruct(self, ts_decon)
            for ts_decon in self.t_decon.get_typestruct()
        )


class IdolPyCodegenEnum(GeneratorFileContext):
    codegen_file: IdolPyCodegenFile
    options: List[str]

    def __init__(self, codegen_file: IdolPyCodegenFile, options: List[str]):
        self.options = options
        self.codegen_file = codegen_file
        super(IdolPyCodegenEnum, self).__init__(codegen_file.parent, codegen_file.path)

    @cached_property
    def declared_ident(self) -> Alt[str]:
        ident = self.state.apply(
            self.folds.add_ident(self.state, self.path, self.codegen_file.default_type_ident))

        self.state.apply(
            self.folds.add_content(self.path, scripter.class_dec(
                ident, self.state.apply(
                    self.folds.import_ident(self.state, self.path, Exported(Path("enum"), "Enum"))),
                [
                    scripter.assignment(name.upper(), scripter.literal(name))
                    for name in self.options
                ]
            ))
        )

        return Alt.lift(ident)


class IdolPyCodegenTypeStruct(GeneratorFileContext):
    codegen_file: IdolPyCodegenFile
    ts_decon: TypeStructDeconstructor

    @property
    def idol_py(self):
        return self.codegen_file.idol_py

    def __init__(self, parent: IdolPyCodegenFile, ts_decon: TypeStructDeconstructor):
        super(IdolPyCodegenTypeStruct, self).__init__(parent.parent, parent.path)
        self.ts_decon = ts_decon
        self.codegen_file = parent

    @cached_property
    def inner_scalar(self) -> "Alt[IdolPyCodegenScalar]":
        return Alt(
            IdolPyCodegenScalar(self, scalar_decon)
            for scalar_decon in Disjoint(
                self.ts_decon.get_scalar() + self.ts_decon.get_map() + self.ts_decon.get_repeated())
        )

    @cached_property
    def declared_ident(self) -> Alt[Exported]:
        return Alt(Disjoint(
            Exported(self.path, self.state.apply(
                self.folds.declare_and_shadow_ident(
                    self.state,
                    self.path,
                    self.codegen_file.default_type_ident,
                    typing_expr,
                    constructor_expr,
                )
            ))
            for typing_expr in self.typing_expr
            for constructor_expr in self.container_constructor_expr
            if self.ts_decon.context.is_declarable
        ) + Disjoint(
            declaration
            for scalar in self.inner_scalar
            for declaration in scalar.declared_ident
        ))

    @cached_property
    def typing_expr(self) -> Alt[str]:
        typing: Disjoint[str] = Disjoint(
            scripter.index_access(container_type, scalar_typing_expr)
            for scalar in self.inner_scalar
            for scalar_typing_expr in scalar.typing_expr
            for container_type in self.state.apply(
                self.folds.import_ident(
                    self.state,
                    self.path,
                    Exported(Path("typing"), "List")
                )
            )
            for _ in self.ts_decon.get_repeated()
        )

        typing += Disjoint(
            scripter.index_access(container_type, "str", scalar_typing_expr)
            for scalar in self.inner_scalar
            for scalar_typing_expr in scalar.typing_expr
            for container_type in self.state.apply(
                self.folds.import_ident(
                    self.state,
                    self.path,
                    Exported(Path("typing"), "Dict")
                )
            )
            for _ in self.ts_decon.get_repeated()
        )

        if typing:
            return Alt(typing)

        return Alt(expr for scalar in self.inner_scalar for expr in scalar.typing_expr)

    @cached_property
    def container_constructor_expr(self) -> Alt[str]:
        container_con: Disjoint[str] = Disjoint(
            self.state.apply(
                self.folds.import_ident(
                    self.state,
                    self.path,
                    self.idol_py.idol_py_file.list
                )
            )
            for _ in self.ts_decon.get_repeated()
        )

        container_con += Disjoint(
            self.state.apply(
                self.folds.import_ident(
                    self.state,
                    self.path,
                    self.idol_py.idol_py_file.map
                )
            )
            for _ in self.ts_decon.get_map()
        )

        return Alt(
            scripter.invocation(scripter.prop_access(con, "of"), scalar_con)
            for con in container_con
            for scalar in self.inner_scalar
            for scalar_con in scalar.constructor_expr
        )


class IdolPyCodegenScalar(GeneratorFileContext):
    typestruct: IdolPyCodegenTypeStruct
    scalar_dec: ScalarDeconstructor

    def __init__(self, parent: IdolPyCodegenTypeStruct, scalar_decon: ScalarDeconstructor):
        super(IdolPyCodegenScalar, self).__init__(parent.parent, parent.path)
        self.scalar_dec = scalar_decon

    @property
    def idol_py(self):
        return self.typestruct.idol_py

    @cached_property
    def typing_expr(self) -> Alt[str]:
        return Alt(Disjoint(self.imported_alias_ident) + Disjoint(self.prim_typing_expr))

    @cached_property
    def constructor_expr(self) -> Alt[str]:
        return Alt(Disjoint(self.imported_alias_ident) + Disjoint(self.prim_constructor_expr))

    @cached_property
    def imported_alias_ident(self) -> Alt[str]:
        # TODO: Import the scaffolded version if possible.
        alias_codegen_file = Alt(
            self.idol_py.codegen_file(ref) for ref in self.scalar_dec.get_alias()
        )
        return Alt(
            self.state.apply(
                self.idol_py.folds.import_ident(
                    self.state, self.path, codegen_type,
                    self.typestruct.codegen_file.default_type_ident
                )
            )
            for codegen_file in alias_codegen_file
            for codegen_type in codegen_file.declared_type_ident
        )

    @cached_property
    def prim_constructor_expr(self) -> Alt[str]:
        constructor_expr: Disjoint[str] = Disjoint(
            scripter.invocation(self.state.apply(
                self.idol_py.folds.import_ident(
                    self.state,
                    self.path,
                    self.idol_py.idol_py_file.primitive,
                )
            ), prim_expr)
            for _ in self.scalar_dec.get_primitive()
            for prim_expr in self.prim_typing_expr
        )

        constructor_expr += Disjoint(
            scripter.invocation(self.state.apply(
                self.idol_py.folds.import_ident(
                    self.state,
                    self.path,
                    self.idol_py.idol_py_file.literal,
                )
            ), scripter.literal(value))
            for _, value in self.scalar_dec.get_literal()
        )

        return Alt(constructor_expr)

    @cached_property
    def prim_typing_expr(self) -> Alt[str]:
        scalar_prim = Disjoint(prim_type for prim_type in self.scalar_dec.get_primitive())
        scalar_prim += Disjoint(prim_type for prim_type, _ in self.scalar_dec.get_literal())

        return Alt(
            Disjoint(
                self.scalar_type_name_mappings[prim_type]
                for prim_type in scalar_prim
                if prim_type in self.scalar_type_name_mappings
            )
            + Disjoint(
                self.state.apply(
                    self.idol_py.folds.import_ident(
                        self.state, self.path, ExportedAny
                    )
                )
                for prim_type in scalar_prim
                if prim_type == PrimitiveType.ANY
            )
        )

    @cached_property
    def declared_prim_ident(self) -> Alt[Exported]:
        return Alt(
            Exported(self.path, self.state.apply(
                self.folds.declare_and_shadow_ident(
                    self.state,
                    self.path,
                    self.typestruct.codegen_file.default_type_ident,
                    prim_expr,
                    prim_con_expr
                )
            ))
            for prim_expr in self.prim_typing_expr
            for prim_con_expr in self.prim_constructor_expr
            if not self.scalar_dec.context.is_declarable
        )

    @cached_property
    def declared_ident(self) -> Alt[Exported]:
        if not self.scalar_dec.context.is_declarable:
            return Alt.empty()

        return Alt(Disjoint(self.declared_prim_ident) + Disjoint(
            Exported(self.path, alias_ident) for alias_ident in self.imported_alias_ident))

    scalar_type_name_mappings = {
        PrimitiveType.BOOL: "bool",
        PrimitiveType.INT: "int",
        PrimitiveType.STRING: "str",
        PrimitiveType.DOUBLE: "float",
    }


class IdolPyScaffoldFile:
    path: Path
    t: Type
    idol_py: IdolPy

    def __init__(self, idol_py: IdolPy, t: Type, path: Path):
        self.t = t
        self.path = path
        self.idol_py = idol_py

    @property
    def state(self) -> GeneratorAcc:
        return self.idol_py.state

    @cached_property
    def exported_type_ident(self) -> Alt[str]:
        type_decon = get_material_type_deconstructor(self.idol_py.config.params.all_types,
                                                     self.t)

        return Alt(
            v
            for v in Disjoint(
                ident
                for ts_decon in type_decon.get_typestruct()
                for ident in self.generate_exported_typestruct(type_decon, ts_decon)
            )
        )

    def generate_exported_typestruct(
            self, type_decon: TypeDeconstructor, ts_decon: TypeStructDeconstructor
    ) -> Alt[str]:
        # For primitives, literals, and structures, just import the codegen literal.
        codegen_file = self.idol_py.codegen_file(type_decon.t.named)

        return Alt(
            self.state.apply(
                self.idol_py.folds.import_ident(
                    self.state,
                    self.path,
                    codegen_type,
                    self.default_type_ident,
                )
            )
            for codegen_type in codegen_file.exported_type
        )

    @property
    def default_type_ident(self) -> str:
        return self.t.named.type_name

    def generate_type(self, ):
        type_dec = TypeDeconstructor(self.t)


class IdolPyFile(GeneratorFileContext):
    idol_py: IdolPy

    def __init__(self, idol_py: IdolPy, path: Path):
        self.idol_py = idol_py
        super(IdolPyFile, self).__init__(idol_py, path)

    @cached_property
    def dumped_file(self) -> Path:
        content = open(
            os.path.join(os.path.dirname(__file__), "__idol__.py"), encoding="utf-8"
        ).read()

        self.idol_py.state.apply(self.idol_py.folds.add_content(self.path, content))
        return self.path

    @cached_property
    def list(self) -> Exported:
        return Exported(self.dumped_file, "List")

    @cached_property
    def map(self) -> Exported:
        return Exported(self.dumped_file, "Map")

    @cached_property
    def primitive(self) -> Exported:
        return Exported(self.dumped_file, "Primitive")

    @cached_property
    def literal(self) -> Exported:
        return Exported(self.dumped_file, "Literal")

    @cached_property
    def enum(self) -> Exported:
        return Exported(self.dumped_file, "Enum")

    @cached_property
    def struct(self) -> Exported:
        return Exported(self.dumped_file, "Struct")


#     def idol_py_imports(
#             self, module: Callable[[OutputTypeSpecifier], str], *imports
#     ) -> OrderedObj[set]:
#         path = self.resolve_path(module, dependency_specifier(Keys.supplemental, self.idol_py_path))
#         return OrderedObj({path: set(f"{i} as {i}_" for i in imports)})
#
#     def codegen_reference_import(
#             self, module: Callable[[OutputTypeSpecifier], str], reference: Reference
#     ) -> OrderedObj[set]:
#         path = self.resolve_path(
#             module, output_type_specifier(Keys.codegen, reference.qualified_name)
#         )
#         return OrderedObj({path: {as_qualified_ident(reference)}})
#
#     def scaffold_reference_import(
#             self, module: Callable[[OutputTypeSpecifier], str], reference: Reference
#     ) -> OrderedObj[set]:
#         path = self.resolve_path(
#             module, output_type_specifier(Keys.scaffold, reference.qualified_name)
#         )
#         qualified_name = as_qualified_ident(reference)
#         return OrderedObj({path: {f"{reference.type_name} as {qualified_name}"}})
#
#     def scalar_import_handler(
#             self, module: Callable[[OutputTypeSpecifier], str]
#     ) -> ScalarHandler[OrderedObj[set]]:
#         new_class = OrderedObj({"types": {"new_class"}})
#         return ScalarHandler(
#             literal=lambda *args: self.idol_py_imports(module, "Literal") + new_class,
#             primitive=lambda primitive_type, tags: self.idol_py_imports(
#                 module, "Any" if primitive_type == PrimitiveType.ANY else "Primitive"
#             )
#                                                    + new_class,
#             alias=lambda reference, tags: self.codegen_reference_import(module, reference),
#         )
#
#     def type_struct_import_handler(
#             self, module: Callable[[OutputTypeSpecifier], str]
#     ) -> TypeStructHandler[OrderedObj[set]]:
#         return TypeStructHandler(
#             scalar=lambda type_struct, tags: self.scalar_import_handler(module).map_type_struct(
#                 type_struct, tags
#             ),
#             repeated=lambda scalar_imports, tags: scalar_imports
#                                                   + self.idol_py_imports(module, "List")
#                                                   + OrderedObj({"types": {"new_class"}}),
#             map=lambda scalar_imports, tags: scalar_imports
#                                              + self.idol_py_imports(module, "Map")
#                                              + OrderedObj({"types": {"new_class"}}),
#         )
#
#     def field_type_struct_import_handler(
#             self, module: Callable[[OutputTypeSpecifier], str]
#     ) -> TypeStructHandler[OrderedObj[set]]:
#         scalar_handler = self.scalar_import_handler(module)
#         type_struct_handler = self.type_struct_import_handler(module)
#
#         scalar_handler = ScalarHandler(
#             alias=scalar_handler.alias,
#             literal=lambda *args: OrderedObj(),
#             primitive=lambda *args: OrderedObj(),
#         )
#
#         return TypeStructHandler(
#             scalar=lambda type_struct, tags: scalar_handler.map_type_struct(type_struct, tags),
#             repeated=type_struct_handler.repeated,
#             map=type_struct_handler.map,
#         )
#
#     def type_import_handler(
#             self, module: Callable[[OutputTypeSpecifier], str]
#     ) -> TypeHandler[OrderedObj[set], OrderedObj[set]]:
#         type_handler = self.type_struct_import_handler(module)
#         field_handler = self.field_type_struct_import_handler(module)
#         return TypeHandler(
#             type_struct=lambda type, type_struct, tags: type_handler.map_type_struct(
#                 type_struct, tags
#             ),
#             enum=lambda type, options: self.idol_py_imports(module, "Enum"),
#             field=lambda type_struct, tags: field_handler.map_type_struct(type_struct, tags),
#             struct=lambda type, fields: flatten_to_ordered_obj(fields.values())
#                                         + self.idol_py_imports(module, "Struct"),
#         )
#
#
# class ScalarTypingHandler(ScalarHandler):
#     def literal(self, primitive_type: PrimitiveType, value, tags: Tags = Tags()) -> str:
#         return self.primitive(primitive_type, tags)
#
#     def primitive(self, primitive_type: PrimitiveType, tags: Tags = Tags()) -> str:
#         return self.scalar_name_mappings[primitive_type]
#
#     def alias(self, alias: Reference, tags: Tags = Tags()) -> str:
#         return as_qualified_ident(alias)
#
#
#
# class ScalarSubclassingTypeHandler(TypeHandler):
#     scalar_typing_handler: ScalarHandler[str]
#
#     def __init__(self, scalar_typing_handler: ScalarHandler[str] = ScalarTypingHandler()):
#         super(ScalarSubclassingTypeHandler, self).__init__()
#         self.scalar_typing_handler = scalar_typing_handler
#
#     def type_struct(self, t: Type, type_struct: TypeStruct, tags: Tags = Tags()) -> List:
#         scalar_handler: ScalarHandler[List] = ScalarHandler(
#             alias=lambda reference, tags: [],
#             primitive=lambda prim_type, tags: (self.as_new_class(t.named, ["Primitive_"])),
#             literal=lambda prim_type, value, tags: (
#                 self.as_new_class(t.named, ["Literal_"], value=scripter.literal(value))
#             ),
#         )
#
#         typing = self.scalar_typing_handler.map_type_struct(type_struct, tags)
#
#         return TypeStructHandler(
#             scalar=lambda *args: scalar_handler.map_type_struct(*args),
#             map=lambda *args: self.as_new_class(t.named, [], inner_class=typing),
#             repeated=lambda *args: self.as_new_class(t.named, [], inner_class=typing),
#         ).map_type_struct(type_struct, tags)
#
#     def noop(self, *args) -> List:
#         return []
#
#     enum = noop
#     field = noop
#     struct = noop
#
#
# class TypeStructTypingHandler(TypeStructHandler):
#     scalar_dec_handler: ScalarHandler[List[str]]
#     scalar_handler: ScalarHandler[str]
#
#     def __init__(self, scalar_handler: ScalarHandler[str] = ScalarTypingHandler()):
#         self.scalar_handler = scalar_handler
#         super(TypeStructTypingHandler, self).__init__()
#
#     def scalar(self, type_struct: TypeStruct, tags: Tags = Tags()) -> str:
#         return self.scalar_handler.map_type_struct(type_struct, tags)
#
#     def repeated(self, scalar: str, tags: Tags = Tags()) -> str:
#         return scripter.type_parameterized("List_", scalar)
#
#     def map(self, scalar: Tuple[List[str], str], tags: Tags = Tags()) -> str:
#         return scripter.type_parameterized("Map_", scalar)
#
#
# class TypeDeclarationHandler(TypeHandler):
#     type_struct_handler: TypeStructHandler[str]
#     scalar_subclassing_handler: TypeHandler[List[str], Any]
#
#     def __init__(
#             self,
#             type_struct_handler: TypeStructHandler[str] = TypeStructTypingHandler(),
#             scalar_subclassing_handler: TypeHandler[
#                 List[str], Any] = ScalarSubclassingTypeHandler(),
#     ):
#         super(TypeDeclarationHandler, self).__init__()
#         self.type_struct_handler = type_struct_handler
#         self.scalar_subclassing_handler = scalar_subclassing_handler
#
#     def enum(self, t: Type, options: List[str]) -> List:
#         return scripter.class_dec(
#             as_qualified_ident(t.named),
#             ("Enum_",),
#             [scripter.assignment(o.upper(), scripter.literal(o)) for o in options],
#         )
#
#     def type_struct(self, t: Type, type_struct: TypeStruct, tags: Tags = Tags()) -> List:
#         return [
#             scripter.assignment(
#                 as_qualified_ident(t.named),
#                 self.type_struct_handler.map_type_struct(type_struct, tags),
#             )
#         ]
#
#     def field(self, type_struct: TypeStruct, tags: Tags = Tags()) -> str:
#         return self.type_struct_handler.map_type_struct(type_struct, tags)
#
#     def struct(self, t: Type, fields: OrderedObj[str]) -> List:
#         return [
#             scripter.class_dec(
#                 as_qualified_ident(t.named), ("Struct_",), self.struct_class_methods(t, fields)
#             )
#         ]
#
#     def struct_class_methods(self, t: Type, fields: OrderedObj[str]) -> Iterable:
#         for field_type, field_name in fields:
#             getter = scripter.invocation(
#                 scripter.prop_access(field_type, "wrap"),
#                 scripter.invocation(
#                     scripter.prop_access("self", "_orig", "get"), scripter.literal(field_name)
#                 ),
#             )
#
#             setter = scripter.assignment(
#                 scripter.index_access(
#                     scripter.prop_access("self", "_orig"), scripter.literal(field_name)
#                 ),
#                 scripter.invocation(scripter.prop_access(field_type, "unwrap"), "v"),
#             )
#
#             prop_name = safe_name(field_name)
#
#             yield from scripter.func_dec(
#                 prop_name,
#                 ["self"],
#                 typing=field_type,
#                 decorators=["property"],
#                 body=[scripter.ret(getter)],
#             )
#
#             yield from scripter.func_dec(
#                 prop_name, ["self", "v"], decorators=[f"{prop_name}.setter"], body=[setter]
#             )
#
#         yield scripter.assignment(
#             "_FIELDS",
#             scripter.array(
#                 scripter.array(
#                     (
#                         scripter.literal(field_name),
#                         scripter.literal(safe_name(field_name)),
#                         field_type,
#                         scripter.literal({"optional": "optional" in t.fields[field_name].tags}),
#                     )
#                 )
#                 for field_type, field_name in fields
#             ),
#         )
#
#     def map_type(self, t: Type) -> List:
#         return super(TypeDeclarationHandler, self).map_type(
#             t
#         ) + self.scalar_subclassing_handler.map_type(t)
#
#
# class ScaffoldTypeHandler(MaterialTypeHandler):
#     config: GeneratorConfig
#
#     def __init__(self, all_types: Dict[str, Type], config: GeneratorConfig):
#         super(ScaffoldTypeHandler, self).__init__(all_types)
#         self.config = config
#
#     def type_struct(self, t: Type) -> OutputTypeBuilder:
#         return OutputTypeBuilder(
#             [scripter.assignment(t.named.type_name, as_qualified_ident(t.named))],
#             imports=self.config.codegen_reference_import(
#                 output_type_specifier(Keys.codegen, t.named.qualified_name), t.named
#             ),
#         )
#
#     def struct(self, t: Type) -> OutputTypeBuilder:
#         return OutputTypeBuilder(
#             scripter.class_dec(t.named.type_name, [as_qualified_ident(t.named)], []),
#             imports=self.config.codegen_reference_import(
#                 output_type_specifier(Keys.codegen, t.named.qualified_name), t.named
#             ),
#         )
#
#     def enum(self, t: Type) -> OutputTypeBuilder:
#         return OutputTypeBuilder(
#             scripter.class_dec(t.named.type_name, [as_qualified_ident(t.named)], []),
#             imports=self.config.codegen_reference_import(
#                 output_type_specifier(Keys.codegen, t.named.qualified_name), t.named
#             ),
#         )
#
#
# def idol_py_output(config: GeneratorConfig) -> SinglePassGeneratorOutput:
#     return SinglePassGeneratorOutput(
#         supplemental=OrderedObj(
#             {
#                 config.idol_py_path: Conflictable(
#                     [
#                         open(
#                             os.path.join(os.path.dirname(__file__), "__idol__.py"), encoding="utf-8"
#                         ).read()
#                     ]
#                 )
#             }
#         )
#     )
#
#

def run_generator(
        params: GeneratorParams,
        config: GeneratorConfig,
        type_dec_handler: TypeHandler[OutputTypeBuilder, Any] = None,
        scaffold_type_handler: MaterialTypeHandler[OutputTypeBuilder] = None,
) -> SinglePassGeneratorOutput:
    if type_dec_handler is None:
        type_dec_handler = TypeDeclarationHandler()

    if scaffold_type_handler is None:
        scaffold_type_handler = ScaffoldTypeHandler(params.all_types.obj, config)

    return SinglePassGeneratorOutput(
        codegen=params.all_types.map(
            lambda t, qn: OutputTypeBuilder(
                type_dec_handler.map_type(t),
                imports=config.type_import_handler(
                    output_type_specifier(Keys.codegen, qn)
                ).map_type(t),
            )
        ),
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
