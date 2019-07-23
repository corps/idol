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

const primCache = {};
Primitive.of = function PrimitiveOf(primitiveKind, constructor) {
    if (constructor == null) {
        const cached = primCache[primitiveKind];
        if (cached) return cached;

        constructor = function Primitive(val) { return val; }
        primCache[primitiveKind] = constructor;
    }


    constructor.validate = function validate(val, path) {
        path = path || [];
        switch (typeof val) {
            case "string":
                if (primitiveKind !== "string") {
                    throw new Error(`${path.join('.')} Found string, expected ${primitiveKind}`);
                }
                return;
            case "number":
                if ((val | 0) === val) {
                    if (primitiveKind !== "int53" && primitiveKind !== "int64" && primitiveKind !== "double") {
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

        return val;
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
        path = path || [];
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
        path = path || [];
        if (val !== this.literal) {
            throw new Error(`${path.join('.')} Expected ${this.literal} but found ${val}`)
        }
    };

    constructor.expand = function expand(val) {
        return this.literal;
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
        path = path || [];
        if (!isObj(json)) throw new Error(`${path.join('.')} Expected an object, found ${json}`);
        const metadata = this.metadata;

        this.fieldTypes.forEach(function(fieldType) {
            const fieldName = fieldType[1];
            const typeFunc = fieldType[2];
            let val = json[fieldName];
            const field = metadata.fields[fieldName];
            const optional = field.tags.indexOf('optional') !== -1;

            if (optional) {
                if (val == null) return;
            } else {
                if (val == null) throw new Error(`${path.join('.')} Missing key ${fieldName}`);
            }

            typeFunc.validate(val, path.concat([fieldName]));
        });
    };

    constructor.expand = function expand(json) {
        json = getListScalar(json);

        if (json == null) {
            json = {};
        }

        if (!isObj(json)) {
            return json;
        }

        const metadata = this.metadata;

        this.fieldTypes.forEach(function(fieldType) {
            const fieldName = fieldType[1];
            const typeFunc = fieldType[2];
            let val = json[fieldName];
            const field = metadata.fields[fieldName];
            const optional = field.tags.indexOf('optional') !== -1;

            if (optional) {
                if (field.type_struct.struct_kind !== 'repeated') {
                    val = getListScalar(val);
                }

                if (val != null) {
                    val = typeFunc.expand(val);
                } else {
                    val = null;
                }

                json[fieldName] = val;
            } else {
                json[fieldName] = typeFunc.expand(val);
            }
        });

        return json
    };

    constructor.wrap = function (val) {
        if (val == null) {
            return val;
        }

        if (!(this instanceof constructor)) {
            return new constructor(val);
        }

        const innerConstructor = this.constructor;

        const self = this;
        innerConstructor.fieldTypes.forEach(function(fieldType) {
            const fieldName = fieldType[1];
            const typeFunc = fieldType[2];
            const fieldVal = val[fieldName];
            self[fieldName] = typeFunc(fieldVal);
        });
    };

    constructor.fieldTypes.forEach(function(fieldType) {
        const propName = fieldType[0];
        const fieldName = fieldType[1];

        // No need to make a recursive mapping.
        if (fieldName === propName) return;

        Object.defineProperty(constructor.prototype, propName, {
            get: function () {
                return this[fieldName];
            },
            set: function (v) {
                this[fieldName] = v;
            },
        });
    });

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
        path = path || [];
        if (!(Array.isArray(val))) {
            throw new Error(`${path.join('.')} Expected array but found ${val}`)
        }

        const metadata = this.metadata;
        if (metadata && metadata.tags.indexOf('atleast_one') !== -1) {
            if (val.length < 1) {
                throw new Error(`${path.join('.')} Expected atleast one element but found empty list`);
            }
        }

        const innerKind = this.innerKind;
        val.forEach(
            (v, i) => {
                innerKind.validate(v, path.concat(`[${i}]`));
            });
    };

    constructor.expand = function expand(val) {
        if (val == null) {
            val = [];
        }

        if (!(Array.isArray(val))) {
            val = [val];
        }

        const metadata = this.metadata;
        if (metadata && metadata.tags.indexOf('atleast_one') !== -1) {
            if (val.length < 1) {
                val.push(null);
            }
        }

        const innerKind = this.innerKind;
        val.forEach(function(v, i) {
            val[i] = innerKind.expand(v);
        });

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
        path = path || [];
        if (!(isObj(val))) {
            throw new Error(`${path.join('.')} Expected object but found ${val}`)
        }

        const innerKind = this.innerKind;
        for (let k in val) {
            if (!val.hasOwnProperty(k)) continue;
            innerKind.validate(val[k], path.concat([k]));
        }
    };

    constructor.expand = function expand(val) {
        val = getListScalar(val);

        if (val == null) {
            val = {};
        }

        if (!(isObj(val))) {
            return val;
        }

        const innerKind = this.innerKind;
        for (let k in val) {
            if (!val.hasOwnProperty(k)) continue;
            val[k] = innerKind.expand(val[k]);
        }

        return val;
    };

    constructor.wrap = function wrap(val) {
        const result = {};

        const innerKind = this.innerKind;
        for (let k in val) {
            if (!val.hasOwnProperty(k)) continue;
            result[k] = innerKind(val[k]);
        }

        return result;
    };

    constructor.isValid = mkIsValid(constructor);

    return constructor;
};
