// @flow

export function isObj(v: any): boolean {
  return !Array.isArray(v) && v instanceof Object;
}

export function getListScalar(v: any): any {
  while (v instanceof Array) {
    v = v[0];
  }
  return v;
}

export interface IdolTypeConstructor {
  isRepeated?: boolean;
  wrap: (val: any) => any;
  unwrap: (val: any) => any;
  isValid: (val: any) => boolean;
  validate: (val: any, path?: Array<string>) => void;
  expand: (val: any) => any;
}

const primCache: { [k: string]: IdolTypeConstructor } = {};
export const Primitive = {
  of(primitiveKind: "string" | "bool" | "int" | "double"): IdolTypeConstructor {
    if (primitiveKind in primCache) {
      return primCache[primitiveKind];
    }

    function validate(val: any, path: Array<string> = []) {
      switch (typeof val) {
        case "string":
          if (primitiveKind !== "string") {
            throw new Error(`${path.join(".")} Found string, expected ${primitiveKind}`);
          }
          return;
        case "number":
          if ((val | 0) === val) {
            if (primitiveKind !== "int" && primitiveKind !== "double") {
              throw new Error(`${path.join(".")} Found int, expected ${primitiveKind}`);
            }
          } else {
            if (primitiveKind !== "double") {
              throw new Error(`${path.join(".")} Found double, expected ${primitiveKind}`);
            }
          }
          return;
        case "boolean":
          if (primitiveKind !== "bool") {
            throw new Error(`${path.join(".")} Found boolean, expected ${primitiveKind}`);
          }
          return;
        case "object":
          if (val == null) {
            throw new Error(`${path.join(".")} Found null, expected ${primitiveKind}`);
          }
      }

      throw new Error(`${path.join(".")} Found ${typeof val}, expected ${primitiveKind}`);
    }

    const result: IdolTypeConstructor = {
      validate,
      isValid(val) {
        try {
          validate(val);
          return true;
        } catch (e) {
          return false;
        }
      },
      expand(val) {
        val = getListScalar(val);
        if (val == null) {
          switch (primitiveKind) {
            case "string":
              return "";
            case "int":
            case "double":
              return 0;
            case "bool":
              return false;
          }
        }

        return val;
      },
      wrap(val) {
        return val;
      },
      unwrap(val) {
        return val;
      }
    };

    primCache[primitiveKind] = result;
    return result;
  }
};

export const Literal = {
  of(value: any): IdolTypeConstructor {
    function validate(val: any, path: Array<string> = []) {
      if (val !== value) {
        throw new Error(`${path.join(".")} Expected ${value} but found ${val}`);
      }
    }

    const result: IdolTypeConstructor = {
      validate,
      isValid(val) {
        try {
          validate(val);
          return true;
        } catch (e) {
          return false;
        }
      },
      expand(val) {
        return value;
      },
      wrap(val) {
        return val;
      },
      unwrap(val) {
        return val;
      }
    };

    return result;
  }
};

export function Enum(values: any) {
  const options = values.options;
  const def = values.default;

  function validate(val: any, path: Array<string> = []) {
    if (options.indexOf(val) === -1) {
      throw new Error(`${path.join(".")} Expected one of ${options.join(", ")}, found ${val}`);
    }
  }

  const cons: IdolTypeConstructor = {
    isValid(val: any) {
      try {
        validate(val);
        return true;
      } catch (e) {
        return false;
      }
    },
    validate,
    wrap(val: any) {
      return val;
    },
    unwrap(val: any) {
      return val;
    },
    expand(val: any) {
      val = getListScalar(val);
      return val == null ? def : val;
    }
  };

  Object.assign((values: any), (cons: any));
}

type Field = { fieldName: string, type: IdolTypeConstructor, optional: boolean };
export function Struct(klass: any, fields: Array<Field>) {
  function validate(json: any, path: Array<string> = []) {
    if (!isObj(json)) throw new Error(`${path.join(".")} Expected an object, found ${json}`);

    fields.forEach(function(field: Field) {
      const { fieldName, type, optional } = field;

      let val = json[fieldName];
      if (optional) {
        if (val == null) return;
      } else {
        if (val == null) throw new Error(`${path.join(".")} Missing key ${fieldName}`);
      }

      type.validate(val, path.concat([fieldName]));
    });
  }

  const cons: IdolTypeConstructor = {
    validate,
    isValid(val: any) {
      try {
        validate(val);
        return true;
      } catch (e) {
        return false;
      }
    },
    expand(json: any) {
      json = getListScalar(json);

      if (json == null) {
        json = {};
      }

      if (!isObj(json)) {
        return json;
      }

      fields.forEach(function(field: Field) {
        const { fieldName, type, optional } = field;

        let val = json[fieldName];

        if (optional) {
          if (!type.isRepeated) {
            val = getListScalar(val);
          }

          if (val != null) {
            val = type.expand(val);
          } else {
            val = null;
          }

          json[fieldName] = val;
        } else {
          json[fieldName] = type.expand(val);
        }
      });

      return json;
    },

    wrap(val: any) {
      if (val == null) {
        return val;
      }

      if (!(val instanceof klass)) {
        return new this(val);
      }

      return val;
    },

    unwrap(val: any) {
      if (val instanceof klass) {
        return val._original;
      }

      return val;
    }
  };

  Object.assign((klass: any), (cons: any));
}

export const List = {
  of(innerKind: IdolTypeConstructor, { atleastOne }: { atleastOne: boolean }): IdolTypeConstructor {
    function validate(val: any, path: Array<string> = []) {
      if (!Array.isArray(val)) {
        throw new Error(`${path.join(".")} Expected array but found ${val}`);
      }

      if (atleastOne) {
        if (val.length < 1) {
          throw new Error(`${path.join(".")} Expected atleast one element but found empty list`);
        }
      }

      val.forEach((v, i) => {
        innerKind.validate(v, path.concat(`[${i}]`));
      });
    }

    const result: IdolTypeConstructor = {
      isRepeated: true,
      validate,
      isValid(val) {
        try {
          validate(val);
          return true;
        } catch (e) {
          return false;
        }
      },
      expand(val) {
        if (val == null) {
          val = [];
        }

        if (!Array.isArray(val)) {
          val = [val];
        }

        if (atleastOne) {
          if (val.length < 1) {
            val.push(null);
          }
        }

        val.forEach(function(v, i) {
          val[i] = innerKind.expand(v);
        });

        return val;
      },
      wrap(val) {
        return val.map(v => innerKind.wrap(v));
      },
      unwrap(val) {
        return val.map(v => innerKind.unwrap(v));
      }
    };

    return result;
  }
};

export const Map = {
  of(innerKind: IdolTypeConstructor): IdolTypeConstructor {
    function validate(val: any, path: Array<string> = []) {
      if (!isObj(val)) {
        throw new Error(`${path.join(".")} Expected object but found ${val}`);
      }

      for (let k in val) {
        innerKind.validate(val[k], path.concat([k]));
      }
    }

    const result: IdolTypeConstructor = {
      validate,
      isValid(val: any) {
        try {
          validate(val);
          return true;
        } catch (e) {
          return false;
        }
      },
      expand(val: any) {
        val = getListScalar(val);

        if (val == null) {
          val = {};
        }

        if (!isObj(val)) {
          return val;
        }

        for (let k in val) {
          val[k] = innerKind.expand(val[k]);
        }

        return val;
      },
      wrap(val) {
        const result = {};

        for (let k in val) {
          result[k] = innerKind.wrap(val[k]);
        }

        return result;
      },
      unwrap(val) {
        return val;
      }
    };

    return result;
  }
};
