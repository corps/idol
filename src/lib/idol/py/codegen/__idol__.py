from types import new_class

from collections.abc import MutableSequence
from typing import (
    TypeVar,
    MutableMapping,
    Any,
    Iterable,
    Tuple,
    Type,
    cast,
    Union,
    List as typingList,
    Dict,
    Iterator,
    Optional,
)
from enum import Enum as enumEnum


def with_metaclass(meta, *bases):
    return meta("NewBase", bases, {})


def get_list_scalar(value):
    while isinstance(value, list):
        if value:
            value = value[0]
        else:
            value = None
    return value


class IdolConstructor:
    @classmethod
    def validate(cls, json, path: typingList[str] = []):
        pass

    @classmethod
    def is_valid(cls, json) -> bool:
        try:
            cls.validate(json)
            return True
        except (ValueError, TypeError, KeyError):
            return False

    @classmethod
    def unwrap(cls, value) -> Any:
        return value

    @classmethod
    def wrap(cls, value) -> Any:
        return value

    @classmethod
    def expand(cls, json) -> Any:
        return json


class Primitive(IdolConstructor):
    type_constructor: Type

    def __new__(cls, *args, **kwargs):
        return cls.type_constructor(*args, **kwargs)

    @staticmethod
    def of(type_constructor: Type) -> Type["Primitive"]:
        cls = cast(
            Type["Primitive"], new_class(type_constructor.__name__, (Primitive,))
        )

        cls.type_constructor = type_constructor
        return cls

    @classmethod
    def expand(cls, json) -> Union[str, float, bool, int]:
        json = get_list_scalar(json)

        if json:
            return json

        if issubclass(cls.type_constructor, str):
            return ""
        if issubclass(cls.type_constructor, float):
            return 0.0
        if issubclass(cls.type_constructor, bool):
            return False
        if issubclass(cls.type_constructor, int):
            return 0

        raise TypeError("type_constructor was not one of str, float, bool, or int!")

    @classmethod
    def validate(cls, json, path: typingList[str] = []):
        if not issubclass(type(json), cls.type_constructor):
            raise TypeError(
                f"{'.'.join(path)} Expected type of {cls.type_constructor}, found {type(json)}"
            )


class Literal(IdolConstructor):
    value: Union[str, int, float, bool]

    @staticmethod
    def of(value: Union[str, int, float, bool]) -> Type["Literal"]:
        cls = cast(Type["Literal"], new_class(type(value).__name__, (Literal,)))
        cls.value = value
        return cls

    @classmethod
    def validate(cls, json, path=[]):
        if json != cls.value:
            raise ValueError(f"{'.'.join(path)} Expected to find literal {cls.value}")

    @classmethod
    def expand(cls, json) -> Union[str, int, float, bool]:
        json = get_list_scalar(json)

        if json is None or isinstance(json, type(cls.value)):
            json = cls.value

        return json


class Enum(IdolConstructor, enumEnum):
    @classmethod
    def validate(cls, json, path=[]):
        if not isinstance(json, str):
            raise TypeError(f"{'.'.join(path)} Expected a string, found {type(json)}")

        try:
            cls(json)
        except ValueError:
            raise ValueError(f"{'.'.join(path)} Value does not match enum type {cls}")

    @classmethod
    def expand(cls, json):
        json = get_list_scalar(json)

        if json is None:
            json = next(iter(cls)).value

        return json

    @classmethod
    def unwrap(cls, value: enumEnum):
        if isinstance(value, cls):
            return value.value
        return value

    @classmethod
    def wrap(cls: Type["Enum_T"], value) -> "Enum_T":
        return cls(value)


Enum_T = TypeVar("Enum_T", bound=Enum)


class List(IdolConstructor, MutableSequence):
    inner_constructor: Type[IdolConstructor]
    options: Dict[str, Any]

    @staticmethod
    def of(
        inner_constructor: Type[IdolConstructor],
        options: Optional[Dict[str, Any]] = None,
    ) -> Type["List"]:
        cls = cast(
            Type["List"], new_class(f"List[{inner_constructor.__name__}]", (List,))
        )
        cls.inner_constructor = inner_constructor
        cls.options = options
        return cls

    @classmethod
    def validate(cls, json, path=[]):
        if not isinstance(json, list):
            raise TypeError(f"{'.'.join(path)} Expected a list, found {type(json)}")

        if cls.options.get("atleast_one"):
            if not len(json):
                raise ValueError(
                    f"{'.'.join(path)} Expected at least one item, but it was empty"
                )

        for i, val in enumerate(json):
            cls.inner_constructor.validate(val, path + [str(i)])

    @classmethod
    def expand(cls, json) -> Any:
        if json is None:
            json = []

        if not isinstance(json, list):
            json = [json]

        if cls.options.get("atleast_one"):
            if not len(json):
                json.append(None)

        for i, val in enumerate(json):
            json[i] = cls.inner_constructor.expand(val)

        return json

    orig_list: typingList

    def __init__(self, orig_list: typingList):
        self.orig_list = orig_list

    def insert(self, index, v):
        return self.orig_list.insert(index, self.inner_constructor.unwrap(v))

    def __delitem__(self, i: int) -> None:
        return self.orig_list.__delitem__(i)

    def __len__(self) -> int:
        return len(self.orig_list)

    def __getitem__(self, i):
        return self.inner_constructor.wrap(self.orig_list.__getitem__(i))

    def __setitem__(self, key, value):
        self.orig_list.__setitem__(key, self.inner_constructor.unwrap(value))

    def __iter__(self) -> Iterator:
        for value in self.orig_list:
            yield self.inner_constructor.wrap(value)

    def __contains__(self, x: Any) -> bool:
        return self.inner_constructor.unwrap(x) in self.orig_list

    @classmethod
    def unwrap(cls, val):
        if isinstance(val, cls):
            return val.orig_list
        return val

    @classmethod
    def wrap(cls, val):
        return cls(val)


