{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.05";
    flake-utils.url = "github:numtide/flake-utils";
    devenv.url = "github:cachix/devenv";
  };

  outputs =
    inputs@{
      self,
      nixpkgs,
      flake-utils,
      devenv,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        inherit (nixpkgs) lib;
        overlay = (
          final: prev: {
            build-revision = self.rev or "HEAD";
          }
        );
        pkgs-config = {
          # allowUnfree = true;
          # permittedInsecurePackages = [ ];
        };
        pkgs = (import nixpkgs) {
          inherit system;

          overlays = [ overlay ];
          config = pkgs-config;
        };
        inherit (pkgs) callPackage;
      in
      rec {
        packages = {
          devenv-up = devShell.config.procfileScript; # see https://github.com/cachix/devenv/issues/756
        };
        devShell = devenv.lib.mkShell {
          inherit inputs pkgs;
          modules = [
            {
              # https://devenv.sh/reference/options/
              dotenv.disableHint = true;
              packages = with pkgs; [
                curl
                gitFull
                nodejs
                nodePackages.prettier
                yarn-berry
              ];
              enterShell = ''
                git --version
              '';
              git-hooks.hooks = {
                shellcheck.enable = true;
                prettier = {
                  enable = true;
                  files = "\\.(js|json|ts)";
                };
              };
              languages = {
                javascript.enable = true;
              };
              scripts = {
                run-demos.exec = ''
                  set -eou pipefail

                  for i in demo/*.ts; do
                    tsx $i demo/$(basename $i .ts).rtf
                  done
                '';
              };
            }
          ];
        };
      }
    );
}
