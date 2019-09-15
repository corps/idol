MODELS       = $(shell find src/models -type f | grep ".*\.toml")
SOURCE_FILES = $(shell find src -type f | egrep ".*\.rs" | grep -v "bin/")

test: clean test_bins models
	./run_tests.sh

test_bins: target/debug/expand target/debug/validate

target/debug/expand: $(SOURCE_FILES) src/bin/expand.rs models ../target/debug/idol ../target/debug/idol_rs
	cargo build --bin expand

target/debug/validate: $(SOURCE_FILES) src/bin/validate.rs models ../target/debug/idol ../target/debug/idol_rs
	cargo build --bin validate

clean:
	rm -rf src/lib/idol

models: $(MODELS)
	../target/debug/idol $? > build.json
	python3 --version
	node --version
	babel-node --version
	npm --version
	npm run compile
	cat build.json | ../target/debug/idol_rs --output src/models/ --mod "crate::models"
	cat build.json | ../src/bin/idol_py.py --output src/lib/idol/py --target all.target
	cat build.json | ../src/bin/idol_js.js --output src/lib/idol --target all.target
	cat build.json | ../src/bin/idol_graphql.js --output src/lib/idol/graphql --target all.target

.PHONY: models test_bins test clean