class Map(IdolConstructor, MutableMapping):
    inner_constructor: Type[IdolConstructor]
    options: Dict[str, Any]

    @staticmethod
    def of(
        inner_constructor: Type[IdolConstructor], options: Optional[Dict[str, Any]] = {}
    ) -> Type["Map"]:
        cls = cast(Type["Map"], new_class(f"Map[{inner_constructor.__name__}]", (Map,)))
        cls.inner_constructor = inner_constructor
        cls.options = options

        return cls

    @classmethod
    def validate(cls, json, path=[]):
        if not isinstance(json, dict):
            raise TypeError(f"{'.'.join(path)} Expected a dict, found {type(json)}")

        for key, val in json.items():
            cls.inner_constructor.validate(val, path + [key])

    @classmethod
    def expand(cls, json):
        json = get_list_scalar(json)

        if json is None:
            json = {}

        if not isinstance(json, dict):
            return json

        for key, val in json.items():
            json[key] = cls.inner_constructor.expand(val)

        return json

    orig_map: Dict[str, Any]

    def __init__(self, orig_map):
        self.orig_map = orig_map

    def __setitem__(self, k: str, v: Any):
        self.orig_map.__setitem__(k, self.inner_constructor.unwrap(v))

    def __delitem__(self, v: str):
        return self.orig_map.__delitem__(v)

    def __len__(self):
        return len(self.orig_map)

    def __iter__(self) -> Iterable[str]:
        for item in self.orig_map:
            yield item

    def __getitem__(self, i):
        return self.inner_constructor.wrap(self.orig_map.__getitem__(i))

    def items(self):
        for item in self.orig_map:
            yield (item, self[item])

    def values(self):
        for item in self.orig_map:
            yield self.inner_constructor.wrap(self[item])

    @classmethod
    def unwrap(cls, val):
        if isinstance(val, cls):
            return val.orig_map
        return val

    @classmethod
    def wrap(cls, val):
        return cls(val)


def create_struct_prop(attr, type: Type[IdolConstructor]):
    @property
    def prop(self):
        val = self.orig_data.get(attr, None)

        if val is None:
            return val

        return type.wrap(val)

    @prop.setter
    def prop(self, v):
        self.orig_data[attr] = type.unwrap(v)

    return prop


class StructMeta(type):
    def __new__(mcs: Type["Struct"], name, bases, dct):
        mcs = super().__new__(mcs, name, bases, dct)
        for field_name, prop_name, constructor, _ in getattr(
            mcs, "__field_constructors__", []
        ):
            setattr(mcs, prop_name, create_struct_prop(field_name, constructor))

        return mcs


class Struct(with_metaclass(StructMeta, IdolConstructor)):
    orig_data: Dict[str, Any]
    __field_constructors__: typingList[
        Tuple[str, str, Type[IdolConstructor], Dict[str, Any]]
    ] = []

    def __init__(self, orig_data: Dict[str, Any]):
        self.orig_data = orig_data

    def __str__(self):
        return str(self.orig_data)

    def __repr__(self):
        return repr(self.orig_data)

    @classmethod
    def validate(cls, json, path=[]):
        if not isinstance(json, dict):
            raise TypeError(f"{'.'.join(path)} Expected a dict, found {type(json)}")

        for field_name, prop_name, constructor, options in cls.__field_constructors__:
            val = json.get(field_name, None)
            optional = options.get("optional")

            if val is None:
                if optional:
                    continue
                else:
                    raise KeyError(
                        f"{'.'.join(path)} Missing required key {repr(field_name)}"
                    )

            constructor.validate(val, path + [field_name])

    @classmethod
    def expand(cls, json):
        json = get_list_scalar(json)

        if json is None:
            json = {}

        if not isinstance(json, dict):
            return json

        for field_name, prop_name, constructor, options in cls.__field_constructors__:
            val = json.get(field_name, None)
            optional = options.get("optional")

            if val is None:
                if optional:
                    json[field_name] = None
                    continue

            if optional:
                if not issubclass(constructor, List):
                    val = get_list_scalar(val)
                if val is not None:
                    val = constructor.expand(val)

                json[field_name] = val
            else:
                json[field_name] = constructor.expand(val)

        return json

    @classmethod
    def unwrap(cls, val):
        if isinstance(val, cls):
            return val.orig_data
        return val

    @classmethod
    def wrap(cls, val):
        return cls(val)
