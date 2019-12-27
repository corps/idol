#! /usr/bin/env python3

from cached_property import cached_property
from typing import List, Dict, Optional

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
    AbstractGeneratorFileContext,
    as_expression,
)
from idol.py.schema.primitive_type import PrimitiveType
from idol.py.schema.reference import Reference
from idol.py.schema.type import Type


class IdolDataCodegenStruct(GeneratorFileContext):
    codegen_file: "IdolDataCodegenFile"
    fields: OrderedObj["IdolDataCodegenTypeStruct"]

    def __init__(
        self, codegen_file: "IdolDataCodegenFile", fields: "OrderedObj[IdolDataCodegenTypeStruct]"
    ):
        self.fields = fields
        self.codegen_file = codegen_file
        super(IdolDataCodegenStruct, self).__init__(codegen_file.parent, codegen_file.path)
        self.reserve_ident(self.default_dataclass_name)

    @property
    def default_dataclass_name(self) -> str:
        return f"{self.codegen_file.t.named.as_qualified_ident}Dataclass"

    @cached_property
    def default_factory_expr(self) -> Alt[Expression]:
        return Alt(import_expr(dc) for dc in self.codegen_file.declared_field_constructor)

    @cached_property
    def declared_dataclass(self) -> Alt[Exported]:
        return Alt.lift(
            self.export(
                self.default_dataclass_name,
                scripter.nameable_class_dec(
                    [],
                    [
                        line
                        for field_name, field in self.fields
                        for typing_expr in field.typing_expr
                        for default_factory_expr in field.default_factory_expr
                        for line in (
                            scripter.comments(
                                get_tag_values(field.ts_decon.context.field_tags, "description")
                            )
                            + [
                                scripter.assignment(
                                    get_safe_ident(field_name),
                                    self.apply_expr(
                                        self.dataclass_field_expr(
                                            default_factory=default_factory_expr
                                        )
                                    ),
                                    typing=self.apply_expr(typing_expr),
                                )
                            ]
                        )
                    ],
                    doc_str=get_tag_values(self.codegen_file.t.tags, "description"),
                    decorators=[self.import_ident(Exported(Path("dataclasses"), "dataclass"))],
                ),
            )
        )

    def dataclass_field_expr(
        self, default: Optional[Expression] = None, default_factory: Optional[Expression] = None
    ) -> Optional[Expression]:
        def expr(state: GeneratorAcc, path: Path) -> str:
            kwds = {}
            if default:
                kwds["default"] = default(state, path)
            if default_factory:
                kwds["default_factory"] = default_factory(state, path)

            return scripter.invocation(
                state.import_ident(path, Exported(Path("dataclasses"), "field")), **kwds
            )

        return expr


class IdolDataCodegenEnum(GeneratorFileContext):
    codegen_file: "IdolDataCodegenFile"
    options: List[str]

    def __init__(self, codegen_file: "IdolDataCodegenFile", options: List[str]):
        self.options = options
        self.codegen_file = codegen_file
        super(IdolDataCodegenEnum, self).__init__(codegen_file.parent, codegen_file.path)

        self.reserve_ident(self.default_enum_name)

    @cached_property
    def default_factory_expr(self) -> Alt[Expression]:
        for declared_enum in self.codegen_file.declared_field_constructor:
            def inner(state: GeneratorAcc, path: Path) -> str:
                return scripter.thunk(
                    scripter.invocation(
                        "next", scripter.invocation("iter", state.import_ident(path, declared_enum))
                    )
                )

            return Alt.lift(inner)

        return Alt.empty()

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

    @property
    def default_enum_name(self):
        return self.codegen_file.t.named.as_qualified_ident + "Enum"


