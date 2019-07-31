MODELS     := $(wildcard src/models/*.toml)
SOURCE_FILES = $(shell find src -type f | egrep ".*\.rs" | grep -v "bin/")

release: target/release/idol target/release/idol_rs src/lib/idol/idol_js.js

dev: target/debug/idol target/debug/idol_rs src/lib/idol/idol_js.js models

target/debug/idol: src/*.rs $(SOURCE_FILES) src/bin/idol.rs
	cargo build --bin idol

target/debug/idol_rs: src/*.rs $(SOURCE_FILES) src/bin/idol_rs.rs
	cargo build --bin idol_rs

target/release/idol: src/*.rs $(SOURCE_FILES) src/bin/idol.rs
	cargo build --bin idol --release

target/release/idol_rs: src/*.rs $(SOURCE_FILES) src/bin/idol_rs.rs
	cargo build --bin idol_rs --release

src/lib/idol/idol_js.js: src/es6/idol/*.js
	node --version
	npm run compile
	(cd src/lib/idol && npm install)

models: $(MODELS)
	./target/debug/idol $? > build.json
	python3 --version
	node --version

	cat build.json | ./target/debug/idol_rs --output src/models/ --mod "crate::models"
	cat build.json | ./src/bin/idol_py.py --output src/lib/idol --mod "idol"
	cat build.json | ./src/bin/idol_js.js --output src/es6/idol --target schema

test: dev
	cargo test
	PATH="$$PWD/node_modules/.bin:$$PATH" make -C test

.PHONY: models dev test release
