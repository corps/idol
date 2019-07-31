// @flow
import { Reference } from "./schema/Reference";

export function getTagValue(tags: string[] | typeof undefined | null, tag: string, d: string) {
    if (tags) {
        for (let i = 0; i < tags.length; ++i) {
            const tag = tags[i];
            const pre = tag.indexOf(tag + ":");
            if (pre === 0) {
                return tag.slice(pre);
            }
        }
    }

    return d;
}

export function asPath(name: string) {
    return name.replace(/\./g, '/') + ".js";
}

export function asQualifiedIdent(reference: Reference) {
    return camelCase(reference.qualified_name);
}

export function camelCase(s: string) {
    return s.replace(/([-_.][a-z])/ig, (v) => {
        return v.toUpperCase()
            .replace(/[-_.]/g, '');
    });
}

export function snakify(s: string) {
    s = s.replace(/(.)([A-Z][a-z]+)/g, (_, x, y) => x + "_" + y);
    return s.replace(/([a-z0-9])([A-Z])/g, (x, y) => x + "_" + y).toLowerCase();
}

export function relativePathFrom(from: string, to: string): string {
    const toParts = to.split("/");
    const fromParts = from.split("/");
    const parts = [];

    let i = fromParts.length - 1;
    for (; i >= 0 && fromParts.slice(0, i).toString() != toParts.slice(0, i).toString(); --i) {
        parts.push('..');
    }

    for (; i < toParts.length; ++i) {
        parts.push(toParts[i]);
    }

    return "./" + parts.join("/");
}

// Last dicth approach to recursively sorting objects that do not use OrderedObj (ie: metadata)
export function sortObj(obj: any) {
    if (obj == null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(sortObj);

    const result = {};
    const keys = [];
    for (let k in obj) {
        keys.push(k);
    }

    keys.sort();
    keys.forEach(k => result[k] = sortObj(obj[k]));
    return result;
}
