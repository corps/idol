from typing import TypeVar, MutableSequence, Optional, MutableMapping, Generic, Any, Iterable, \
    Tuple, Union
from enum import Enum as enumEnum

T = TypeVar('T')


def with_metaclass(meta, *bases):
    """Create a base class with a metaclass."""
    return meta("NewBase", bases, {})


def unwrap_value(value):
    if isinstance(value, WrapsValue):
        value = value.unwrap()

    return value


def wrap_value(expected_type, value):
    if expected_type in (Any, Optional, Union):
        return value

    origin = getattr(expected_type, '__origin__', None)

    if origin is Union:
        args = expected_type.__args__
        if len(args) != 2 or args[1] != type(None):
            raise TypeError("Only Optional is supported, other Unions are not")

        if value is None:
            return None

        expected_type = args[0]

    wrapped = False
    if origin:
        wrapped = True
    elif issubclass(expected_type, WrapsValue):
        wrapped = True

    if wrapped:
        if not isinstance(value, WrapsValue):
            value = expected_type(value)

    return value


def get_list_scalar(value):
    while isinstance(value, list):
        if value:
            value = value[0]
        else:
            value = None
    return value


def expand_primitive(primitive_type, json, optional=False):
    if primitive_type in ('int64', 'int53'):
        if json is None and not optional:
            return 0
        if isinstance(json, str):
            try:
                return int(json)
            except ValueError:
                pass

    if primitive_type == 'double':
        if json is None and not optional:
            return 0.0
        if isinstance(json, str):
            try:
                return float(json)
            except ValueError:
                pass

    if primitive_type == 'string':
        if json is None and not optional:
            return ""

    if primitive_type == 'bool':
        if json is None and not optional:
            return False

    return json


def is_valid(cls, json):
    try:
        cls.validate(json)
        return True
    except (ValueError, KeyError, TypeError):
        return False


def expand_primitive(cls, json):
    metadata = cls.__metadata__
    json = get_list_scalar(json)

    if json:
        return json

    if metadata.get('is_a', None):
        type_struct = metadata['is_a']
        primitive_type = type_struct['primitive_type']

        if primitive_type == 'int53':
            return 0
        if primitive_type == 'int64':
            return 0
        if primitive_type == 'double':
            return 0.0
        if primitive_type == 'string':
            return ""
        if primitive_type == 'boolean':
            return False

    return json


def validate_primitive(cls, json, path=[]):
    metadata = cls.__metadata__

    if metadata.get('is_a', None):
        type_struct = metadata['is_a']
        primitive_type = type_struct['primitive_type']

        if primitive_type == 'int53':
            if not isinstance(json, int):
                raise TypeError(f"{path.join(".")} Expected a int, found {type(json)}")
            if json > 9007199254740991 or json < -9007199254740991:
                raise ValueError(f"{path.join(".")} value was out of range for i53")
        if primitive_type == 'int64':
            if not isinstance(json, int):
                raise TypeError(f"{path.join(".")} Expected a int, found {type(json)}")
            if json > 9223372036854775807 or json < -9223372036854775807:
                raise ValueError(f"{path.join(".")} value was out of range for i64")
        if primitive_type == 'double':
            if not isinstance(json, float):
                raise TypeError(f"{path.join(".")} Expected a float, found {type(json)}")
        if primitive_type == 'string':
            if not isinstance(json, str):
                raise TypeError(f"{path.join(".")} Expected a str, found {type(json)}")
        if primitive_type == 'boolean':
            if not isinstance(json, bool):
                raise TypeError(f"{path.join(".")} Expected a bool, found {type(json)}")


class WrapsValue:
    @classmethod
    def is_container(cls):
        return False

    is_valid = classmethod(is_valid)

    @classmethod
    def inner_kind(cls):
        if self.is_container():
            if hasattr(self, '__orig_class__'):
                return self.__orig_class__.__args__[0]
            if hasattr(self, '__orig_bases__'):
                return self.__orig_bases__[0].__args__[0]
            return Any

    def unwrap(self):
        pass


