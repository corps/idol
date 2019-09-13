from typing import TypeVar, Generic, Tuple, List, Iterable, Any, Optional, Iterator, Mapping, Dict

A = TypeVar("A")
B = TypeVar("B")
C = TypeVar("C")

T = TypeVar("T")
R = TypeVar("R")


class StringSet(set):
    def add(self, element: str):
        super(StringSet, self).add(element)

    def __init__(self, items: Iterable[str] = None):
        super(StringSet, self).__init__(items or [])

    __add__ = set.union
    concat = __add__


class OrderedObj(Generic[T]):
    obj: Mapping[str, T]
    ordering: List[str]

    def __init__(self, obj: Mapping[str, T] = None, ordering: List[str] = None):
        self.obj = obj or {}
        self.ordering = ordering or sorted(self.obj.keys())

    @classmethod
    def from_iterable(cls, items: Iterable["OrderedObj[T]"]) -> "OrderedObj[T]":
        result = OrderedObj()
        for o in items:
            result += o
        return result

    def __bool__(self):
        return bool(self.obj)

    def __len__(self):
        return len(self.obj)

    def concat(self, other: "OrderedObj[T]") -> "OrderedObj[T]":
        ordering = self.ordering + [i for i in other.ordering if i not in self.obj]
        obj: Dict[str, T] = {}

        for k in ordering:
            if k not in self.obj:
                obj[k] = other.obj[k]
            elif k not in other.obj:
                obj[k] = self.obj[k]
            else:
                left = self.obj[k]
                right = other.obj[k]
                obj[k] = left + right

        return OrderedObj(obj, ordering)

    __add__ = concat

    def keys(self) -> Iterable[str]:
        return self.ordering

    def values(self) -> Iterable[T]:
        for k in self.ordering:
            yield self.obj[k]

    def __iter__(self) -> Iterable[Tuple[str, T]]:
        for k in self.ordering:
            yield k, self.obj[k]

    def get(self, k: str) -> "Alt[T]":
        if k in self.obj:
            return Alt.lift(self.obj[k])
        return Alt.empty()


class Conjunct(Generic[A]):
    v: List[A]

    def __init__(self, v: Iterable[A]):
        if not isinstance(v, list):
            v = list(v)
        self.v = v

    @classmethod
    def lift(cls, v: A) -> "Conjunct[A]":
        return cls((v,))

    @classmethod
    def empty(cls) -> "Conjunct[Any]":
        return cls([])

    def __iter__(self) -> Iterable[List[T]]:
        if self:
            yield self.v

    def __bool__(self):
        return len(self.v)

    def __concat__(self, other: "Conjunct[A]") -> "Conjunct[A]":
        return Conjunct(self.v + other.v)


class Alt(Generic[A]):
    v: List[A]

    def __init__(self, v: Iterable[A]):
        if not isinstance(v, list):

            def takeone():
                for i in v:
                    yield i
                    break

            v = list(takeone())
        self.v = v

    @classmethod
    def lift(cls, v: A) -> "Alt[A]":
        return cls((v,))

    @classmethod
    def lift_optional(cls, v: Optional[A]) -> "Alt[A]":
        if v is None:
            return cls.empty()
        return cls.lift(v)

    @classmethod
    def empty(cls) -> "Alt[Any]":
        return cls([])

    def unwrap(self) -> A:
        return self.v[0]

    def get_or(self, d: A) -> A:
        if not self:
            return d
        return self.unwrap()

    def get_or_fail(self, msg: str) -> A:
        if self:
            return self.unwrap()
        raise ValueError(msg)

    def __iter__(self) -> Iterable[A]:
        if self:
            yield self.unwrap()

    def concat(self, other: "Alt[A]") -> "Alt[A]":
        if self:
            return self
        return other

    __add__ = concat

    def __bool__(self):
        return len(self.v) > 0


class Disjoint(Generic[A]):
    v: List[A]

    def __init__(self, v: Iterable[A]):
        if not isinstance(v, list):
            v = list(v)
        self.v = v

    @classmethod
    def lift(cls, v: A) -> "Disjoint[A]":
        return cls((v,))

    @classmethod
    def lift_optional(cls, v: Optional[A]) -> "Disjoint[A]":
        if v is None:
            return cls.empty()
        return cls.lift(v)

    @classmethod
    def empty(cls) -> "Disjoint[Any]":
        return cls([])

    def get_or(self, d: A) -> A:
        if not self:
            return d
        return self.unwrap()

    def get_or_fail(self, msg: str) -> A:
        if self:
            return self.unwrap()
        raise ValueError(msg)

    def unwrap(self) -> A:
        if len(self.v) > 1:
            raise ValueError(f"Unexpected conflict found!")

        return self.v[0]

    def unwrap_errors(self) -> Iterator[List[A]]:
        if len(self.v) > 1:
            yield self.v

    def __iter__(self) -> Iterable[A]:
        if len(self.v) > 0:
            yield self.unwrap()

    def concat(self, other: "Disjoint[A]") -> "Disjoint[A]":
        return Disjoint(self.v + other.v)

    __add__ = concat

    def __bool__(self):
        return len(self.v) > 0


def naive_object_update(self, other: object) -> None:
    self_dict = self.__dict__
    for k, v in other.__dict__.items():
        if k in self_dict:
            self_dict[k] += v
        else:
            self_dict[k] = v


def naive_object_concat(self: A, other: A) -> A:
    result = self.__class__.__new__()
    result.__dict__ = dict(**self.__dict__)
    naive_object_update(result, other)
    return result
