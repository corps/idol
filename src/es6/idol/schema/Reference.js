// @flow
import { schemaReference } from "./../codegen/schema/Reference";
import { camelify, snakify } from "../generators";

export class Reference extends schemaReference {
  snakify(): Reference {
    return new Reference({
      module_name: snakify(this.moduleName),
      qualified_name: snakify(this.qualifiedName),
      type_name: snakify(this.typeName)
    });
  }

  camelify(): Reference {
    return new Reference({
      module_name: camelify(this.moduleName),
      qualified_name: camelify(this.qualifiedName),
      type_name: camelify(this.typeName)
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
