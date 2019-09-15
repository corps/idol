#! /usr/bin/env python3

import os.path

from cached_property import cached_property
from typing import Callable, List, Dict, Any

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
    Exported,
    Expression,
    import_expr,
    get_safe_ident,
)
from idol.py.schema.primitive_type import PrimitiveType
from idol.py.schema.reference import Reference
from idol.py.schema.type import Type

ExportedAny: Exported = Exported(Path("typing"), "Any")


class IdolPy(GeneratorContext):
    scaffolds: Dict[str, "IdolPyScaffoldFile"]
    codegens: Dict[str, "IdolPyCodegenFile"]
    scaffold_impl: "Callable[[IdolPy, Type, Path], IdolPyScaffoldFile]"
    codegen_impl: "Callable[[IdolPy, Type, Path], IdolPyCodegenFile]"

    def __init__(
            self,
            config: GeneratorConfig,
            scaffold_impl: "Callable[[IdolPy, Type, Path], IdolPyScaffoldFile]" = None,
            codegen_impl: "Callable[[IdolPy, Type, Path], IdolPyCodegenFile]" = None,
    ):
        super(IdolPy, self).__init__(GeneratorAcc(), config)
        self.scaffolds = {}
        self.codegens = {}
        self.scaffold_impl = scaffold_impl or IdolPyScaffoldFile
        self.codegen_impl = codegen_impl or IdolPyCodegenFile

    def scaffold_file(self, ref: Reference) -> "IdolPyScaffoldFile":
        path = self.state.reserve_path(**self.config.paths_of(scaffold=ref))
        t = self.config.params.all_types.obj[ref.qualified_name]
        scaffold_file = self.scaffold_impl(self, t, path)
        return self.scaffolds.setdefault(ref.qualified_name, scaffold_file)

    def codegen_file(self, ref: Reference) -> "IdolPyCodegenFile":
        path = self.state.reserve_path(**self.config.paths_of(codegen=ref))
        t = self.config.params.all_types.obj[ref.qualified_name]
        codegen_file = self.codegen_impl(self, t, path)
        return self.codegens.setdefault(ref.qualified_name, codegen_file)

    @cached_property
    def idol_py_file(self) -> "IdolPyFile":
        path = self.state.reserve_path(runtime=self.config.codegen_root + "/__idol__.py")
        return IdolPyFile(self, path)

    def render(self) -> OrderedObj[str]:
        for i, t in enumerate(self.config.params.scaffold_types.values()):
            for export in self.scaffold_file(t.named).declared_type_ident:
                print(
                    f"Rendered {export.ident} to {export.path.path} ({i} / {len(self.config.params.scaffold_types)})"
                )
                break
            else:
                print(
                    f"Skipped {t.named.as_qualified_ident} ({i} / {len(self.config.params.scaffold_types)})"
                )

        return self.state.render(
            dict(
                codegen=[
                    "DO NOT EDIT",
                    "This file was generated by idol_py, any changes will be lost when idol_py is rerun again",
                ],
                scaffold=[
                    "This file was scaffold by idol_py, but it will not be overwritten, so feel free to edit.",
                    "This file will be regenerated if you delete it.",
                ],
            )
        )


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
        type_ident: Disjoint[Exported] = Disjoint(
            v for typestruct in self.typestruct for v in typestruct.declared_ident
        )

        type_ident += Disjoint(v for enum in self.enum for v in enum.declared_ident)
        type_ident += Disjoint(v for struct in self.struct for v in struct.declared_ident)

        return Alt(type_ident)

    @property
    def default_type_name(self) -> str:
        return self.t.named.as_qualified_ident

    @cached_property
    def typestruct(self) -> "Alt[IdolPyCodegenTypeStructDeclaration]":
        return Alt(
            IdolPyCodegenTypeStructDeclaration(self, ts_decon)
            for ts_decon in self.t_decon.get_typestruct()
        )

    @cached_property
    def enum(self) -> "Alt[IdolPyCodegenEnum]":
        return Alt(IdolPyCodegenEnum(self, options) for options in self.t_decon.get_enum())

    @cached_property
    def struct(self) -> "Alt[IdolPyCodegenStruct]":
        return Alt(
            IdolPyCodegenStruct(
                self,
                OrderedObj.from_iterable(
                    OrderedObj({k: IdolPyCodegenTypeStruct(self.idol_py, ts_decon)})
                    for k, ts_decon in fields
                ),
            )
            for fields in self.t_decon.get_struct()
        )


