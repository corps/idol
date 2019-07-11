#! /usr/bin/env bash

set -e

expand=./target/debug/expand
validate=./target/debug/validate

function test_expand() {
  local case=$1

  if (
    set -e
    local result=$(cat $case | $expand | jq)
    expected=$(cat expected/$(basename $case) | jq)
    if test "$result" != "$expected"; then
      echo "Case $case failed!" 1>&2
      echo "Expected $expected but got $result" 1>&2
      exit 1
    fi
  ); then
    echo -n "."
  else
    return 1
  fi
}

# expand cases
failed=
for file in cases/expand_*.json; do
  if ! test_expand $file; then
    failed=1
  fi
done

if ! test -z "$failed"; then
  exit 1
fi
