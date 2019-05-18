{ pkgs ? import <nixpkgs> {}
}:

pkgs.stdenv.mkDerivation {
  name = "idol";
  buildInputs = with pkgs; [
    openssl pkgconfig 
  ];
}
