#! /usr/bin/env python3

import os.path

from cached_property import cached_property
from typing import Callable, List, Dict, Union, Any, Optional

from idol import scripter
from idol.cli import start, CliConfig
from idol.functional import OrderedObj, Alt
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
    get_tag_values,
    includes_tag,
    TypeStructContext,
    ExternFileContext,
    ImportPath,
    AbstractGeneratorFileContext,
)
from idol.py.schema.primitive_type import PrimitiveType
from idol.py.schema.reference import Reference
from idol.py.schema.type import Type


class FieldExpressionComposer:
    constructor_ident: Expression
    args: List[Union[Expression, str]]
    kwds: Dict[str, Union[str, str]]

    def __init__(
        self,
        constructor_ident: Expression,
        args: List[Union[str, Expression]] = None,
        kwds: Dict[str, Union[str, Expression]] = None,
    ):
        self.constructor_ident = constructor_ident
        self.args = args or []
        self.kwds = kwds or {}

    def resolve_arg_or_kwd(
        self, expr_or_str: Union[Expression, str], state: GeneratorAcc, path: Path
    ):
        if isinstance(expr_or_str, str):
            return expr_or_str

        return expr_or_str(state, path)

    def resolve_args_and_kwds(self, state: GeneratorAcc, path: Path):
        args = [self.resolve_arg_or_kwd(expr_or_str, state, path) for expr_or_str in self.args]
        kwds = {
            k: self.resolve_arg_or_kwd(expr_or_str, state, path)
            for k, expr_or_str in self.kwds.items()
        }
        return args, kwds

    def field_instance_expr(self) -> Expression:
        def expr(state: GeneratorAcc, path: Path) -> str:
            args, kwds = self.resolve_args_and_kwds(state, path)
            return scripter.invocation(self.constructor_ident(state, path), *args, **kwds)

        return expr

    def curried_field_declaration_expr(self, name: str, idol_mar: "IdolMarshmallow") -> Expression:
        def expr(state: GeneratorAcc, path: Path) -> str:
            args, kwds = self.resolve_args_and_kwds(state, path)
            return scripter.invocation(
                state.import_ident(path, idol_mar.idol_mar_file.wrap_field),
                self.constructor_ident(state, path),
                scripter.literal(name),
                *list(scripter.thunk(arg) for arg in args),
                **kwds,
            )

        return expr

    def with_more_kwds(
        self, more_kwds: Dict[str, Union[Expression, str]]
    ) -> "FieldExpressionComposer":
        return FieldExpressionComposer(
            self.constructor_ident, self.args, dict(**self.kwds, **more_kwds)
        )


class IdolMarCodegenStruct(GeneratorFileContext):
    codegen_file: "IdolMarCodegenFile"
    fields: OrderedObj["IdolMarCodegenTypeStruct"]

    def __init__(
        self, codegen_file: "IdolMarCodegenFile", fields: "OrderedObj[IdolMarCodegenTypeStruct]"
    ):
        self.fields = fields
        self.codegen_file = codegen_file
        super(IdolMarCodegenStruct, self).__init__(codegen_file.parent, codegen_file.path)

    @cached_property
    def declared_schema(self) -> Alt[Exported]:
        return Alt.lift(
            self.export(
                self.codegen_file.default_schema_name,
                scripter.nameable_class_dec(
                    [self.import_ident(Exported(Path("marshmallow"), "Schema"))],
                    [
                        line
                        for field_name, field in self.fields
                        for composer in field.field_composer
                        for line in (
                            scripter.comments(
                                get_tag_values(field.ts_decon.context.field_tags, "description")
                            )
                            + [
                                scripter.assignment(
                                    get_safe_ident(field_name),
                                    self.apply_expr(
                                        composer.with_more_kwds(
                                            dict(
                                                dump_to=scripter.literal(field_name),
                                                load_from=scripter.literal(field_name),
                                                allow_none=scripter.literal(
                                                    includes_tag(
                                                        field.ts_decon.context.field_tags,
                                                        "optional",
                                                    )
                                                ),
                                            )
                                        ).field_instance_expr()
                                    ),
                                )
                            ]
                        )
                    ],
                    doc_str=get_tag_values(self.codegen_file.t.tags, "description"),
                ),
            )
        )

    @cached_property
    def declared_field(self) -> Alt[Exported]:
        for declared_schema in self.declared_schema:
            schema_expr: Expression = import_expr(declared_schema)

            if self.codegen_file.t.named.qualified_name in self.config.params.scaffold_types.obj:
                for scaffold_declared_schema in self.codegen_file.idol_mar.scaffold_file(
                    self.codegen_file.t.named
                ).declared_schema:

                    def lazy_import(state: GeneratorAcc, path: Path) -> str:
                        import_module = state.import_ident(
                            path, Exported(Path("importlib"), "import_module")
                        )

                        return scripter.prop_access(
                            scripter.invocation(
                                import_module,
                                scripter.literal(
                                    ImportPath.as_python_module_path(
                                        path.import_path_to(scaffold_declared_schema.path).rel_path
                                    )
                                ),
                                "__package__",
                            ),
                            scaffold_declared_schema.ident,
                        )

                    schema_expr = lazy_import

            return Alt.lift(
                self.export(
                    self.codegen_file.default_field_name,
                    scripter.assignable(
                        self.apply_expr(
                            FieldExpressionComposer(
                                import_expr(
                                    self.codegen_file.idol_mar.marshmallow_field_exported("Nested")
                                ),
                                [self.apply_expr(schema_expr)],
                            ).curried_field_declaration_expr(
                                self.codegen_file.default_field_name, self.codegen_file.idol_mar
                            )
                        )
                    ),
                )
            )

        return Alt.empty()


