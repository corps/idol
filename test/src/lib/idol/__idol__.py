from typing import TypeVar, MutableSequence, Optional, MutableMapping, Generic, Any, Iterable, \
    Tuple, Union
from enum import Enum as enumEnum
import sys

NEW_TYPING = sys.version_info[:3] >= (3, 7, 0)  # PEP 560
if NEW_TYPING:
    import collections.abc
    from typing import (
        Generic, Callable, Union, TypeVar, ClassVar, Tuple, _GenericAlias
    )
else:
    from typing import (
        Callable, CallableMeta, Union, _Union, TupleMeta, TypeVar,
        _ClassVar, GenericMeta,
    )

T = TypeVar('T')


def _gorg(cls):
    assert isinstance(cls, GenericMeta)
    if hasattr(cls, '_gorg'):
        return cls._gorg
    while cls.__origin__ is not None:
        cls = cls.__origin__
    return cls


def is_union_type(tp):
    if NEW_TYPING:
        return (tp is Union or
                isinstance(tp, _GenericAlias) and tp.__origin__ is Union)
    return type(tp) is _Union


def get_origin(tp):
    if NEW_TYPING:
        if isinstance(tp, _GenericAlias):
            return tp.__origin__ if tp.__origin__ is not ClassVar else None
        if tp is Generic:
            return Generic
        return None
    if isinstance(tp, GenericMeta):
        return _gorg(tp)
    if is_union_type(tp):
        return Union

    return None


def _eval_args(args):
    res = []
    for arg in args:
        if not isinstance(arg, tuple):
            res.append(arg)
        else:
            res.append(type(arg[0]).__getitem__(arg[0], _eval_args(arg[1:])))
    return tuple(res)


def is_generic_type(tp):
    if NEW_TYPING:
        return (isinstance(tp, type) and issubclass(tp, Generic) or
                isinstance(tp, _GenericAlias) and
                tp.__origin__ not in (Union, tuple))
    return (isinstance(tp, GenericMeta) and not
    isinstance(tp, (CallableMeta, TupleMeta)))


def is_tuple_type(tp):
    if NEW_TYPING:
        return (tp is Tuple or isinstance(tp, _GenericAlias) and
                tp.__origin__ is tuple or
                isinstance(tp, type) and issubclass(tp, Generic) and
                issubclass(tp, tuple))
    return type(tp) is TupleMeta


def get_args(tp):
    if NEW_TYPING:
        if isinstance(tp, _GenericAlias):
            return tp.__args__
        return ()
    if is_generic_type(tp) or is_union_type(tp) or is_tuple_type(tp):
        tree = tp._subs_tree()
        if isinstance(tree, tuple) and len(tree) > 1:
            return _eval_args(tree[1:])
    return ()


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

    origin = get_origin(expected_type)

    if is_union_type(expected_type):
        args = get_args(expected_type)
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


def is_valid(cls, json):
    try:
        validate(cls, json)
        return True
    except (ValueError, KeyError, TypeError):
        return False


def expand(cls, json):
    if hasattr(cls, 'expand'):
        return cls.expand(json, concrete_cls=cls)

    return expand_primitive(cls, json)


def validate(cls, json, path=[]):
    if hasattr(cls, 'validate'):
        return cls.validate(json, path=path, concrete_cls=cls)

    return validate_primitive(cls, json, path=path)


def expand_primitive(cls, json, concrete_cls=None):
    if concrete_cls:
        cls = concrete_cls

    json = get_list_scalar(json)

    if json:
        return json

    if issubclass(cls, int):
        primitive_type = 'int64'
    if issubclass(cls, float):
        primitive_type = 'double'
    if issubclass(cls, str):
        primitive_type = 'string'
    if issubclass(cls, bool):
        primitive_type = 'boolean'

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


