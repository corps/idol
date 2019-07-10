from typing import TypeVar, MutableSequence, Optional as TypingOptional, MutableMapping, \
    Any as TypingAny, Generic
from enum import Enum as enumEnum

T = TypeVar('T')


def unwrap_value(_expected_type, value):
    if isinstance(value, WrapsValue):
        value = value.unwrap()

    return value


def wrap_value(expected_type, value):
    if issubclass(expected_type, WrapsValue):
        if not isinstance(value, WrapsValue):
            value = expected_type(value)
    return value


class WrapsValue:
    @classmethod
    def is_container(cls):
        return True

    @classmethod
    def inner_kind(cls):
        if cls.is_container():
            return cls.__args__[0]

    def unwrap(self):
        pass


class Any(TypingAny):
    @classmethod
    def is_container(cls):
        return False

    def __new__(cls, val):
        return val


class Optional(WrapsValue, TypingOptional[T]):
    def __new__(cls, val):
        if val is None:
            return None

        return cls.inner_kind()(val)


class Literal(WrapsValue, Generic[T]):
    def __new__(cls, *args) -> T:
        return cls.literal


class Enum(enumEnum, WrapsValue):
    @classmethod
    def is_container(cls):
        return False

    def unwrap(self):
        return self.value


class List(MutableSequence[T], WrapsValue):
    def insert(self, index, v):
        return self.orig_list.insert(index, unwrap_value(self.inner_kind(), v))

    def __delitem__(self, i: int) -> None:
        return self.orig_list.__delitem__(i)

    def __len__(self) -> int:
        return len(self.orig_list)

    def __getitem__(self, i):
        return wrap_value(self.inner_kind(), self.orig_list.__getitem__(i))

    def __setitem__(self, key, value):
        self.orig_list.__setitem__(key, unwrap_value(self.inner_kind(), value))

    def __init__(self, orig_list):
        self.orig_list = orig_list

    def unwrap(self):
        return self.orig_list


class Map(MutableMapping[str, T], WrapsValue):
    def __setitem__(self, k, v):
        self.orig_map.__setitem__(k, unwrap_value(self.inner_kind(), v))

    def __delitem__(self, v):
        return self.orig_map.__delitem__(v)

    def __len__(self):
        return len(self.orig_map)

    def __iter__(self):
        for item in self.orig_map:
            yield wrap_value(self.inner_kind(), item)

    def __getitem__(self, i):
        return wrap_value(self.inner_kind(), self.orig_map.__getitem__(i))

    def __init__(self, orig_map):
        self.orig_map = orig_map

    def unwrap(self):
        return self.orig_map


class StructMeta:
    def __new__(cls, name, bases, dct):
        cls = super().__new__(cls, name, bases, dct)

        annotations = cls.__annotations__
        for attr, type in annotations.items():
            @property
            def prop(self):
                return wrap_value(type, self.orig_data[attr])

            @prop.setter
            def prop(self, v):
                self.orig_data[attr] = unwrap_value(type, v)

            if attr in KEYWORDS:
                attr = attr + '_'

            setattr(cls, attr, prop)

        return cls


class Struct(WrapsValue, metaclass=StructMeta):
    @classmethod
    def is_container(cls):
        return False

    def __init__(self, orig_data):
        self.orig_data = orig_data

    def unwrap(self):
        return self.orig_data


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
