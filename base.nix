{ pkgs ? import <nixpkgs> {}
}:

(pkgs.stdenv.override { cc = pkgs.gcc-unwrapped; }).mkDerivation rec {
  name = "idol-latest";

  buildInputs = with pkgs; [
    openssl pkgconfig
  ];
}