class IdolPyCodegenStruct(GeneratorFileContext):
    codegen_file: IdolPyCodegenFile
    fields: OrderedObj["IdolPyCodegenTypeStruct"]

    def __init__(
            self, codegen_file: IdolPyCodegenFile, fields: "OrderedObj[IdolPyCodegenTypeStruct]"
    ):
        self.fields = fields
        self.codegen_file = codegen_file
        super(IdolPyCodegenStruct, self).__init__(codegen_file.parent, codegen_file.path)

    @cached_property
    def declared_ident(self) -> Alt[Exported]:
        return Alt.lift(
            Exported(
                self.path,
                self.state.add_content_with_ident(
                    self.path,
                    self.codegen_file.default_type_name,
                    scripter.nameable_class_dec(
                        [
                            self.state.import_ident(
                                self.path, self.codegen_file.idol_py.idol_py_file.struct
                            )
                        ],
                        [
                            scripter.typing(
                                get_safe_ident(field_name), typing_expr(self.state, self.path)
                            )
                            for field_name, field in self.fields
                            for typing_expr in field.typing_expr
                        ]
                        + [
                            scripter.assignment(
                                "__field_constructors__",
                                scripter.array(
                                    scripter.tuple(
                                        scripter.literal(field_name),
                                        scripter.literal(get_safe_ident(field_name)),
                                        field_expr(self.state, self.path),
                                        scripter.invocation(
                                            "dict",
                                            optional=scripter.literal(
                                                field.ts_decon.context.includes_tag(
                                                    field_tag="optional"
                                                )
                                            ),
                                        ),
                                    )
                                    for field_name, field in self.fields
                                    for field_expr in field.constructor_expr
                                ),
                            )
                        ],
                    ),
                ),
            )
        )


class IdolPyCodegenEnum(GeneratorFileContext):
    codegen_file: IdolPyCodegenFile
    options: List[str]

    def __init__(self, codegen_file: IdolPyCodegenFile, options: List[str]):
        self.options = options
        self.codegen_file = codegen_file
        super(IdolPyCodegenEnum, self).__init__(codegen_file.parent, codegen_file.path)

    @cached_property
    def declared_ident(self) -> Alt[Exported]:
        return Alt.lift(
            Exported(
                self.path,
                self.state.add_content_with_ident(
                    self.path,
                    self.codegen_file.default_type_name,
                    scripter.nameable_class_dec(
                        [
                            self.state.import_ident(
                                self.path, self.codegen_file.idol_py.idol_py_file.enum
                            ),
                        ],
                        [
                            scripter.assignment(name.upper(), scripter.literal(name))
                            for name in self.options
                        ],
                    ),
                ),
            )
        )


