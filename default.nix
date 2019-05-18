{ pkgs ? import <nixpkgs> { overlays = [ moz_overlay ]; }
, moz_overlay ? import (builtins.fetchTarball https://github.com/mozilla/nixpkgs-mozilla/archive/master.tar.gz)
, rustChannel ? pkgs.rustChannelOf {
    date = "2019-05-14";
    channel = "stable";
  }
}:

let
  base = import ./base.nix { inherit pkgs; };
in

base.overrideAttrs (old: {
  buildInputs = old.buildInputs ++ (with rustChannel; [rust cargo rust-src]);
})

