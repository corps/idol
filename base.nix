{ pkgs ? import <nixpkgs> {}
}:

pkgs.stdenvNoCC.mkDerivation rec {
  name = "idol-latest";

  buildInputs = with pkgs; [
    openssl pkgconfig
  ];

  nativeBuildInputs = with pkgs; [
    gcc-unwrapped cmake
  ];
}
