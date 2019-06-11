MODELS     := $(wildcard src/models/*.toml)
SOURCE_FILES = $(find src -type f | egrep ".*\.rs" | grep -v "bin/")

dev: target/debug/idol target/debug/idol_rs models

target/debug/idol: src/*.rs $(SOURCE_FILES) src/bin/idol.rs
	cargo build --bin idol

target/debug/idol_rs: src/*.rs $(SOURCE_FILES) src/bin/idol_rs.rs
	cargo build --bin idol_rs

models: $(MODELS)
	./target/debug/idol $? | ./target/debug/idol_rs --output src/models/ --mod "crate::models"

.PHONY: models dev