class IdolMarCodegenEnum(GeneratorFileContext):
    codegen_file: "IdolMarCodegenFile"
    options: List[str]

    def __init__(self, codegen_file: "IdolMarCodegenFile", options: List[str]):
        self.options = options
        self.codegen_file = codegen_file
        super(IdolMarCodegenEnum, self).__init__(codegen_file.parent, codegen_file.path)

        self.reserve_ident(self.default_enum_name)

    @cached_property
    def declared_enum(self) -> Alt[Exported]:
        return Alt.lift(
            self.export(
                self.default_enum_name,
                scripter.nameable_class_dec(
                    [self.import_ident(Exported(Path("enum"), "Enum"))],
                    [
                        scripter.assignment(name.upper(), scripter.literal(name))
                        for name in self.options
                    ],
                    doc_str=get_tag_values(self.codegen_file.t.tags, "description"),
                ),
            )
        )

    @cached_property
    def declared_field(self) -> Alt[Exported]:
        return Alt(
            self.export(
                self.codegen_file.default_field_name,
                scripter.assignable(
                    self.apply_expr(
                        FieldExpressionComposer(
                            import_expr(Exported(Path("marshmallow_enum"), "EnumField")),
                            [self.import_ident(declared_enum)],
                            dict(by_value=scripter.literal(True)),
                        ).curried_field_declaration_expr(
                            self.codegen_file.default_field_name, self.codegen_file.idol_mar
                        )
                    )
                ),
            )
            for declared_enum in self.declared_enum
        )

    @cached_property
    def declared_schema(self) -> Alt[Exported]:
        return Alt.lift(
            self.export(
                self.codegen_file.default_schema_name, scripter.assignable(scripter.literal(None))
            )
        )

    @property
    def default_enum_name(self):
        return self.codegen_file.t.named.as_qualified_ident + "Enum"