class IdolDataCodegenScalar(GeneratorContext):
    idol_data: "IdolDataclass"
    scalar_dec: ScalarDeconstructor

    def __init__(self, parent: "IdolDataclass", scalar_decon: ScalarDeconstructor):
        super(IdolDataCodegenScalar, self).__init__(parent.state, parent.config)
        self.scalar_dec = scalar_decon
        self.idol_data = parent

    @cached_property
    def typing_expr(self) -> Alt[Expression]:
        return self.reference_import_expr ^ self.prim_typing_expr ^ self.literal_typing_expr

    @cached_property
    def default_factory_expr(self) -> Alt[Expression]:
        for type_decon in self.material_type_decon:
            codegen_file = self.idol_data.codegen_file(type_decon.t.named)
            return codegen_file.default_factory_expr

        return Alt(
            as_expression(scripter.thunk(scripter.literal(val)))
            for _, val in self.scalar_dec.get_literal()
        ) ^ Alt(
            as_expression(scripter.thunk(scripter.literal(self.scalar_primitive_default_map[prim])))
            for prim in self.scalar_dec.get_primitive()
            if prim in self.scalar_primitive_default_map
        )

    @cached_property
    def material_type_decon(self) -> Alt[TypeDeconstructor]:
        return Alt(
            get_material_type_deconstructor(
                self.idol_data.config.params.all_types,
                self.idol_data.config.params.all_types.obj[ref.qualified_name],
            )
            for ref in self.scalar_dec.get_alias()
        )

    @cached_property
    def reference_import_expr(self) -> Alt[Expression]:
        return Alt(
            import_expr(con)
            for ref in self.scalar_dec.get_alias()
            for con in self.idol_data.codegen_file(ref).declared_field_constructor
        )

    @cached_property
    def literal_typing_expr(self) -> Alt[Expression]:
        return Alt(
            self.scalar_primitive_type_map[prim_type]
            for prim_type, _ in self.scalar_dec.get_literal()
            if prim_type in self.scalar_primitive_type_map
        )

    @cached_property
    def prim_typing_expr(self) -> Alt[Expression]:
        scalar_prim: Alt[PrimitiveType] = self.scalar_dec.get_primitive()

        return Alt(
            self.scalar_primitive_type_map[prim_type]
            for prim_type in scalar_prim
            if prim_type in self.scalar_primitive_type_map
        )

    @cached_property
    def scalar_primitive_type_map(self) -> Dict[PrimitiveType, Expression]:
        return {
            PrimitiveType.BOOL: as_expression("bool"),
            PrimitiveType.INT: as_expression("int"),
            PrimitiveType.STRING: as_expression("str"),
            PrimitiveType.DOUBLE: as_expression("float"),
            PrimitiveType.ANY: as_expression("any"),
        }

    @cached_property
    def scalar_primitive_default_map(self) -> Dict[PrimitiveType, any]:
        return {
            PrimitiveType.BOOL: False,
            PrimitiveType.INT: 0,
            PrimitiveType.STRING: "",
            PrimitiveType.DOUBLE: 0.0,
            PrimitiveType.ANY: {},
        }