class IdolPyCodegenTypeStruct(GeneratorContext):
    ts_decon: TypeStructDeconstructor
    idol_py: IdolPy

    def __init__(self, parent: IdolPy, ts_decon: TypeStructDeconstructor):
        super(IdolPyCodegenTypeStruct, self).__init__(parent.state, parent.config)
        self.ts_decon = ts_decon
        self.idol_py = parent

    @cached_property
    def inner_scalar(self) -> "Alt[IdolPyCodegenScalar]":
        return Alt(
            IdolPyCodegenScalar(self.idol_py, scalar_decon)
            for scalar_decon in Disjoint(
                self.ts_decon.get_scalar() + self.ts_decon.get_map() + self.ts_decon.get_repeated()
            )
        )

    @cached_property
    def typing_expr(self) -> Alt[Expression]:
        def repeated_expr(scalar_typing_expr: Expression) -> Expression:
            def inner(state: GeneratorAcc, path: Path) -> str:
                return scripter.index_access(
                    state.import_ident(path, Exported(Path("typing"), "MutableSequence")),
                    scalar_typing_expr(state, path),
                )

            return inner

        def map_expr(scalar_typing_expr: Expression) -> Expression:
            def inner(state: GeneratorAcc, path: Path) -> str:
                return scripter.index_access(
                    state.import_ident(path, Exported(Path("typing"), "MutableMapping")),
                    "str",
                    scalar_typing_expr(state, path),
                )

            return inner

        def optional_expr(inner_expr: Expression) -> Expression:
            def inner(state: GeneratorAcc, path: Path) -> str:
                return scripter.index_access(
                    state.import_ident(path, Exported(Path("typing"), "Optional")),
                    inner_expr(state, path),
                )

            return inner

        container_typing: Disjoint[Expression] = Disjoint(
            repeated_expr(scalar_typing_expr)
            for scalar in self.inner_scalar
            for scalar_typing_expr in scalar.typing_expr
            if self.ts_decon.get_repeated()
        )

        container_typing += Disjoint(
            map_expr(scalar_typing_expr)
            for scalar in self.inner_scalar
            for scalar_typing_expr in scalar.typing_expr
            if self.ts_decon.get_map()
        )

        typing = Alt(container_typing) + Alt(
            expr for scalar in self.inner_scalar for expr in scalar.typing_expr
        )

        if self.ts_decon.context.includes_tag(field_tag="optional"):
            return Alt(optional_expr(typing_expr) for typing_expr in typing)

        return typing

    @cached_property
    def constructor_expr(self) -> Alt[Expression]:
        return Alt(
            Disjoint(self.container_constructor_expr)
            + Disjoint(
                expr
                for inner_scalar in self.inner_scalar
                for expr in inner_scalar.constructor_expr
                if self.ts_decon.get_scalar()
            )
        )

    @cached_property
    def container_constructor_expr(self) -> Alt[Expression]:
        container_con: Disjoint[Expression] = self.ts_decon.get_repeated() and Disjoint.lift(
            import_expr(self.idol_py.idol_py_file.list)
        )
        container_con += self.ts_decon.get_map() and Disjoint.lift(
            import_expr(self.idol_py.idol_py_file.map)
        )

        def container_expression(
                container_expr: Expression, scalar_expression: Expression
        ) -> Expression:
            def inner(state: GeneratorAcc, path: Path):
                return scripter.invocation(
                    scripter.prop_access(container_expr(state, path), "of"),
                    scalar_expression(state, path),
                    scripter.invocation(
                        "dict",
                        atleast_one=scripter.literal(
                            self.ts_decon.context.includes_tag(type_tag="atleast_one")
                        ),
                    ),
                )

            return inner

        return Alt(
            container_expression(container_con_expr, scalar_con_expr)
            for container_con_expr in container_con
            for scalar in self.inner_scalar
            for scalar_con_expr in scalar.constructor_expr
        )


class IdolPyCodegenTypeStructDeclaration(IdolPyCodegenTypeStruct):
    path: Path
    codegen_file: IdolPyCodegenFile

    def __init__(self, parent: IdolPyCodegenFile, ts_decon: TypeStructDeconstructor):
        super(IdolPyCodegenTypeStructDeclaration, self).__init__(parent.idol_py, ts_decon)
        self.codegen_file = parent
        self.path = parent.path

    @cached_property
    def declarable_scalar(self) -> "Alt[IdolPyCodegenScalarDeclaration]":
        return Alt(
            IdolPyCodegenScalarDeclaration(self.codegen_file, scalar_decon)
            for scalar_decon in self.ts_decon.get_scalar()
        )

    @cached_property
    def declared_ident(self) -> Alt[Exported]:
        return Alt(
            Disjoint(
                Exported(
                    self.path,
                    self.state.add_content_with_ident(
                        self.path,
                        self.codegen_file.default_type_name,
                        scripter.declare_and_shadow(
                            typing_expr(self.state, self.path),
                            constructor_expr(self.state, self.path),
                        ),
                    ),
                )
                for typing_expr in self.typing_expr
                for constructor_expr in self.container_constructor_expr
            )
            + Disjoint(
                declaration
                for scalar in self.declarable_scalar
                for declaration in scalar.declared_ident
            )
        )


