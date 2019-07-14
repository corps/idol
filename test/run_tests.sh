#! /usr/bin/env bash

set -e

expand_rs=./target/debug/expand
validate_rs=./target/debug/validate
expand_py=./src/lib/expand.py
validate_py=./src/lib/validate.py
failed=

function test_expand() {
  local case=$1

  for expand in $expand_rs $expand_py; do
    if failed="${failed}
$(
      set -e
      local result=$(cat $case | $expand | jq -S .)
      local expected=$(cat expected/$(basename $case) | jq -S .)
      if test "$result" != "$expected"; then
        echo
        echo Case $case failed using $expand!
        diff <(echo "$expected") <(echo "$result")
        echo
        exit 1
      fi
)"; then
      echo -n "."
    else
      echo -n "X"
    fi
  done
}

function test_validate() {
  local case=$1

  for validate in $validate_rs $validate_py; do
    if failed="${failed}
$(
      set -e
      if cat $case | $validate; then
        if ! test -e expected/$(basename $case); then
          echo Case $case failed!
          echo Expected input to not be valid, but was!
          exit 1
        fi
      else
        if test -e expected/$(basename $case); then
          echo
          echo Case $case failed using $validate!
          echo Expected input to be valid, but was not!
          exit 1
        fi
      fi
)"; then
      echo -n "."
    else
      echo -n "X"
    fi
  done
}

# expand cases
for file in cases/expand_*.json; do
  test_expand $file
done

# validate cases
for file in cases/validate_*.json; do
  test_validate $file
done

echo

if ! test -z "$failed"; then
  echo "$failed"
  exit 1
fi
