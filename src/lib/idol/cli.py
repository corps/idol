from os import getcwd

import argparse
import json
from typing import Dict, List, Union, MutableMapping
import sys

from idol.generator import GeneratorParams
from idol.functional import OrderedObj
from idol.__idol__ import Map
from idol.py.schema.module import Module


class CliConfig:
    flags: Dict[str, str]
    args: Dict[str, str]
    argparse: argparse.ArgumentParser

    def __init__(
        self,
        flags: Dict[str, str] = {},
        args: Dict[str, str] = {},
        description: str = "Codegenerator built on python",
    ):
        self.flags = flags
        self.args = args
        self.argparse = argparse.ArgumentParser(description=description)

        for arg, desc in args.items():
            self.argparse.add_argument("--" + arg, help=desc, nargs="*")

        for arg, desc in flags.items():
            self.argparse.add_argument("--" + arg, help=desc, action="store_true")

        self.argparse.add_argument(
            "-input_json",
            help="ignored when stdin is piped into this program, otherwise should be a json file containing the output of an idol run.",
        )


def start(config: CliConfig):
    args: argparse.Namespace = config.argparse.parse_args()
    if sys.stdin.isatty():
        data = open(args.input_json, "r").read()
    else:
        data = sys.stdin.read()

    return prepare_generator_params(vars(args), data)


def prepare_generator_params(
    options: Dict[str, Union[List[str], bool]], data: str
) -> GeneratorParams:
    modules = json.loads(data)
    Map.of(Module, {}).validate(modules)
    modules: MutableMapping[Module] = Map.of(Module, {}).wrap(modules)

    all_modules: OrderedObj[Module] = OrderedObj(modules)
    all_types = OrderedObj.from_iterable(m.types_as_ordered_obj() for m in all_modules.values())

    targets = options.get("target", [])
    scaffold_types = OrderedObj.from_iterable(
        modules[target].types_as_ordered_obj() for target in targets
    )

    return GeneratorParams(
        all_modules, all_types, scaffold_types, options.get("output", [getcwd()])[0], options
    )
