#! /usr/bin/env bash
export PATH=$(npm bin):$PATH

set -e

expand_rs=./target/debug/expand
validate_rs=./target/debug/validate
expand_py="python3 -m src.lib.expand"
validate_py="python3 -m src.lib.validate"
expand_js=./src/lib/expand.js
validate_js=./src/lib/validate.js
validate_graphql=./src/lib/validate_graphql.js
failed=

function test_expand() {
  local case=$1

  for expand in $expand_rs "$expand_py" $expand_js; do
    if failed="${failed}$(
      set -e
      local result=$(cat $case | $expand | jq -S .)
      local expected=$(cat expected/$(basename $case) | jq -S .)
      if test "$result" != "$expected"; then
        echo
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

  for validate in $validate_rs "$validate_py" $validate_js "$validate_graphql"; do
    if failed="${failed}$(
      set -e
      if cat $case | $validate; then
        if ! test -e expected/$(basename $case); then
          echo
          echo
          echo Case $case failed!
          echo Expected input to not be valid, but was!
          exit 1
        fi
      else
        if test -e expected/$(basename $case); then
          echo
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

if test -z "$failed"; then
  cat ./cases/expand_empty.json | $expand_rs > ./cases/validate_expanded_empty.json
  touch ./expected/validate_expanded_empty.json
fi

# validate cases
for file in cases/validate_*.json; do
  test_validate $file
done

echo

if ! test -z "$failed"; then
  echo "'$failed'"
  exit 1
fi

echo "Passed"
