#! /usr/bin/env bash

idol=../../target/debug/idol_composition
export RUST_BACKTRACE=1

rm -rf actual
mkdir actual

for file in cases/*; do
  actual="actual/$(basename "$file" | cut -f 1 -d '.')"
  expected="expected/$(basename "$file" | cut -f 1 -d '.')"

  output=`$idol -I ./common_types / -- $file 2>&1`
  if test $? -ne 0; then
    if ! test -e $expected.err; then
      echo "$file composition failed unexpectedly!  Check $expected.err, output has been added there."
      echo "$output" > $expected.err
    fi

    if [[ "$output" != "$(cat $expected.err)" ]]; then
      echo "$file composition failed unexpectedly!  Check $expected.err, output was
$output"
      exit 1
    fi
  else
    echo "$output" > $actual.json
    if ! test -e $expected.json; then
      echo "No $expected.json file found, creating out from output"
      cat $actual.json | jq -S > $expected.json
    fi

    if [[ "$(cat $expected.json | jq -S)" != "$(cat $actual.json | jq -S)" ]]; then
      echo "$file composition did not match expectation!"
      diff <(cat $expected.json | jq -S) <(cat $actual.json | jq -S)
      exit 1
    fi
  fi
done
