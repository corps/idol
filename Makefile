MODELS     := $(wildcard src/models/*.toml)
RUST_SOURCE_FILES = $(shell find src -type f | egrep ".*\.rs" | grep -v "bin/")

# Binary builds
target/debug/idol: $(RUST_SOURCE_FILES) src/bin/idol.rs
	cargo build --bin idol

target/debug/idol_rs: $(RUST_SOURCE_FILES) src/bin/idol_rs.rs
	cargo build --bin idol_rs

target/release/idol: rust-models $(RUST_SOURCE_FILES) src/bin/idol.rs
	cargo build --bin idol --release

target/release/idol_rs: rust-models $(SOURCE_FILES) src/bin/idol_rs.rs
	cargo build --bin idol_rs --release

src/lib/idol/idol_js.js: src/es6/idol/*.js src/lib/idol/node_modules
	npm install
	npm run compile

src/lib/idol/node_modules:
	node --version
	(cd src/lib/idol && npm install)

# Release steps
.PHONY: rust-release
rust-release: target/release/idol target/release/idol_rs

.PHONY: rust-dev
rust-dev: target/debug/idol target/debug/idol_rs

# models
build.json: $(MODELS) target/debug/idol
	./target/debug/idol $? > build.json

# Ensure that build.json is up to date.
# Used by CI
.PHONY: check-build.json
check-build.json: $(MODELS) target/debug/idol
	./target/debug/idol $? > build1.json
	diff build.json build1.json

.PHONY: rust-models
rust-models: build.json target/debug/idol_rs
	cat build.json | ./target/debug/idol_rs --output src/models/ --mod "crate::models"

.PHONY: models
models: $(MODELS)
	./target/debug/idol $? > build.json
	python3 --version
	node --version
	python3 -m pip --version
	npm install
	python3 -m pip install -e ./src/lib

	cat build.json | ./target/debug/idol_rs --output src/models/ --mod "crate::models"
	cat build.json | ./src/lib/idol/idol_py --output src/lib/idol/py --target schema
	cat build.json | ./src/lib/idol/idol_js.js --output src/es6/idol/js --target schema

test: dev
	cargo test
	PATH="$$PWD/node_modules/.bin:$$PATH" make -C test

versions: target/debug/idol
	./target/debug/idol --version 2>&1 | cut -d' ' -f2 > src/lib/idol/VERSION
	cat src/lib/idol/package.json |  jq --arg version "$$(cat src/lib/idol/VERSION)" '.version = $$version' > src/lib/idol/.package.json
	mv src/lib/idol/.package.json src/lib/idol/package.json



.PHONY: models dev test release
