MODELS     := $(wildcard src/models/*.toml)
SOURCE_FILES = $(shell find src -type f | egrep ".*\.rs" | grep -v "bin/")

release: target/release/idol target/release/idol_rs js

release-python: versions
	cp LICENSE src/lib/idol/LICENSE
	cp README.md src/lib/idol/README
	cd src/lib && rm -rf dist && python setup.py sdist && twine upload dist/*

release-node: versions test
	cd src/lib/idol && npm publish

dev: target/debug/idol target/debug/idol_rs js models

target/debug/idol: src/*.rs $(SOURCE_FILES) src/bin/idol.rs Cargo.toml Cargo.lock
	cargo build --bin idol

target/debug/idol_rs: src/*.rs $(SOURCE_FILES) src/bin/idol_rs.rs Cargo.toml Cargo.lock
	cargo build --bin idol_rs

target/release/idol: src/*.rs $(SOURCE_FILES) src/bin/idol.rs Cargo.toml Cargo.lock
	cargo build --bin idol --release

target/release/idol_rs: src/*.rs $(SOURCE_FILES) src/bin/idol_rs.rs Cargo.toml Cargo.lock
	cargo build --bin idol_rs --release

js: src/es6/idol/*.js src/lib/idol/node_modules
	npm install
	npm run compile

src/lib/idol/node_modules:
	node --version
	(cd src/lib/idol && npm install)

models: $(MODELS)
	./target/debug/idol $? > build.json
	python --version
	node --version
	pip --version
	npm install
	pip install -e ./src/lib

	cat build.json | ./target/debug/idol_rs --output src/models/ --mod "crate::models"
	cat build.json | ./src/lib/idol/idol_py --output src/lib/idol/py --target schema
	cat build.json | ./src/lib/idol/idol_js.js --output src/es6/idol/js --target schema
	cat build.json | ./src/lib/idol/idol_mar --output src/lib/idol/mar --target schema
	cat build.json | ./src/lib/idol/idol_dataclass --output src/lib/idol/dataclass --target schema
	cat build.json | ./src/lib/idol/idol_graphql.js --output src/es6/idol/graphql --target schema
	cat build.json | ./src/lib/idol/idol_flow.js --output src/es6/idol/flow --target schema
	cat build.json | ./src/lib/idol/idol_graphql_queries.js --output src/es6/idol/graphql_queries --target schema

check: $(MODELS)
	./target/debug/idol $? > build.json
	npm run compile
	npm install
	pip install -e ./src/lib
	cat build.json | ./src/lib/idol/idol_js.js --output src/es6/idol/js --target schema --check
	cat build.json | ./src/lib/idol/idol_py --output src/lib/idol/py --target schema --check

test: dev
	cargo test
	PATH="$$PWD/node_modules/.bin:$$PATH" make -C test

versions: target/debug/idol
	./target/debug/idol --version 2>&1 | cut -d' ' -f2 > src/lib/idol/VERSION
	cat src/lib/idol/package.json |  jq --arg version "$$(cat src/lib/idol/VERSION)" '.version = $$version' > src/lib/idol/.package.json
	mv src/lib/idol/.package.json src/lib/idol/package.json



.PHONY: models dev test release js release-python
