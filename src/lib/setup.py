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
    packages=["idol"],
    install_requires=["black", "cached_property"],
    python_require=">= 3.6",
    scripts=["idol/idol_py", "idol/idol_mar"],
    zip_safe=False,
    include_package_data=True,
    package_data={"": ["idol/LICENSE", "idol/idol_py", "idol/idol_mar", "idol/VERSION", "idol/README.md"]},
)
