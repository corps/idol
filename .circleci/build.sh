#! /usr/bin/env bash

set -e

if ! [[ -e ./result ]]; then
  nix-shell default.nix --run 'export HOME=$(mktemp -d); cargo test'
  nix-build
fi

program='
export GOPATH=$(mktemp -d)
go get -u github.com/tcnksm/ghr
echo $GOPATH/bin
'

export PATH=$(nix-shell -p go --run "$program"):$PATH
export VERSION="$(./result/bin/idol --version | cut -d' ' -f2)"

mkdir release
cd result
tar c bin | gzip > ../release/idol-$(uname | tr '[:upper:]' '[:lower:]')-$(uname -m).tar.gz
cd ..

ghr -t ${GITHUB_TOKEN} -u ${CIRCLE_PROJECT_USERNAME} -r ${CIRCLE_PROJECT_REPONAME} -c ${CIRCLE_SHA1} ${VERSION} ./release
