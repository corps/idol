from setuptools import setup

setup(
    name="idol",
    version="0.4.2",
    description="idol codegen library tools",
    url="http://github.com/lyric-com/idol",
    author="Zach Collins",
    author_email="zach.collins@lyric.com",
    license="MIT",
    packages=["idol"],
    install_requires=["black", "cached_property"],
    zip_safe=False,
)