class Literal(WrapsValue, Generic[T]):
    def __new__(cls, *args) -> T:
        return cls.literal


    @classmethod
    def validate(cls, json, path=[]):
        metadata = cls.__metadata__

        if json != cls.literal:
            raise ValueError(f"{path.join(".")} Expected to find literal {cls.literal}")


    @classmethod
    def expand(cls, json):
        metadata = cls.__metadata__
        json = get_list_scalar(json)

        if json is None:
            json = cls.literal

        return json


class Enum(WrapsValue, enumEnum):
    def unwrap(self):
        return self.value


    @classmethod
    def validate(cls, json, path=[]):
        """
        TypeError is raised when the json is not a string.
        ValueError is raised when the json does not match any enum entry given string
        """
        metadata = cls.__metadata__

        if not isinstance(json, string):
            raise TypeError(f"{path.join(".")} Expected a string, found {type(json)}")

        try:
            cls(json)
        except ValueError:
            raise ValueError(f"{path.join(".")} Value does not match enum type {cls}")


    @classmethod
    def expand(cls, json):
        """
        Recursively expands all entries of this map.
        """
        metadata = cls.__metadata__
        json = get_list_scalar(json)

        if json is None:
            json = getattr(cls, iter(cls._member_map_).__next__()).value()

        return json


class List(MutableSequence[T], WrapsValue):
    @classmethod
    def is_container(cls):
        return True


    @classmethod
    def validate(cls, json, path=[]):
        """
        Recursively validates all items of this list.
        TypeError is raised when the json is not a list object.
        Otherwise, the inner item's value is validated against its respective type.
        """
        metadata = cls.__metadata__

        if not isinstance(json, list):
            raise TypeError(f"{path.join(".")} Expected a list, found {type(json)}")

        if 'atleast_one' in metadata['tags']:
            if not len(json):
                raise ValueError(f"{path.join(".")} Expected atleast one item, but it was empty")

        for val, i in enumerate(json):
            cls.inner_kind().validate(val, path.concat([str(i)]))


    @classmethod
    def expand(cls, json):
        """
        Recursively expands all items of this map.
        """
        metadata = cls.__metadata__
        json = get_list_scalar(json)

        if json is None:
            json = [] 

        if not isinstance(json, list):
            return json

        if 'atleast_one' in metadata['tags']:
            if not len(json):
                json.push(None)

        for val, i in enumerate(json):
            json[i] = cls.inner_kind().expand(val)

        return json

    def insert(self, index, v):
        return self.orig_list.insert(index, unwrap_value(v))

    def __delitem__(self, i: int) -> None:
        return self.orig_list.__delitem__(i)

    def __len__(self) -> int:
        return len(self.orig_list)

    def __getitem__(self, i):
        return wrap_value(self.inner_kind(), self.orig_list.__getitem__(i))

    def __setitem__(self, key, value):
        self.orig_list.__setitem__(key, unwrap_value(value))

    def __init__(self, orig_list):
        self.orig_list = orig_list

    def unwrap(self):
        return self.orig_list


class Map(Generic[T], MutableMapping[str, T], WrapsValue):
    @classmethod
    def is_container(cls):
        return True


    @classmethod
    def validate(cls, json, path=[]):
        """
        Recursively validates all entries of this struct.
        TypeError is raised when the json is not a dict object.
        Otherwise, the inner entry's value is validated against its respective type.
        """
        metadata = cls.__metadata__

        if not isinstance(json, dict):
            raise TypeError(f"{path.join(".")} Expected a dict, found {type(json)}")

        for key, field in json.items():
            val = json.get(key, None)
            cls.inner_kind().validate(val, path.concat([key]))


    @classmethod
    def expand(cls, json):
        """
        Recursively expands all entries of this map.
        """
        metadata = cls.__metadata__
        json = get_list_scalar(json)

        if json is None:
            json = {}

        if not isinstance(json, dict):
            return json

        for key, field in json.items():
            val = json.get(key, None)
            json[field_name] = cls.inner_kind().expand(val)

        return json


    def __setitem__(self, k: str, v: T):
        self.orig_map.__setitem__(k, unwrap_value(v))

    def __delitem__(self, v: str):
        return self.orig_map.__delitem__(v)

    def __len__(self):
        return len(self.orig_map)

    def __iter__(self) -> Iterable[str]:
        for item in self.orig_map:
            yield item

    def __getitem__(self, i):
        return wrap_value(self.inner_kind(), self.orig_map.__getitem__(i))

    def items(self) -> Iterable[Tuple[str, T]]:
        for item in self.orig_map:
            yield (item, self[item])

    def values(self) -> Iterable[T]:
        for item in self.orig_map:
            yield self[item]

    def __init__(self, orig_map):
        self.orig_map = orig_map

    def unwrap(self):
        return self.orig_map


