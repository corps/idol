#! /usr/bin/env bash

idol=../../target/debug/idol_composition
export RUST_BACKTRACE=1

rm -rf actual
mkdir actual

for file in cases/*; do
  actual="actual/$(basename "$file" | cut -f 1 -d '.')"
  expected="expected/$(basename "$file" | cut -f 1 -d '.')"

  $idol -I ./test_imports / -- $file 2>$actual.err 1>$actual.txt
  # Ony failure
  if test $? -ne 0; then
    # If we expect success,
    if test -e $expected.txt; then
      echo "$file composition failed unexpectedly!  Err output was:
$(cat $actual.err)"
      exit 1
    # If we don't have a failure case yet
    elif ! test -e $expected.err; then
      echo "$file composition failed!  Check $expected.err, output has been added there."
      cp $actual.err $expected.err
    # If we don't expect success and we already have a failure case
    else
      if [[ "$(cat $actual.err)" != "$(cat $expected.err)" ]]; then
        echo "$file composition failed, but output did not match expectation!"
        diff <(cat $actual.err) <(cat $expected.err)
        exit 1
      fi
    fi
  else
    if test -e $expected.err; then
      echo "$file composition succeeded unexpectedly! Expected err:
$(cat $expected.err)"
      exit 1
    elif ! test -e $expected.txt; then
      echo "No $expected.txt file found, creating out from output"
      cat $actual.txt > $expected.txt
    else
      if [[ "$(cat $expected.txt)" != "$(cat $actual.txt)" ]]; then
        echo "$file composition did not match expectation!"
        diff <(cat $actual.txt) <(cat $expected.txt)
        exit 1
      fi
    fi
  fi
done
