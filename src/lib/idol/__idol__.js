export function isObj(v) {
    return !Array.isArray(v) && v instanceof Object;
}

export function getListScalar(v) {
    while (v instanceof Array) {
        v = v[0];
    }
    return v;
}

function isValid(Type) {
    return function isValid(val) {
        try {
            Type.validate(val);
            return true;
        } catch (e) {
            return false;
        }
    }
}

export function Enum(Type) {
    Object.assign(Type, {
        isValid: isValid(Type),
        validate(val) {
            if (val in Type.options) {
                return;
            }

            throw new Error(`Excepted to find one of ${Type.options.join(', ')}, found ${val}`);
        },

        expand(val) {
            return val == null ? val : this.default;
        },
    })
}

export function Struct(Type) {
    Object.assign(Type, {
        isValid: isValid(Type),
        validate(json, path = []) {
            if (!isObj(json)) throw new Error(`${path.join('.')} Expected an object, found ${json}`);
            const metadata = Type.metadata;

            for (let fieldName in metadata.fields) {
                let val = json[fieldName];
                let field = metadata.fields[fieldName];
                let optional = field.tags.indexOf('optional') !== -1;

                if (val == null) {
                    if (optional) continue;
                    throw new Error(`${path.join('.')} Missing required key ${fieldName}`);
                }

                Type.fieldTypes[fieldName].validate(val, path.concat([fieldName]));
            }
        },

        expand(json) {
            if (json == null) {
                json = {};
            }

            if (!isObj(json)) {
                return json;
            }

            const metadata = Type.metadata;

            for (let fieldName in metadata.fields) {
                let val = json[fieldName];
                let field = metadata.fields[fieldName];
                let optional = field.tags.indexOf('optional') !== -1;

                if (val == null) {
                    if (optional) val[fieldName] = null;
                    continue;
                }

                if (optional) {
                    if (field.type_struct.struct_kind !== 'repeated') {
                        val = getListScalar(val);
                    }

                    if (val != null) {
                        val = Type.fieldTypes[fieldName].expand(val);
                    }

                    json[fieldName] = val;
                } else {
                    json[fieldName] = Type.fieldTypes[fieldName].expand(val);
                }
            }

            return json;
        }
    });
}


export function wrapMap(obj, Type) {
    const result = {};

    for (let k in obj) {
        result[k] = Type(k);
    }

    return result;
}

export function Prim(val) {
    return val;
}