class IdolPyCodegenScalar(GeneratorContext):
    idol_py: IdolPy
    scalar_dec: ScalarDeconstructor

    def __init__(self, parent: IdolPy, scalar_decon: ScalarDeconstructor):
        super(IdolPyCodegenScalar, self).__init__(parent.state, parent.config)
        self.scalar_dec = scalar_decon
        self.idol_py = parent

    @cached_property
    def typing_expr(self) -> Alt[Expression]:
        return Alt(Disjoint(self.reference_import_expr) + Disjoint(self.prim_typing_expr))

    @cached_property
    def constructor_expr(self) -> Alt[Expression]:
        return Alt(Disjoint(self.reference_import_expr) + Disjoint(self.prim_constructor_expr))

    @cached_property
    def reference_import_expr(self) -> Alt[Expression]:
        alias_codegen_file = Alt(
            self.idol_py.codegen_file(ref) for ref in self.scalar_dec.get_alias()
        )

        alias_scaffold_file = Alt(
            self.idol_py.scaffold_file(ref)
            for ref in self.scalar_dec.get_alias()
            if ref.qualified_name in self.config.params.scaffold_types.obj
        )

        imported_alias_ident: Disjoint[Expression] = Disjoint(
            import_expr(codegen_type, "Codegen" + codegen_type.ident)
            for codegen_file in alias_codegen_file
            for codegen_type in codegen_file.declared_type_ident
            if not alias_scaffold_file
        )

        imported_alias_ident += Disjoint(
            import_expr(scaffold_type, "Scaffold" + scaffold_type.ident)
            for scaffold_file in alias_scaffold_file
            for scaffold_type in scaffold_file.declared_type_ident
        )

        return Alt(imported_alias_ident)

    @cached_property
    def prim_constructor_expr(self) -> Alt[Expression]:
        def prim_con_expr(prim_expr: Expression) -> Expression:
            def inner(state: GeneratorAcc, path: Path) -> str:
                return scripter.invocation(
                    scripter.prop_access(
                        state.import_ident(path, self.idol_py.idol_py_file.primitive), "of"),
                    prim_expr(state, path),
                )

            return inner

        def literal_con_expr(value: Any) -> Expression:
            def inner(state: GeneratorAcc, path: Path) -> str:
                return scripter.invocation(scripter.prop_access(
                    state.import_ident(path, self.idol_py.idol_py_file.literal), "of"),
                    scripter.literal(value),
                )

            return inner

        constructor_expr: Disjoint[Expression] = Disjoint(
            prim_con_expr(prim_expr)
            for _ in self.scalar_dec.get_primitive()
            for prim_expr in self.prim_typing_expr
        )

        constructor_expr += Disjoint(
            literal_con_expr(value) for _, value in self.scalar_dec.get_literal()
        )

        return Alt(constructor_expr)

    @cached_property
    def prim_typing_expr(self) -> Alt[Expression]:
        scalar_prim = Disjoint(prim_type for prim_type in self.scalar_dec.get_primitive())
        scalar_prim += Disjoint(prim_type for prim_type, _ in self.scalar_dec.get_literal())

        def any_expr(state: GeneratorAcc, path: Path) -> str:
            return state.import_ident(path, Exported(Path("typing"), "Any"))

        def scalar_expr(prim_type: PrimitiveType) -> Expression:
            def inner(state: GeneratorAcc, path: Path) -> str:
                return self.scalar_type_name_mappings[prim_type]

            return inner

        return Alt(
            Disjoint(
                scalar_expr(prim_type)
                for prim_type in scalar_prim
                if prim_type in self.scalar_type_name_mappings
            )
            + Disjoint(any_expr for prim_type in scalar_prim if prim_type == PrimitiveType.ANY)
        )

    scalar_type_name_mappings = {
        PrimitiveType.BOOL: "bool",
        PrimitiveType.INT: "int",
        PrimitiveType.STRING: "str",
        PrimitiveType.DOUBLE: "float",
    }


