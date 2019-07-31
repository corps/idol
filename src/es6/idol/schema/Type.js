/* This file was scaffolded by idol_js.js  Please feel free to modify and extend, but do not delete or remove its exports. */
import { schemaType } from "./../codegen/schema/Type";
import { getTagValue } from "../utils";

export class Type extends schemaType {
    get isEnum() {
        return !!this.options.length;
    }

    getTagValue(tag: string, d: string) {
        return getTagValue(this.tags, tag, d);
    }
}
