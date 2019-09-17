/* This file was scaffolded by idol_js.js  Please feel free to modify and extend, but do not delete or remove its exports. */
import { schemaTypeStruct } from "./../codegen/schema/TypeStruct";
import { PrimitiveType } from "./PrimitiveType";

export class TypeStruct extends schemaTypeStruct {
  get isPrimitive() {
    return !this.isAlias;
  }

  get isAlias() {
    return !!this.reference.typeName;
  }

  get isLiteral() {
    return !!this.literal;
  }

  get literalValue(): ?(string | number | boolean) {
    if (this.literal != null) {
      switch (this.primitiveType) {
        case PrimitiveType.STRING:
          return this.literal.string;
        case PrimitiveType.DOUBLE:
          return this.literal.double;
        case PrimitiveType.BOOL:
          return this.literal.bool;
        case PrimitiveType.INT:
          return this.literal.int;
      }
    }
  }
}
