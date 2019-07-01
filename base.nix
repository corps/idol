{ pkgs ? import <nixpkgs> {}
}:

pkgs.stdenv.mkDerivation rec {
  name = "idol-latest";

  buildInputs = with pkgs; [
    openssl pkgconfig
  ];
}
