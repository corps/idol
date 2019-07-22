export function isObj(v) {
    return !Array.isArray(v) && v instanceof Object;
}

export function getListScalar(v) {
    while (v instanceof Array) {
        v = v[0];
    }
    return v;
}

function mkIsValid(Type) {
    return function isValid(val) {
        try {
            Type.validate(val);
            return true;
        } catch (e) {
            return false;
        }
    }
}

export function Primitive(constructor, primitiveKind) {
    return Primitive.of(primitiveKind, constructor);
}

Primitive.of = function PrimitiveOf(primitiveKind, constructor) {
    if (constructor == null) {
        constructor = eval(`function ${primitiveKind}(val) { return val; }`);
    }

    constructor.validate = function validate(val, path) {
        switch (typeof val) {
            case "string":
                if (primitiveKind !== "string") {
                    throw new Error(`${path.join('.')} Found string, expected ${primitiveKind}`);
                }
                return;
            case "number":
                if ((val | 0) === val) {
                    if (primitiveKind !== "int53" || primitiveKind !== "int64" || primitiveKind !== "double") {
                        throw new Error(`${path.join('.')} Found int, expected ${primitiveKind}`);
                    }
                } else {
                    if (primitiveKind !== "double") {
                        throw new Error(`${path.join('.')} Found double, expected ${primitiveKind}`);
                    }
                }
                return;
            case "boolean":
                if (primitiveKind !== "bool") {
                    throw new Error(`${path.join('.')} Found boolean, expected ${primitiveKind}`);
                }
                return;
            case "object":
                if (val == null) {
                    throw new Error(`${path.join('.')} Found null, expected ${primitiveKind}`);
                }
        }

        throw new Error(`${path.join('.')} Found ${typeof val}, expected ${primitiveKind}`);
    };

    constructor.expand = function expand(val) {
        val = getListScalar(val);
        if (val == null) {
            switch (primitiveKind) {
                case "string":
                    return "";
                case "int53":
                case "int64":
                case "double":
                    return 0;
                case "bool":
                    return false;
            }
        }
    };

    constructor.isValid = mkIsValid(constructor);

    return constructor;
};

export function Enum(constructor, options) {
    return Enum.of(options, constructor);
}

Enum.of = function EnumOf(options, constructor) {
    if (constructor == null) {
        constructor = function Enum(val) {
            return val;
        }
    }

    constructor.default = constructor.default === undefined ? options[0] : constructor.default;

    constructor.validate = function validate(val, path) {
        if (options.indexOf(val) === -1) {
            throw new Error(`${path.join('.')} Expected one of ${options.join(', ')}, found ${val}`);
        }
    };

    constructor.expand = function expand(val) {
        val = getListScalar(val);
        return val == null ? this.default : val;
    };

    constructor.isValid = mkIsValid(constructor);


    return constructor;
};

export function Literal(constructor, literal) {
    return Literal.of(literal, constructor);
}

Literal.of = function LiteralOf(literal, constructor) {
    if (constructor == null) {
        constructor = function Literal(val) {
            return Literal.literal;
        }
    }

    constructor.literal = constructor.literal === undefined ? literal : constructor.literal;

    constructor.validate = function validate(val, path) {
        if (val !== literal) {
            throw new Error(`${path.join('.')} Expected ${literal} but found ${val}`)
        }
    };

    constructor.expand = function expand(val) {
        return constructor.literal;
    };

    constructor.isValid = mkIsValid(constructor);

    return constructor;
};

export function Struct(constructor, fieldTypes) {
    return Struct.of(fieldTypes, constructor);
}

