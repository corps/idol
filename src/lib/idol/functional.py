from functools import reduce

from typing import TypeVar, Generic, Dict, List, Iterator, Iterable, Callable, Tuple, Optional

T = TypeVar("T")
R = TypeVar("R")


class OrderedObj(Generic[T]):
    obj: Dict[str, T]
    ordering: List[str]

    def __init__(self, obj: Dict[str, T] = None, ordering: List[str] = None):
        self.obj = obj or {}
        self.ordering = ordering or sorted(obj.keys())

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
                obj[k] = self.obj[k] + other.obj[k]

        return OrderedObj(obj, ordering)

    __add__ = concat

    def zip_with_keys_from(self, other: "OrderedObj[str]") -> "OrderedObj[T]":
        return reduce(
            lambda agg, k: agg + OrderedObj({other.obj[k]: self.obj[k]}) if k in other.obj else agg,
            self.keys(),
            OrderedObj(),
        )

    def keys(self) -> Iterable[str]:
        return self.ordering

    def values(self) -> Iterable[T]:
        for k in self.ordering:
            yield self.obj[k]

    def __iter__(self) -> Iterable[Tuple[T, str]]:
        for k in self.ordering:
            yield k, self.obj[k]

    def map(self, f: Callable[[T, str], R]) -> "OrderedObj[R]":
        obj: Dict[str, R] = {}
        for k in self.ordering:
            obj[k] = f(self.obj[k], k)
        return OrderedObj(obj, self.ordering)

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


class Conflictable(Generic[T]):
    values: List[T]

    def __init__(self, values: List[T] = None):
        self.values = values

    def concat(self, other: "Conflictable[T]"):
        return Conflictable(self.values + other.values)

    __add__ = concat

    def unwrap(self, err_message="Unexpected conflict found") -> Optional[T]:
        if len(self.values) > 1:
            raise ValueError(err_message)

        return self.values[0] if len(self.values) else None

    def expect_one(
        self, empty_message="No value found", conflict_message="Unexpected conflict found"
    ) -> T:
        if not self.values:
            raise ValueError(empty_message)

        return self.unwrap(conflict_message)

    def unwrap_conflicts(self, map_conflicts: Callable[[List[T]], R]) -> List[R]:
        if len(self.values) > 1:
            return [map_conflicts(self.values)]

        return []


def flatten_to_list(iterable: Iterable[List[T]]) -> List[T]:
    result = []
    for inner in iterable:
        result += inner
    return result


def flatten_to_ordered_obj(iterable: Iterable[OrderedObj[T]]) -> OrderedObj[T]:
    result = OrderedObj()
    for inner in iterable:
        result += inner
    return result
