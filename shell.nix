{ pkgs ? import <nixpkgs> {}
}:

let
  base = import ./base.nix { inherit pkgs; };
in

base.overrideAttrs (old: {
  shellHook = ''
    export PATH=$HOME/.cargo/bin:$PATH
    export PATH=$PWD/test:$PATH

    type -p rustup || curl https://sh.rustup.rs -sSf | sh
    rustup toolchain add nightly

    if ! type -p racer; then
      cargo +nightly install racer
    fi

    rustup component add rust-src rls rust-analysis rustfmt
  '';

  buildInputs = old.buildInputs ++ (with pkgs; [
    remarshal python36
  ]);
})