def create_struct_prop(attr, type):
    @property
    def prop(self):
        return wrap_value(type, self.orig_data.get(attr, None))

    @prop.setter
    def prop(self, v):
        self.orig_data[attr] = unwrap_value(v)

    return prop


class StructMeta(type):
    def __new__(cls, name, bases, dct):
        cls = super().__new__(cls, name, bases, dct)

        annotations = getattr(cls, '__annotations__', {})
        for attr, type in annotations.items():

            target_attr = attr
            if attr in KEYWORDS:
                target_attr = attr + '_'
            setattr(cls, target_attr, create_struct_prop(attr, type))

        return cls


class Struct(with_metaclass(StructMeta, WrapsValue)):
    def __init__(self, orig_data):
        orig_data = unwrap_value(orig_data)

        if not isinstance(orig_data, dict):
            raise TypeError(f"Expected to receive a dict, found a {type(orig_data).__name__}")
        self.orig_data = orig_data

    def unwrap(self):
        return self.orig_data

    def __str__(self):
        return str(self.orig_data)

    @classmethod
    def validate(cls, json, path=[]):
        """
        Recursively validates all fields of this struct.
        Fields marked as optional will not be validated when they are null.
        KeyError is raised when an expected non optional is not present.
        TypeError is raised when the json is not a dict object.
        Otherwise, the inner field's value is validated against its respective type.
        """
        metadata = cls.__metadata__

        if not isinstance(json, dict):
            raise TypeError(f"{path.join(".")} Expected a dict, found {type(json)}")

        for field_name, field in metadata['fields'].items():
            val = json.get(field_name, None)
            optional = 'option' in field['tags']

            if val is None 
                if optional:
                    continue
                else:
                    raise KeyError(f"{path.join(".")} Missing required key {repr(field_name)}")

            annotation_name = field_name
            if field_name in KEYWORDS:
                annotation_name += '_'

            if optional:
                cls.__annotations__[annotation_name].__args__[0].validate(val, path.concat([field_name]))
            else:
                cls.__annotations__[annotation_name].validate(val, path.concat([field_name]))

    @classmethod
    def expand(cls, json):
        """
        Recursively expands all fields of this struct.
        Fields marked as optional will not be expanded when they are null.
        Otherwise, the inner field's value is expanded against its respective type.
        """
        metadata = cls.__metadata__
        json = get_list_scalar(json)

        if json is None:
            json = {}

        if not isinstance(json, dict):
            return json

        for field_name, field in metadata['fields'].items():
            val = json.get(field_name, None)
            optional = 'option' in field['tags']

            if val is None 
                if optional:
                    continue

            annotation_name = field_name
            if field_name in KEYWORDS:
                annotation_name += '_'

            if optional:
                json[field_name] = cls.__annotations__[annotation_name].__args__[0].expand(val)
            else:
                json[field_name] = cls.__annotations__[annotation_name].expand(val)

        return json

KEYWORDS = {
    'False',
    'True',
    'class',
    'finally',
    'is',
    'return',
    'None',
    'continue',
    'for',
    'lambda',
    'try',
    'def',
    'from',
    'nonlocal',
    'while',
    'and',
    'del',
    'global',
    'not',
    'with',
    'as',
    'elif',
    'if',
    'or',
    'yield',
    'assert',
    'else',
    'import',
    'pass',
    'break',
    'except',
    'in',
    'raise',
}