def validate_primitive(cls, json, path=[], concrete_cls=None):
    if concrete_cls:
        cls = concrete_cls

    if issubclass(cls, int):
        primitive_type = 'int64'
    if issubclass(cls, float):
        primitive_type = 'double'
    if issubclass(cls, str):
        primitive_type = 'string'
    if issubclass(cls, bool):
        primitive_type = 'boolean'

    if primitive_type == 'int53':
        if not isinstance(json, int):
            raise TypeError(f"{'.'.join(path)} Expected a int, found {type(json)}")
        if json > 9007199254740991 or json < -9007199254740991:
            raise ValueError(f"{'.'.join(path)} value was out of range for i53")
    if primitive_type == 'int64':
        if not isinstance(json, int):
            raise TypeError(f"{'.'.join(path)} Expected a int, found {type(json)}")
        if json > 9223372036854775807 or json < -9223372036854775807:
            raise ValueError(f"{'.'.join(path)} value was out of range for i64")
    if primitive_type == 'double':
        if not isinstance(json, float):
            raise TypeError(f"{'.'.join(path)} Expected a float, found {type(json)}")
    if primitive_type == 'string':
        if not isinstance(json, str):
            raise TypeError(f"{'.'.join(path)} Expected a str, found {type(json)}")
    if primitive_type == 'boolean':
        if not isinstance(json, bool):
            raise TypeError(f"{'.'.join(path)} Expected a bool, found {type(json)}")


def inner_kind(cls):
    if cls.is_container():
        args = get_args(cls)
        while not args:
            cls = cls.__orig_bases__[0]
            args = get_args(cls)
        result = cls.__args__[0]
        if type(result) is TypeVar:
            raise TypeError("Logic bug!  inner kind was a TypeVar instead of a concrete type")
        return result


class WrapsValue:
    @classmethod
    def is_container(cls):
        return False

    is_valid = classmethod(is_valid)

    def inst_inner_kind(self):
        return inner_kind(self.__orig_class__)

    def unwrap(self):
        pass


class Literal(WrapsValue, Generic[T]):
    def __new__(cls, *args) -> T:
        return cls.literal

    @classmethod
    def validate(cls, json, path=[], concrete_cls=None):
        if concrete_cls:
            cls = concrete_cls

        if json != cls.literal:
            raise ValueError(f"{'.'.join(path)} Expected to find literal {cls.literal}")

    @classmethod
    def expand(cls, json, concrete_cls=None):
        if concrete_cls:
            cls = concrete_cls

        metadata = cls.__metadata__
        json = get_list_scalar(json)

        if json is None or type(json) is type(cls.literal):
            json = cls.literal

        return json


class Enum(WrapsValue, enumEnum):
    def unwrap(self):
        return self.value

    @classmethod
    def validate(cls, json, path=[], concrete_cls=None):
        """
        TypeError is raised when the json is not a string.
        ValueError is raised when the json does not match any enum entry given string
        """
        if concrete_cls:
            cls = concrete_cls

        metadata = cls.__metadata__

        if not isinstance(json, str):
            raise TypeError(f"{'.'.join(path)} Expected a string, found {type(json)}")

        try:
            cls(json)
        except ValueError:
            raise ValueError(f"{'.'.join(path)} Value does not match enum type {cls}")

    @classmethod
    def expand(cls, json, concrete_cls=None):
        """
        Recursively expands all entries of this map.
        """
        if concrete_cls:
            cls = concrete_cls

        metadata = cls.__metadata__
        json = get_list_scalar(json)

        if json is None:
            json = getattr(cls, iter(cls._member_map_).__next__()).value

        return json