class IdolPyCodegenScalarDeclaration(IdolPyCodegenScalar):
    path: Path
    codegen_file: IdolPyCodegenFile

    def __init__(self, parent: IdolPyCodegenFile, scalar_decon: ScalarDeconstructor):
        super(IdolPyCodegenScalarDeclaration, self).__init__(parent.idol_py, scalar_decon)
        self.codegen_file = parent
        self.path = parent.path

    @cached_property
    def declared_prim_ident(self) -> Alt[Exported]:
        return Alt(
            Exported(
                self.path,
                self.state.add_content_with_ident(
                    self.path,
                    self.codegen_file.default_type_name,
                    scripter.declare_and_shadow(
                        prim_expr(self.state, self.path), prim_con_expr(self.state, self.path)
                    ),
                ),
            )
            for prim_expr in self.prim_typing_expr
            for prim_con_expr in self.prim_constructor_expr
        )

    @cached_property
    def declared_ident(self) -> Alt[Exported]:
        return Alt(Disjoint(self.declared_prim_ident) + Disjoint(self.declared_alias_ident))

    @cached_property
    def declared_alias_ident(self) -> Alt[Exported]:
        return Alt(
            Exported(
                self.path,
                self.state.add_content_with_ident(
                    self.path,
                    self.codegen_file.default_type_name,
                    scripter.assignable(ref_import(self.state, self.path)),
                ),
            )
            for ref_import in self.reference_import_expr
        )


class IdolPyScaffoldFile(GeneratorFileContext):
    t: Type
    idol_py: IdolPy

    def __init__(self, idol_py: IdolPy, t: Type, path: Path):
        self.t = t
        self.idol_py = idol_py
        super(IdolPyScaffoldFile, self).__init__(idol_py, path)

    @cached_property
    def declared_type_ident(self) -> Alt[Exported]:
        type_decon = get_material_type_deconstructor(self.idol_py.config.params.all_types, self.t)
        self.state.idents.add_identifier(self.path, self.default_type_name, "declared_type_ident")

        codegen_type_ident: Alt[str] = Alt(
            self.state.import_ident(self.path, codegen_type, self.default_type_name + "Codegen")
            for codegen_type in self.idol_py.codegen_file(self.t.named).declared_type_ident
        )

        return Alt(
            Disjoint(
                Exported(
                    self.path,
                    self.state.add_content_with_ident(
                        self.path, self.default_type_name, scripter.assignable(codegen_ident)
                    ),
                )
                for codegen_ident in codegen_type_ident
                if type_decon.get_typestruct() or type_decon.get_enum()
            )
            + Disjoint(
                Exported(
                    self.path,
                    self.state.add_content_with_ident(
                        self.path,
                        self.default_type_name,
                        scripter.nameable_class_dec([codegen_ident], []),
                    ),
                )
                for codegen_ident in codegen_type_ident
                if type_decon.get_struct()
            )
        )

    @property
    def default_type_name(self) -> str:
        return self.t.named.type_name


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

        self.state.add_content(self.path, content)
        return self.path

    @cached_property
    def list(self) -> Exported:
        return Exported(
            self.dumped_file, self.state.idents.add_identifier(self.path, "List", "list()")
        )

    @cached_property
    def map(self) -> Exported:
        return Exported(
            self.dumped_file, self.state.idents.add_identifier(self.path, "Map", "map()")
        )

    @cached_property
    def primitive(self) -> Exported:
        return Exported(
            self.dumped_file,
            self.state.idents.add_identifier(self.path, "Primitive", "primitive()"),
        )

    @cached_property
    def literal(self) -> Exported:
        return Exported(
            self.dumped_file, self.state.idents.add_identifier(self.path, "Literal", "literal()")
        )

    @cached_property
    def enum(self) -> Exported:
        return Exported(
            self.dumped_file, self.state.idents.add_identifier(self.path, "Enum", "enum()")
        )

    @cached_property
    def struct(self) -> Exported:
        return Exported(
            self.dumped_file, self.state.idents.add_identifier(self.path, "Struct", "struct()")
        )


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
    config.with_path_mappings(
        dict(
            codegen=config.in_codegen_dir(config.one_file_per_type),
            scaffold=config.one_file_per_type,
        )
    )

    idol_py = IdolPy(config)
    move_to = build(config, idol_py.render())
    move_to(params.output_dir)


if __name__ == "__main__":
    main()
