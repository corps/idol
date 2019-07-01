{ pkgs ? import <nixpkgs> {}
}:

pkgs.stdenv.mkDerivation rec {
  name = "idol-${version}";
  version = "0.1.0";

  buildInputs = with pkgs; [
    openssl pkgconfig
  ];
}