class IdolMarCodegenScalar(GeneratorContext):
    idol_mar: "IdolMarshmallow"
    scalar_dec: ScalarDeconstructor

    FieldExpressionComposer = FieldExpressionComposer

    def __init__(self, parent: "IdolMarshmallow", scalar_decon: ScalarDeconstructor):
        super(IdolMarCodegenScalar, self).__init__(parent.state, parent.config)
        self.scalar_dec = scalar_decon
        self.idol_mar = parent

    @cached_property
    def field_expr_composer(self) -> Alt[FieldExpressionComposer]:
        return (
            self.reference_import_field_expr_composer
            ^ self.prim_field_expr
            ^ self.literal_field_expr
        )

    @cached_property
    def reference_import_field_expr_composer(self) -> Alt[FieldExpressionComposer]:
        return Alt(
            self.FieldExpressionComposer(import_expr(declared_field))
            for ref in self.scalar_dec.get_alias()
            for declared_field in self.idol_mar.codegen_file(ref).declared_field
        )

    @cached_property
    def literal_field_expr(self) -> Alt[FieldExpressionComposer]:
        return Alt(
            self.FieldExpressionComposer(
                import_expr(self.idol_mar.marshmallow_field_exported("Constant")),
                [scripter.literal(val)],
            )
            for _, val in self.scalar_dec.get_literal()
        )

    @cached_property
    def prim_field_expr(self) -> Alt[FieldExpressionComposer]:
        scalar_prim: Alt[PrimitiveType] = self.scalar_dec.get_primitive()

        return Alt(
            FieldExpressionComposer(import_expr(self.scalar_marshmallow_field_mappings[prim_type]))
            for prim_type in scalar_prim
            if prim_type in self.scalar_marshmallow_field_mappings
        ) ^ Alt(
            FieldExpressionComposer(import_expr(self.idol_mar.idol_mar_file.any))
            for prim_type in scalar_prim
            if prim_type == PrimitiveType.ANY
        )

    @cached_property
    def scalar_marshmallow_field_mappings(self) -> Dict[PrimitiveType, Exported]:
        return {
            PrimitiveType.BOOL: self.idol_mar.marshmallow_field_exported("Boolean"),
            PrimitiveType.INT: self.idol_mar.marshmallow_field_exported("Int"),
            PrimitiveType.STRING: self.idol_mar.marshmallow_field_exported("String"),
            PrimitiveType.DOUBLE: self.idol_mar.marshmallow_field_exported("Float"),
        }

    @cached_property
    def scalar_defaults_mapping(self) -> Dict[PrimitiveType, str]:
        return {
            PrimitiveType.BOOL: scripter.literal(False),
            PrimitiveType.INT: scripter.literal(0),
            PrimitiveType.STRING: scripter.literal(""),
            PrimitiveType.DOUBLE: scripter.literal(0.0),
            PrimitiveType.ANY: scripter.literal(0),
        }


class IdolMarCodegenTypeStruct(GeneratorContext):
    ts_decon: TypeStructDeconstructor
    idol_mar: "IdolMarshmallow"

    IdolMarCodegenScalar = IdolMarCodegenScalar

    def __init__(self, parent: "IdolMarshmallow", ts_decon: TypeStructDeconstructor):
        super(IdolMarCodegenTypeStruct, self).__init__(parent.state, parent.config)
        self.ts_decon = ts_decon
        self.idol_mar = parent

    @cached_property
    def inner_scalar(self) -> "Alt[IdolMarCodegenScalar]":
        return Alt(
            self.IdolMarCodegenScalar(self.idol_mar, scalar_decon)
            for scalar_decon in (
                self.ts_decon.get_scalar() ^ self.ts_decon.get_map() ^ self.ts_decon.get_repeated()
            )
        )

    @cached_property
    def field_composer(self) -> Alt[FieldExpressionComposer]:
        return self.scalar_field_composer ^ self.list_field_composer ^ self.map_field_composer

    @cached_property
    def scalar_field_composer(self) -> Alt["FieldExpressionComposer"]:
        return Alt(
            composer
            for scalar in self.inner_scalar
            for composer in scalar.field_expr_composer
            if self.ts_decon.get_scalar()
        )

    @cached_property
    def list_field_composer(self) -> Alt["FieldExpressionComposer"]:
        return Alt(
            FieldExpressionComposer(
                import_expr(self.idol_mar.marshmallow_field_exported("List")),
                [field_composer.field_instance_expr()],
            )
            for scalar in self.inner_scalar
            for field_composer in scalar.field_expr_composer
            if self.ts_decon.get_repeated()
        )

    @cached_property
    def map_field_composer(self) -> Alt["FieldExpressionComposer"]:
        if self.ts_decon.get_map():
            return Alt.lift(
                FieldExpressionComposer(
                    import_expr(self.idol_mar.marshmallow_field_exported("Dict"))
                )
            )
        return Alt.empty()