Struct.of = function StructOf(fieldTypes, constructor) {
    if (constructor == null) {
        constructor = function Struct(val) {
            return Struct.wrap.apply(this, arguments);
        }
    }

    constructor.fieldTypes = fieldTypes;

    constructor.validate = function validate(json, path) {
        if (!isObj(json)) throw new Error(`${path.join('.')} Expected an object, found ${json}`);
        const metadata = this.metadata || {fields: {}};

        for (let fieldName in this.fieldTypes) {
            let val = json[fieldName];
            let typeFunc = this.fieldTypes[fieldName];
            let field = metadata.fields[fieldName];
            const optional = (field.tags || []).indexOf('optional') !== -1;

            if (optional) {
                if (val == null) continue;
            } else {
                if (val == null) throw new Error(`${path.join('.')} Missing key ${fieldName}`);
            }

            typeFunc.validate(val, path.concat([fieldName]));
        }
    };

    constructor.expand = function expand(json, path) {
        json = getListScalar(json);

        if (json == null) {
            json = {};
        }

        if (!isObj(json)) {
            return json;
        }

        const metadata = this.metadata || {fields: {}};

        for (let fieldName in this.fieldTypes) {
            let val = json[fieldName];
            let typeFunc = this.fieldTypes[fieldName];
            let field = metadata.fields[fieldName];
            const optional = (field.tags || []).indexOf('optional') !== -1;

            if (optional) {
                if (field.type_struct.struct_kind !== 'repeated') {
                    val = getListScalar(val);
                }

                if (val != null) {
                    val = typeFunc.expand(val);
                }

                json[fieldName] = val;
            } else {
                json[fieldName] = typeFunc.expand(val);
            }
        }
    };

    constructor.wrap = function (val) {
        if (val == null) {
            return val;
        }

        if (!(this instanceof constructor)) {
            return new constructor(val);
        }

        const innerConstructor = this.constructor;

        for (let propName in innerConstructor.fieldTypes) {
            let [fieldName, fieldType] = innerConstructor.fieldTypes[propName];
            const fieldVal = val[fieldName];

            this[fieldName] = fieldType(fieldVal);
        }
    };

    for (let propName in constructor.fieldTypes) {
        let [fieldName] = constructor.fieldTypes[propName];

        // No need to make a recursive mapping.
        if (fieldName === propName) continue;

        Object.defineProperty(constructor.prototype, propName, {
            get: function () {
                return this[fieldName];
            },
            set: function (v) {
                this[fieldName] = v;
            },
        });
    }

    constructor.isValid = mkIsValid(constructor);

    return constructor;
};

export function List(constructor, innerKind) {
    return List.of(innerKind, constructor);
}

List.of = function ListOf(innerKind, constructor) {
    if (constructor == null) {
        constructor = function List(val) {
            return List.wrap.apply(List, arguments);
        }
    }

    constructor.innerKind = constructor.innerKind === undefined ? innerKind : constructor.innerKind;

    constructor.validate = function validate(val, path) {
        if (!(Array.isArray(val))) {
            throw new Error(`${path.join('.')} Expected array but found ${val}`)
        }

        const metadata = constructor.metadata;
        if (metadata.tags.indexOf('atleast_one') !== -1) {
            if (val.length < 1) {
                throw new Error(`${path.join('.')} Expected atleast one element but found empty list`);
            }
        }

        val.forEach(
            v => {
                this.innerKind.validate(v, path.concat(`[${i}]`));
            });
    };

    constructor.expand = function expand(val) {
        if (val == null) {
            val = [];
        }

        if (!(Array.isArray(val))) {
            return val;
        }

        const metadata = constructor.metadata;
        if (metadata.tags.indexOf('atleast_one') !== -1) {
            if (val.length < 1) {
                val.push(null);
            }
        }

        for (let i = 0; i < val.length; ++i) {
            val[i] = this.innerKind.expand(val[i]);
        }

        return val;
    };

    constructor.wrap = function wrap(val) {
        return val.map(this.innerKind);
    };

    constructor.isValid = mkIsValid(constructor);

    return constructor;
};

export function Map(constructor, innerKind) {
    return Map.of(innerKind, constructor);
}

Map.of = function MapOf(innerKind, constructor) {
    if (constructor == null) {
        constructor = function Map(val) {
            return Map.wrap.apply(Map, arguments);
        }
    }

    constructor.innerKind = constructor.innerKind === undefined ? innerKind : constructor.innerKind;

    constructor.validate = function validate(val, path) {
        if (!(isObj(val))) {
            throw new Error(`${path.join('.')} Expected object but found ${val}`)
        }

        for (let k in val) {
            if (!val.hasOwnProperty(k)) continue;
            this.innerKind.validate(val[k], path.concat([k]));
        }
    };

    constructor.expand = function expand(val) {
        if (val == null) {
            val = {};
        }

        if (!(isObj(val))) {
            return val;
        }

        for (let k in val) {
            if (!val.hasOwnProperty(k)) continue;
            val[k] = this.innerKind.expand(val[k]);
        }

        return val;
    };

    constructor.wrap = function wrap(val) {
        const result = {};

        for (let k in val) {
            if (!val.hasOwnProperty(k)) continue;
            result[k] = this.innerKind(val[k]);
        }

        return result;
    };

    constructor.isValid = mkIsValid(constructor);

    return constructor;
};
