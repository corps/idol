# DO NOT EDIT
# This file was generated by idol_data, any changes will be lost when idol_data is rerun again
from dataclasses import field, dataclass
from typing import Optional


@dataclass
class TestsBasicTestOptionalFieldDataclass(object):
    optional: Optional[str] = field(default_factory=(lambda: None))