/* This file was scaffolded by idol_js.js  Please feel free to modify and extend, but do not delete or remove its exports. */
import { schemaField } from "./../codegen/schema/Field";

export class Field extends schemaField {
  getTagValue(tag: string, d: string) {
    return getTagValue(this.tags, tag, d);
  }
}