class IdolMarCodegenTypeStructDeclaration(IdolMarCodegenTypeStruct, AbstractGeneratorFileContext):
    path: Path
    codegen_file: "IdolMarCodegenFile"

    def __init__(self, parent: "IdolMarCodegenFile", ts_decon: TypeStructDeconstructor):
        super(IdolMarCodegenTypeStructDeclaration, self).__init__(parent.idol_mar, ts_decon)
        self.codegen_file = parent
        self.path = parent.path

    @cached_property
    def declared_field(self) -> Alt[Exported]:
        return Alt(
            self.export(
                self.codegen_file.default_field_name,
                scripter.assignable(
                    self.apply_expr(
                        composer.curried_field_declaration_expr(
                            self.codegen_file.default_field_name, self.idol_mar
                        )
                    )
                ),
            )
            for composer in self.field_composer
        )

    @cached_property
    def declared_schema(self) -> Alt[Exported]:
        for scalar in self.ts_decon.get_scalar():
            for ref in scalar.get_alias():
                schema: Alt[Exported] = (
                    self.codegen_file.idol_mar.scaffold_file(ref).declared_schema
                    if ref.qualified_name in self.config.params.scaffold_types.obj
                    else self.codegen_file.idol_mar.codegen_file(ref).declared_schema
                )

                for exported_schema in schema:
                    return Alt.lift(
                        self.export(
                            self.codegen_file.default_schema_name,
                            scripter.assignable(self.import_ident(exported_schema)),
                        )
                    )

        return Alt.lift(
            self.export(
                self.codegen_file.default_schema_name, scripter.assignable(scripter.literal(None))
            )
        )


class IdolMarScaffoldFile(GeneratorFileContext):
    t: Type
    idol_mar: "IdolMarshmallow"

    def __init__(self, idol_mar: "IdolMarshmallow", t: Type, path: Path):
        self.t = t
        self.idol_mar = idol_mar
        super(IdolMarScaffoldFile, self).__init__(idol_mar, path)

        self.reserve_ident(self.default_schema_name)

    @cached_property
    def declared_schema(self) -> Alt[Exported]:
        type_decon = get_material_type_deconstructor(self.idol_mar.config.params.all_types, self.t)

        codegen_schema_ident: Alt[str] = Alt(
            self.import_ident(codegen_schema, self.default_schema_name + "Codegen")
            for codegen_schema in self.idol_mar.codegen_file(self.t.named).declared_schema
            if type_decon.get_struct()
        )

        return Alt(
            self.export(
                self.default_schema_name,
                scripter.nameable_class_dec(
                    [codegen_ident], [], doc_str=get_tag_values(self.t.tags, "description")
                ),
            )
            for codegen_ident in codegen_schema_ident
            if type_decon.get_struct()
        )

    @property
    def default_schema_name(self) -> str:
        return self.t.named.type_name


class IdolMarFile(ExternFileContext):
    idol_mar: "IdolMarshmallow"

    EXTERN_FILE = os.path.join(os.path.dirname(__file__), "__idol_mar__.py")

    def __init__(self, idol_mar: "IdolMarshmallow", path: Path):
        self.idol_mar = idol_mar
        super(IdolMarFile, self).__init__(idol_mar, path)

    @cached_property
    def any(self) -> Exported:
        return self.export_extern("Any")

    @cached_property
    def wrap_field(self) -> Exported:
        return self.export_extern("wrap_field")


