from setuptools import setup
import os.path

version = open(os.path.dirname(os.path.abspath(__file__)) + "/idol/VERSION").read()

setup(
    name="idol",
    version=version,
    description="idol codegen library tools",
    url="http://github.com/lyric-com/idol",
    author="Zach Collins",
    author_email="zach.collins@lyric.com",
    license="MIT",
    packages=["idol", "idol/py", "idol/py/codegen", "idol/py/codegen/schema", "idol/py/schema"],
    install_requires=["black", "cached_property"],
    python_require=">= 3.6",
    scripts=["idol/idol_py", "idol/idol_mar", "idol/idol_dataclass"],
    zip_safe=False,
    package_data={"": ["LICENSE", "idol_py", "idol_mar", "VERSION", "README"]},
)
