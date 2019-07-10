from typing import TypeVar, MutableSequence, Optional, MutableMapping, Generic, Any, Iterable, \
    Tuple, Union
from enum import Enum as enumEnum
from six import with_metaclass

T = TypeVar('T')


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


class WrapsValue:
    @classmethod
    def is_container(cls):
        return False

    def inner_kind(self):
        if self.is_container():
            if hasattr(self, '__orig_class__'):
                return self.__orig_class__.__args__[0]
            return Any

    def unwrap(self):
        pass


class Literal(WrapsValue, Generic[T]):
    def __new__(cls, *args) -> T:
        return cls.literal


class Enum(WrapsValue, enumEnum):
    def unwrap(self):
        return self.value


class List(MutableSequence[T], WrapsValue):
    @classmethod
    def is_container(cls):
        return True

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
