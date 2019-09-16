// @flow
import { schemaReference } from "./../codegen/schema/Reference";

export class Reference extends schemaReference {
    snakify(): Reference {
        function snakify(name: string): string {
            const firstPass = name.replace(/([^.])([A-Z][a-z]+)/, (_, group1, group2) => `${group1}_${group2}`);
            return firstPass.replace(/([a-z0-9])([A-Z])/, (_, group1, group2) => `${group1}_${group2}`);
        }

        return new Reference({
            "module_name": snakify(this.moduleName),
            "qualified_name": snakify(this.qualifiedName),
            "type_name": snakify(this.typeName),
        });
    }

    camelify(): Reference {
        function camelify(name: string): string {
            return name.split(/[._]/).map(p => p[0].toUpperCase() + p.slice(1)).join("");
        }

        return new Reference({
            "module_name": camelify(this.moduleName),
            "qualified_name": camelify(this.qualifiedName),
            "type_name": camelify(this.typeName),
        });
    }

    get asQnPath(): string {
        return this.qualifiedName.split(".").join("/") + ".js";
    }

    get asTypePath(): string {
        return this.typeName + ".js";
    }

    get asModulePath(): string {
        return this.moduleName.split(".").join("/") + ".js";
    }

    get asQualifiedIdent(): string {
        const cameled = this.camelify();
        return cameled.moduleName[0].toUpperCase() + cameled.moduleName.slice(1) + cameled.typeName;
    }
}
