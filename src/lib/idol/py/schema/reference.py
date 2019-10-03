from ..codegen.schema.reference import SchemaReference
import re


class Reference(SchemaReference):
    @property
    def as_qn_path(self):
        return "/".join(self.snakify().qualified_name.split(".")) + ".py"

    @property
    def as_type_path(self):
        return "/".join(self.snakify().type_name.split(".")) + ".py"

    @property
    def as_module_path(self):
        return "/".join(self.snakify().module_name.split(".")) + ".py"

    @property
    def as_qualified_ident(self) -> str:
        cameled = self.camelify()
        return cameled.module_name[0].upper() + cameled.module_name[1:] + cameled.type_name

    def camelify(self) -> "Reference":
        def camelify(name):
            return "".join(p[0].upper() + p[1:] for p in re.split("[._]", name) if p)

        return Reference(
            {
                "module_name": camelify(self.module_name),
                "qualified_name": camelify(self.qualified_name),
                "type_name": camelify(self.type_name),
            }
        )

    def snakify(self) -> "Reference":
        def snakify(name):
            first_pass = re.sub("([^.])([A-Z][a-z]+)", r"\1_\2", name)
            return re.sub("([a-z0-9])([A-Z])", r"\1_\2", first_pass).lower()

        return Reference(
            {
                "module_name": snakify(self.module_name),
                "qualified_name": snakify(self.qualified_name),
                "type_name": snakify(self.type_name),
            }
        )
