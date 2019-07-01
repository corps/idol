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
  buildInputs = old.buildInputs ++ (with rustChannel; [
    (rust.override {
      extensions = [ "rust-std" "rust-src" ];
    })
    cargo rust-src
  ] ++ (with pkgs; [
    cacert
  ]));

  src = ./.;

  dontPatchELF = true;

  buildPhase = ''
    export HOME=$(mktemp -d)
    cargo build --release
  '';

  installPhase = ''
    mkdir $out
    for file in ./target/release/*; do
      echo $file
      test -x $file && test -f $file && cp $file $out/
    done

    echo 'done'
  '';
})
