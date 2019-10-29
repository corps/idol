MODELS       = $(shell find src/models -type f | grep ".*\.toml")
SOURCE_FILES = $(shell find src -type f | egrep ".*\.rs" | grep -v "bin/")

test: clean test_bins models
	./run_generator_tests.sh
	./run_composition_tests.sh

test_bins: target/debug/expand target/debug/validate

target/debug/expand: $(SOURCE_FILES) src/bin/expand.rs models ../target/debug/idol ../target/debug/idol_rs
	cargo build --bin expand

target/debug/validate: $(SOURCE_FILES) src/bin/validate.rs models ../target/debug/idol ../target/debug/idol_rs
	cargo build --bin validate

clean:
	rm -rf src/lib/idol
	rm -rf composed

models: $(MODELS)
	../target/debug/idol $? > build.json
	python --version
	node --version
	npm --version
	npm install
	$$(npm bin)/babel-node --version
	pip install -e ../src/lib
	cat build.json | ../target/debug/idol_rs --output src/models/ --mod "crate::models"
	cat build.json | idol_py --output src/lib/idol/py --target all.target
	cat build.json | idol_mar --output src/lib/idol/py_mar --target all.target
	cat build.json | $$(npm bin)/idol_js --output src/lib/idol/js --target all.target
	cat build.json | $$(npm bin)/idol_graphql --output src/lib/idol/graphql --target all.target
	cat build.json | $$(npm bin)/idol_flow.js --output src/lib/idol/flow --target all.target

.PHONY: models test_bins test clean
