MODELS     := $(wildcard src/models/*.toml)
SOURCE_FILES = $(shell find src -type f | egrep ".*\.rs" | grep -v "bin/")

release: target/release/idol target/release/idol_rs

dev: target/debug/idol target/debug/idol_rs models

target/debug/idol: src/*.rs $(SOURCE_FILES) src/bin/idol.rs
	cargo build --bin idol

target/debug/idol_rs: src/*.rs $(SOURCE_FILES) src/bin/idol_rs.rs
	cargo build --bin idol_rs

target/release/idol: src/*.rs $(SOURCE_FILES) src/bin/idol.rs
	cargo build --bin idol --release

target/release/idol_rs: src/*.rs $(SOURCE_FILES) src/bin/idol_rs.rs
	cargo build --bin idol_rs --release

models: $(MODELS)
	./target/debug/idol $? > build.json
	python3 --version
	cat build.json | ./target/debug/idol_rs --output src/models/ --mod "crate::models"
	cat build.json | ./src/bin/idol_py.py --output src/lib/idol --mod "idol"

test: target/debug/idol target/debug/idol_rs models
	cargo test
	make -C test

.PHONY: models dev test release
