from typing import Dict, TypeVar, Generic, Callable, Tuple, Optional, Generator
from functools import wraps

T = TypeVar("T")
A = TypeVar("A")
B = TypeVar("B")
C = TypeVar("C")



def for_struct(f: Callable[[Dict[str, int]], int]):
    pass


def on_left(f: Callable[[bool], str]) -> Deconstructor[int, str]:
    def left(a: int) -> Optional[Tuple[str]]:
        if a < 0:
            return None
        return f(a % 2 == 0),

    return Deconstructor(left)


# run (on_left(100) | on_right(20)) true

def do_work(a: str) -> str:
    return a + "aaaa"


vv = ImportMe(do_work)


def import_name(module, )
