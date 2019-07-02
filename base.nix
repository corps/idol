{ pkgs ? import <nixpkgs> {}
}:

pkgs.stdenv.mkDerivation rec {
  name = "idol-latest";

  buildInputs = with pkgs; [
    openssl pkgconfig
  ];

  nativeBuildInputs = with pkgs; [
    gcc-unwrapped
  ];
}