class List(Generic[T], MutableSequence[T], WrapsValue):
    @classmethod
    def is_container(cls):
        return True

    @classmethod
    def validate(cls, json, path=[], concrete_cls=None):
        """
        Recursively validates all items of this list.
        TypeError is raised when the json is not a list object.
        Otherwise, the inner item's value is validated against its respective type.
        """
        if concrete_cls:
            cls = concrete_cls

        metadata = getattr(cls, '__metadata__', dict(tags=[]))

        if not isinstance(json, list):
            raise TypeError(f"{'.'.join(path)} Expected a list, found {type(json)}")

        if 'atleast_one' in metadata['tags']:
            if not len(json):
                raise ValueError(f"{'.'.join(path)} Expected atleast one item, but it was empty")

        for i, val in enumerate(json):
            validate(inner_kind(cls), val, path + [str(i)])

    @classmethod
    def expand(cls, json, concrete_cls=None):
        """
        Recursively expands all items of this map.
        """
        if concrete_cls:
            cls = concrete_cls

        metadata = getattr(cls, '__metadata__', dict(tags=[]))

        if json is None:
            json = []

        if not isinstance(json, list):
            json = [json]

        if 'atleast_one' in metadata['tags']:
            if not len(json):
                json.append(None)

        for i, val in enumerate(json):
            json[i] = expand(inner_kind(cls), val)

        return json

    def insert(self, index, v):
        return self.orig_list.insert(index, unwrap_value(v))

    def __delitem__(self, i: int) -> None:
        return self.orig_list.__delitem__(i)

    def __len__(self) -> int:
        return len(self.orig_list)

    def __getitem__(self, i):
        return wrap_value(self.inst_inner_kind(), self.orig_list.__getitem__(i))

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
    def validate(cls, json, path=[], concrete_cls=None):
        """
        Recursively validates all entries of this struct.
        TypeError is raised when the json is not a dict object.
        Otherwise, the inner entry's value is validated against its respective type.
        """
        if concrete_cls:
            cls = concrete_cls

        if not isinstance(json, dict):
            raise TypeError(f"{'.'.join(path)} Expected a dict, found {type(json)}")

        for key, field in json.items():
            val = json.get(key, None)
            validate(inner_kind(cls), val, path + [key])

    @classmethod
    def expand(cls, json, concrete_cls=None):
        """
        Recursively expands all entries of this map.
        """
        if concrete_cls:
            cls = concrete_cls

        json = get_list_scalar(json)

        if json is None:
            json = {}

        if not isinstance(json, dict):
            return json

        for key, field in json.items():
            val = json.get(key, None)
            json[key] = expand(inner_kind(cls), val)

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
        return wrap_value(self.inst_inner_kind(), self.orig_map.__getitem__(i))

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
    def validate(cls, json, path=[], concrete_cls=None):
        """
        Recursively validates all fields of this struct.
        Fields marked as optional will not be validated when they are null.
        KeyError is raised when an expected non optional is not present.
        TypeError is raised when the json is not a dict object.
        Otherwise, the inner field's value is validated against its respective type.
        """
        if concrete_cls:
            cls = concrete_cls

        metadata = cls.__metadata__

        if not isinstance(json, dict):
            raise TypeError(f"{'.'.join(path)} Expected a dict, found {type(json)}")

        for field_name, field in metadata['fields'].items():
            val = json.get(field_name, None)
            optional = 'optional' in field['tags']

            if val is None:
                if optional:
                    continue
                else:
                    raise KeyError(f"{'.'.join(path)} Missing required key {repr(field_name)}")

            annotation_name = field_name
            if field_name in KEYWORDS:
                annotation_name += '_'

            if optional:
                validate(cls.__annotations__[annotation_name].__args__[0], val, path + [field_name])
            else:
                validate(cls.__annotations__[annotation_name], val, path + [field_name])

    @classmethod
    def expand(cls, json, concrete_cls=None):
        """
        Recursively expands all fields of this struct.
        Fields marked as optional will not be expanded when they are null.
        Otherwise, the inner field's value is expanded against its respective type.
        """
        if concrete_cls:
            cls = concrete_cls

        metadata = cls.__metadata__
        json = get_list_scalar(json)

        if json is None:
            json = {}

        if not isinstance(json, dict):
            return json

        for field_name, field in metadata['fields'].items():
            val = json.get(field_name, None)
            optional = 'optional' in field['tags']

            if val is None:
                if optional:
                    json[field_name] = None
                    continue

            annotation_name = field_name
            if field_name in KEYWORDS:
                annotation_name += '_'

            if optional:
                if field['type_struct']['struct_kind'] != 'repeated':
                    val = get_list_scalar(val)
                if val is not None:
                    expand(cls.__annotations__[annotation_name].__args__[0], val)

                json[field_name] = val
            else:
                json[field_name] = expand(cls.__annotations__[annotation_name], val)

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