class IdolMarCodegenFile(GeneratorFileContext):
    t: Type
    idol_mar: "IdolMarshmallow"
    t_decon: TypeDeconstructor

    IdolMarCodegenTypeStructDeclaration = IdolMarCodegenTypeStructDeclaration
    IdolMarCodegenEnum = IdolMarCodegenEnum
    IdolMarCodegenStruct = IdolMarCodegenStruct
    IdolMarCodegenTypeStruct = IdolMarCodegenTypeStruct

    def __init__(self, idol_mar: "IdolMarshmallow", t: Type, path: Path):
        self.t = t
        self.idol_mar = idol_mar
        self.t_decon = TypeDeconstructor(t)
        super(IdolMarCodegenFile, self).__init__(idol_mar, path)

        self.reserve_ident(self.default_schema_name)
        self.reserve_ident(self.default_field_name)

    @cached_property
    def declared_field(self) -> Alt[Exported]:
        declared_field: Alt[Exported] = Alt(
            v for typestruct in self.typestruct for v in typestruct.declared_field
        )

        declared_field ^= Alt(v for enum in self.enum for v in enum.declared_field)
        declared_field ^= Alt(v for struct in self.struct for v in struct.declared_field)

        return declared_field

    @cached_property
    def declared_schema(self) -> Alt[Exported]:
        declared_schema: Alt[Exported] = Alt(
            v for typestruct in self.typestruct for v in typestruct.declared_schema
        )

        declared_schema ^= Alt(v for enum in self.enum for v in enum.declared_schema)
        declared_schema ^= Alt(v for struct in self.struct for v in struct.declared_schema)

        return declared_schema

    @cached_property
    def declared_default_factory(self) -> Alt[Exported]:
        return Alt.empty()

    @property
    def default_default_factory_name(self) -> str:
        return f"{self.t.named.as_qualified_ident}Default"

    @property
    def default_field_name(self) -> str:
        return f"{self.t.named.as_qualified_ident}Field"

    @property
    def default_schema_name(self) -> str:
        return f"{self.t.named.as_qualified_ident}Schema"

    @cached_property
    def typestruct(self) -> "Alt[IdolMarCodegenTypeStructDeclaration]":
        return Alt(
            self.IdolMarCodegenTypeStructDeclaration(self, ts_decon)
            for ts_decon in self.t_decon.get_typestruct()
        )

    @cached_property
    def enum(self) -> "Alt[IdolMarCodegenEnum]":
        return Alt(self.IdolMarCodegenEnum(self, options) for options in self.t_decon.get_enum())

    @cached_property
    def struct(self) -> "Alt[IdolMarCodegenStruct]":
        return Alt(
            self.IdolMarCodegenStruct(
                self,
                OrderedObj.from_iterable(
                    OrderedObj({k: self.IdolMarCodegenTypeStruct(self.idol_mar, ts_decon)})
                    for k, ts_decon in fields
                ),
            )
            for fields in self.t_decon.get_struct()
        )


class IdolMarshmallow(GeneratorContext):
    scaffolds: Dict[str, "IdolMarScaffoldFile"]
    codegens: Dict[str, "IdolMarCodegenFile"]

    IdolMarScaffoldFile = IdolMarScaffoldFile
    IdolMarCodegenFile = IdolMarCodegenFile
    IdolMarFile = IdolMarFile

    def __init__(self, config: GeneratorConfig):
        super(IdolMarshmallow, self).__init__(GeneratorAcc(), config)
        self.scaffolds = {}
        self.codegens = {}

    def scaffold_file(self, ref: Reference) -> "IdolMarScaffoldFile":
        path = self.state.reserve_path(**self.config.paths_of(scaffold=ref))
        t = self.config.params.all_types.obj[ref.qualified_name]

        if t.named.qualified_name not in self.scaffolds:
            self.scaffolds[t.named.qualified_name] = self.IdolMarScaffoldFile(self, t, path)

        return self.scaffolds[t.named.qualified_name]

    def codegen_file(self, ref: Reference) -> "IdolMarCodegenFile":
        path = self.state.reserve_path(**self.config.paths_of(codegen=ref))
        t = self.config.params.all_types.obj[ref.qualified_name]

        if t.named.qualified_name not in self.codegens:
            self.codegens[t.named.qualified_name] = self.IdolMarCodegenFile(self, t, path)

        return self.codegens[ref.qualified_name]

    @cached_property
    def idol_mar_file(self) -> "IdolMarFile":
        path = self.state.reserve_path(runtime=self.config.codegen_root + "/__idol__.py")
        return self.IdolMarFile(self, path)

    def render(self) -> OrderedObj[str]:
        for i, t in enumerate(self.config.params.scaffold_types.values()):
            for export in self.scaffold_file(t.named).declared_schema:
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
                    "This file was generated by idol_mar, any changes will be lost when idol_mar is rerun again",
                ],
                scaffold=[
                    "This file was scaffold by idol_mar, but it will not be overwritten, so feel free to edit.",
                    "This file will be regenerated if you delete it.",
                ],
            )
        )

    @classmethod
    def marshmallow_field_exported(cls, ident: str) -> Exported:
        return Exported(Path("marshmallow.fields"), ident)


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

    idol_mar = IdolMarshmallow(config)
    move_to = build(config, idol_mar.render())
    move_to(params.output_dir)


if __name__ == "__main__":
    main()
