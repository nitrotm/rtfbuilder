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
                libxml2
                nodejs
                nodePackages.prettier
                xmlformat
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
                run-demo.exec = ''
                  set -eou pipefail

                  mkdir -p "$DEVENV_ROOT/demo/outputs/"

                  echo "$1:"
                  tsx "$DEVENV_ROOT/demo/cli.ts" --validate "$1" "$DEVENV_ROOT/demo/outputs/$1.docx"
                  tsx "$DEVENV_ROOT/demo/cli.ts" --validate "$1" "$DEVENV_ROOT/demo/outputs/$1.rtf"
                '';
                run-demos.exec = ''
                  set -eou pipefail

                  mkdir -p "$DEVENV_ROOT/demo/outputs/"
                  for i in "$DEVENV_ROOT/demo/examples/"*.ts; do
                    run-demo "$(basename $i .ts)"
                    tsx "$DEVENV_ROOT/demo/cli.ts" --validate "$(basename $i .ts)" "$DEVENV_ROOT/demo/outputs/$(basename $i .ts).docx"
                    tsx "$DEVENV_ROOT/demo/cli.ts" --validate "$(basename $i .ts)" "$DEVENV_ROOT/demo/outputs/$(basename $i .ts).rtf"
                    echo
                  done
                '';
                validate-docx.exec = ''
                  set -eou pipefail

                  xml_validation() {
                    echo -n "$2:"
                    unzip -p "$1" "$2" | \
                      xmllint --format - | \
                      xmllint --schema "$3" --noout - || \
                      (unzip -p "$1" "$2" | xmllint --format - | cat -n ; exit 1)
                  }

                  xml_validation "$1" "\\[Content_Types\\].xml" "$DEVENV_ROOT/schema/ooxml/opc-contentTypes.xsd"
                  xml_validation "$1" docProps/core.xml "$DEVENV_ROOT/schema/ooxml/opc-coreProperties.xsd"
                  xml_validation "$1" docProps/app.xml "$DEVENV_ROOT/schema/ooxml/shared-documentPropertiesExtended.xsd"
                  xml_validation "$1" _rels/.rels "$DEVENV_ROOT/schema/ooxml/opc-relationships.xsd"
                  xml_validation "$1" word/_rels/document.xml.rels "$DEVENV_ROOT/schema/ooxml/opc-relationships.xsd"
                  xml_validation "$1" word/document.xml "$DEVENV_ROOT/schema/ooxml/wml.xsd"
                  xml_validation "$1" word/styles.xml "$DEVENV_ROOT/schema/ooxml/wml.xsd"
                  xml_validation "$1" word/settings.xml "$DEVENV_ROOT/schema/ooxml/wml.xsd"
                  xml_validation "$1" word/fontTable.xml "$DEVENV_ROOT/schema/ooxml/wml.xsd"
                '';
              };
            }
          ];
        };
      }
    );
}
