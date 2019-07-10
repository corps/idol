{ pkgs ? import <nixpkgs> { overlays = [ moz_overlay ]; }
, moz_overlay ? import (builtins.fetchTarball https://github.com/mozilla/nixpkgs-mozilla/archive/master.tar.gz)
, rustChannel ? pkgs.rustChannelOf {
    date = "2019-05-14";
    channel = "stable";
  }
, rustPlatform ? pkgs.makeRustPlatform rustChannel
}:

let
  base = import ./base.nix { inherit pkgs; };
in

base.overrideAttrs (old: {
  nativeBuildInputs = (with rustChannel; [
    (rust.override {
      extensions = [ "rust-std" ];
    })
    cargo rust-src
  ] ++ (with pkgs; [
    cacert gzip coreutils
  ]));

  src = ./.;

  dontPatchELF = true;

  preBuildPhases = [ "setupHomePhase" ];

  setupHomePhase = ''
    export HOME=$(mktemp -d)
  '';

  buildPhase = ''
    set -x
    cargo build --release
  '';

  installPhase = ''
    set -x
    mkdir -p $out/bin

    for file in ./target/release/*; do
      test -x $file && test -f $file && cp $file $out/bin/
    done

    for file in ./src/bin/*; do
      test -x $file && test -f $file && cp $file $out/bin/
    done

    cp -r ./src/lib $out/

    echo 'done'
    set +x
  '';
})
