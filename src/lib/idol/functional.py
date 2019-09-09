from typing import Dict, TypeVar, Generic, Callable, Tuple, List, Iterable, Any, Optional, Union

A = TypeVar("A")
B = TypeVar("B")
C = TypeVar("C")

T = TypeVar("T")
R = TypeVar("R")


class mset(set):
    __add__ = set.union
    concat = __add__


class OrderedObj(Generic[T]):
    obj: Dict[str, T]
    ordering: List[str]

    def __init__(self, obj: Dict[str, T] = None, ordering: List[str] = None):
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

    def update(self, k: str, v: T) -> "OrderedObj[T]":
        if k not in self.obj:
            self.ordering.append(k)
        self.obj[k] = v
        return self

    def set_default(self, k: str, v: T) -> T:
        if k not in self.obj:
            self.ordering.append(k)
            self.obj[k] = v
        return self

    def __iter__(self) -> Iterable[Tuple[T, str]]:
        for k in self.ordering:
            yield self.obj[k], k

    def map(self, f: Callable[[T, str], R]) -> "OrderedObj[R]":
        obj: Dict[str, R] = {}
        for k in self.ordering:
            obj[k] = f(self.obj[k], k)
        return OrderedObj(obj, self.ordering)

    def filter(self, f: Callable[[T], bool]) -> "OrderedObj[T]":
        obj: Dict[str, T] = {}
        ordering: List[str] = []
        for k in self.ordering:
            if f(self.obj[k]):
                obj[k] = self.obj[k]
                ordering.append(k)
        return OrderedObj(obj, ordering)

    def bimap(self, f: Callable[[T, str], Tuple[str, R]]) -> "OrderedObj[R]":
        obj: Dict[str, R] = {}
        new_ordering = []
        for old_k in self.ordering:
            new_k, r = f(self.obj[old_k], old_k)
            if new_k in obj:
                raise ValueError(f"bimap invariant broken: Key {new_k} was not a unique output.")

            obj[new_k] = r
            new_ordering.append(new_k)

        return OrderedObj(obj, new_ordering)


class Acc(Generic[A]):
    state: A
    update: A

    def __init__(self, state: A, update: A):
        self.state = state
        self.update = update

    def concat(self, other: "Union[A, Acc[A]]") -> "Acc[A]":
        if isinstance(other, Acc):
            other = other.update
        return Acc(self.state + other, self.update + other)

    __add__ = concat

    def __call__(self, other: "Tuple[B, A]") -> Tuple[A, B]:
        res, update = other
        self.state += update
        self.update += update
        return self.state, res


class Alt(Generic[A]):
    v: List[A]

    def __init__(self, v: Iterable[A]):
        if not isinstance(v, list):
            v = list(v)
        self.v = v

    @classmethod
    def lift(cls, v: A) -> "Alt[A]":
        return cls((v,))

    @classmethod
    def empty(cls) -> "Alt[Any]":
        return cls([])

    def unwrap(self) -> A:
        return self.v[0]

    def get_or(self, d: A) -> A:
        if not self.has_one:
            return d
        return self.unwrap()

    def get_or_fail(self, msg: str) -> A:
        if self.has_one:
            return self.unwrap()
        raise ValueError(msg)

    def __iter__(self):
        """
        Yields at most one item
        :return:
        """
        for v in self.v:
            yield v
            return

    @property
    def has_one(self):
        return len(self.v) > 0

    @property
    def has_many(self):
        return len(self.v) > 1

    def map(self, f: Callable[[A], B]) -> "Alt[B]":
        return Alt([f(i) for i in self.v])

    def concat(self, other: "Alt[A]") -> "Alt[A]":
        return Alt(self.v + other.v)

    __add__ = concat


class Disjoint(Alt):
    def unwrap(self) -> A:
        if self.has_many:
            raise ValueError(f"Unexpected conflict found!")

        return super(Disjoint, self).unwrap()

    def unwrap_errors(self) -> List[A]:
        if self.has_many:
            return self.v

        return []


def naive_object_concat(self, other: object):
    new_dict = dict(**self.__dict__)
    for k, v in other.__dict__.items():
        if k in new_dict:
            new_dict[k] += v
        else:
            new_dict[k] = v

    result = self.__class__.__new__()
    result.__dict__ = new_dict
    return result
