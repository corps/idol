MODELS       = $(shell find src/models -type f | grep ".*\.toml")
SOURCE_FILES = $(shell find src -type f | egrep ".*\.rs" | grep -v "bin/")

test: test_bins
	./run_tests.sh

test_bins: target/debug/expand target/debug/validate

target/debug/expand: $(SOURCE_FILES) src/bin/expand.rs models ../target/debug/idol ../target/debug/idol_rs
	cargo build --bin expand

target/debug/validate: $(SOURCE_FILES) src/bin/validate.rs models ../target/debug/idol ../target/debug/idol_rs
	cargo build --bin validate

models: $(MODELS)
	../target/debug/idol $? > build.json
	export PATH="$$PWD:$$PATH"
	python3 --version
	cat build.json | ../target/debug/idol_rs --output src/models/ --mod "crate::models"
	cat build.json | ../src/bin/idol_py.py --output src/lib/idol --mod "idol"

.PHONY: models test_bins test