class IdolDataCodegenTypeStruct(GeneratorContext):
    ts_decon: TypeStructDeconstructor
    idol_data: "IdolDataclass"

    IdolDataCodegenScalar = IdolDataCodegenScalar

    def __init__(self, parent: "IdolDataclass", ts_decon: TypeStructDeconstructor):
        super(IdolDataCodegenTypeStruct, self).__init__(parent.state, parent.config)
        self.ts_decon = ts_decon
        self.idol_data = parent

    @cached_property
    def inner_scalar(self) -> "Alt[IdolDataCodegenScalar]":
        return Alt(
            self.IdolDataCodegenScalar(self.idol_data, scalar_decon)
            for scalar_decon in (
                self.ts_decon.get_scalar() ^ self.ts_decon.get_map() ^ self.ts_decon.get_repeated()
            )
        )

    @cached_property
    def default_factory_expr(self) -> Alt[Expression]:
        if includes_tag(self.ts_decon.context.field_tags, "optional"):
            return Alt.lift(as_expression(scripter.thunk("None")))

        return (
            Alt(as_expression("list") for _ in self.ts_decon.get_repeated())
            ^ Alt(as_expression("dict") for _ in self.ts_decon.get_map())
            ^ Alt(
                expr
                for scalar in self.inner_scalar
                for expr in scalar.default_factory_expr
                if self.ts_decon.get_scalar()
            )
        )

    @cached_property
    def typing_expr(self) -> Alt[Expression]:
        def repeated_expr(scalar_typing_expr: Expression) -> Expression:
            def inner(state: GeneratorAcc, path: Path) -> str:
                return scripter.index_access(
                    state.import_ident(path, Exported(Path("typing"), "List")),
                    scalar_typing_expr(state, path),
                )

            return inner

        def map_expr(scalar_typing_expr: Expression) -> Expression:
            def inner(state: GeneratorAcc, path: Path) -> str:
                return scripter.index_access(
                    state.import_ident(path, Exported(Path("typing"), "Mapping")),
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

        container_typing: Alt[Expression] = Alt(
            repeated_expr(scalar_typing_expr)
            for scalar in self.inner_scalar
            for scalar_typing_expr in scalar.typing_expr
            if self.ts_decon.get_repeated()
        )

        container_typing ^= Alt(
            map_expr(scalar_typing_expr)
            for scalar in self.inner_scalar
            for scalar_typing_expr in scalar.typing_expr
            if self.ts_decon.get_map()
        )

        typing = container_typing + Alt(
            expr for scalar in self.inner_scalar for expr in scalar.typing_expr
        )

        if includes_tag(self.ts_decon.context.field_tags, "optional"):
            return Alt(optional_expr(typing_expr) for typing_expr in typing)

        return typing


class IdolDataCodegenTypeStructDeclaration(IdolDataCodegenTypeStruct, AbstractGeneratorFileContext):
    path: Path
    codegen_file: "IdolDataCodegenFile"

    def __init__(self, parent: "IdolDataCodegenFile", ts_decon: TypeStructDeconstructor):
        super(IdolDataCodegenTypeStructDeclaration, self).__init__(parent.idol_data, ts_decon)
        self.codegen_file = parent
        self.path = parent.path

        self.reserve_ident(self.default_declared_typing_name)

    @cached_property
    def declared_field_typing(self) -> Alt[Exported]:
        return Alt(
            self.export(
                self.default_declared_typing_name, scripter.assignable(self.apply_expr(typing_expr))
            )
            for typing_expr in self.typing_expr
        )

    @cached_property
    def default_declared_typing_name(self) -> str:
        return self.codegen_file.t.named.type_name


class IdolDataScaffoldFile(GeneratorFileContext):
    t: Type
    idol_data: "IdolDataclass"

    def __init__(self, idol_data: "IdolDataclass", t: Type, path: Path):
        self.t = t
        self.idol_data = idol_data
        super(IdolDataScaffoldFile, self).__init__(idol_data, path)

        self.reserve_ident(self.default_dataclass_name)

    @cached_property
    def declared_dataclass(self) -> Alt[Exported]:
        type_decon = get_material_type_deconstructor(self.idol_data.config.params.all_types, self.t)

        codegen_ident: Alt[str] = Alt(
            self.import_ident(codegen_schema, self.default_dataclass_name + "Codegen")
            for codegen_schema in self.idol_data.codegen_file(self.t.named).declared_constructor
            if type_decon.get_struct() or type_decon.get_enum()
        )

        return Alt(
            self.export(
                self.default_dataclass_name,
                scripter.nameable_class_dec(
                    [ident], [], doc_str=get_tag_values(self.t.tags, "description")
                ),
            )
            for ident in codegen_ident
        )

    @property
    def default_dataclass_name(self) -> str:
        return self.t.named.type_name


class IdolDataCodegenFile(GeneratorFileContext):
    t: Type
    idol_data: "IdolDataclass"
    t_decon: TypeDeconstructor

    IdolDataCodegenTypeStructDeclaration = IdolDataCodegenTypeStructDeclaration
    IdolDataCodegenEnum = IdolDataCodegenEnum
    IdolDataCodegenStruct = IdolDataCodegenStruct
    IdolDataCodegenTypeStruct = IdolDataCodegenTypeStruct

    def __init__(self, idol_data: "IdolDataclass", t: Type, path: Path):
        self.t = t
        self.idol_data = idol_data
        self.t_decon = TypeDeconstructor(t)
        super(IdolDataCodegenFile, self).__init__(idol_data, path)

    @cached_property
    def default_factory_expr(self) -> Alt[Expression]:
        return (
            Alt(expr for struct in self.struct for expr in struct.default_factory_expr)
            ^ Alt(expr for enum in self.enum for expr in enum.default_factory_expr)
            ^ Alt(expr for ts in self.typestruct for expr in ts.default_factory_expr)
        )

    @cached_property
    def declared_constructor(self) -> Alt[Exported]:
        result: Alt[Exported] = Alt(
            v for typestruct in self.typestruct for v in typestruct.declared_field_typing
        )

        result ^= Alt(v for enum in self.enum for v in enum.declared_enum)
        result ^= Alt(v for struct in self.struct for v in struct.declared_dataclass)

        return result

    @cached_property
    def declared_field_constructor(self) -> Alt[Exported]:
        """
        Used as an indirection that may either be the declared_constructor generated by this
        codegen file, or the scaffold wrapper generated for types that are included in
        the scaffold.  Used by embedded references to this type.
        """
        return Alt(
            con
            for con in self.idol_data.scaffold_file(self.t.named).declared_dataclass
            if self.struct or self.enum
            if self.t.named.qualified_name in self.idol_data.config.params.scaffold_types.obj
        ) + self.declared_constructor

    @cached_property
    def typestruct(self) -> "Alt[IdolDataCodegenTypeStructDeclaration]":
        return Alt(
            self.IdolDataCodegenTypeStructDeclaration(self, ts_decon)
            for ts_decon in self.t_decon.get_typestruct()
        )

    @cached_property
    def enum(self) -> "Alt[IdolDataCodegenEnum]":
        return Alt(self.IdolDataCodegenEnum(self, options) for options in self.t_decon.get_enum())

    @cached_property
    def struct(self) -> "Alt[IdolDataCodegenStruct]":
        return Alt(
            self.IdolDataCodegenStruct(
                self,
                OrderedObj.from_iterable(
                    OrderedObj({k: self.IdolDataCodegenTypeStruct(self.idol_data, ts_decon)})
                    for k, ts_decon in fields
                ),
            )
            for fields in self.t_decon.get_struct()
        )


class IdolDataclass(GeneratorContext):
    scaffolds: Dict[str, "IdolDataScaffoldFile"]
    codegens: Dict[str, "IdolDataCodegenFile"]

    IdolDataScaffoldFile = IdolDataScaffoldFile
    IdolDataCodegenFile = IdolDataCodegenFile

    def __init__(self, config: GeneratorConfig):
        super(IdolDataclass, self).__init__(GeneratorAcc(), config)
        self.scaffolds = {}
        self.codegens = {}

    def scaffold_file(self, ref: Reference) -> "IdolDataScaffoldFile":
        path = self.state.reserve_path(**self.config.paths_of(scaffold=ref))
        t = self.config.params.all_types.obj[ref.qualified_name]

        if t.named.qualified_name not in self.scaffolds:
            self.scaffolds[t.named.qualified_name] = self.IdolDataScaffoldFile(self, t, path)

        return self.scaffolds[t.named.qualified_name]

    def codegen_file(self, ref: Reference) -> "IdolDataCodegenFile":
        path = self.state.reserve_path(**self.config.paths_of(codegen=ref))
        t = self.config.params.all_types.obj[ref.qualified_name]

        if t.named.qualified_name not in self.codegens:
            self.codegens[t.named.qualified_name] = self.IdolDataCodegenFile(self, t, path)

        return self.codegens[ref.qualified_name]

    def render(self) -> OrderedObj[str]:
        for i, t in enumerate(self.config.params.scaffold_types.values()):
            for export in self.scaffold_file(t.named).declared_dataclass:
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
                    "This file was generated by idol_data, any changes will be lost when idol_data is rerun again",
                ],
                scaffold=[
                    "This file was scaffold by idol_data, but it will not be overwritten, so feel free to edit.",
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
                "target": "idol module names",
                "output": "a directory to generate the dataclasses into.",
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

    idol_data = IdolDataclass(config)
    move_to = build(config, idol_data.render())
    move_to(params.output_dir)


if __name__ == "__main__":
    main()
