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
                  validate-ooxml "$DEVENV_ROOT/demo/outputs/$1.docx"
                '';
                run-demos.exec = ''
                  set -eou pipefail

                  for i in "$DEVENV_ROOT/demo/examples/"*.ts; do
                    run-demo "$(basename $i .ts)"
                    echo
                  done
                '';
                cat-ooxml.exec = ''
                  set -eou pipefail

                  unzip -p "$1" "''${2:-word/document.xml}" | xmllint --format -
                '';
                validate-ooxml.exec = ''
                  set -eou pipefail

                  xml_cat() {
                    unzip -p "$1" "$2" | \
                      xmllint --format - | \
                      sed 's|http://schemas.openxmlformats.org/officeDocument/2006/extended-properties|http://purl.oclc.org/ooxml/officeDocument/extendedProperties|g' | \
                      sed 's|http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes|http://purl.oclc.org/ooxml/officeDocument/docPropsVTypes|g' | \
                      sed 's|http://schemas.openxmlformats.org/officeDocument/2006/relationships|http://purl.oclc.org/ooxml/officeDocument/relationships|g' | \
                      sed 's|http://schemas.openxmlformats.org/wordprocessingml/2006/main|http://purl.oclc.org/ooxml/wordprocessingml/main|g' | \
                      sed 's|http://schemas.openxmlformats.org/drawingml/2006/main|http://purl.oclc.org/ooxml/drawingml/main|g' | \
                      sed 's|http://schemas.openxmlformats.org/drawingml/2006/picture|http://purl.oclc.org/ooxml/drawingml/picture|g' | \
                      sed 's|http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing|http://purl.oclc.org/ooxml/drawingml/wordprocessingDrawing|g'
                  }

                  xml_validation() {
                    echo -n "$2:"
                    xml_cat "$1" "$2" | xmllint --schema "$3" --noout - || \
                      (xml_cat "$1" "$2" | cat -n ; exit 1)
                  }

                  xml_validation "$1" "\\[Content_Types\\].xml" "$DEVENV_ROOT/schema/ooxml/opc-contentTypes.xsd"
                  xml_validation "$1" docProps/core.xml "$DEVENV_ROOT/schema/ooxml/opc-coreProperties.xsd"
                  xml_validation "$1" docProps/app.xml "$DEVENV_ROOT/schema/ooxml/shared-documentPropertiesExtended.xsd"
                  xml_validation "$1" _rels/.rels "$DEVENV_ROOT/schema/ooxml/opc-relationships.xsd"
                  xml_validation "$1" word/_rels/document.xml.rels "$DEVENV_ROOT/schema/ooxml/opc-relationships.xsd"

                  wml_files=(
                    word/document.xml
                    word/styles.xml
                    word/settings.xml
                    word/fontTable.xml
                  )
                  wml_files+=(
                    $(unzip -lqq "$1" | grep -o -E 'word/(header|firstHeader|evenHeader|footer|firstFooter|evenFooter|numbering)([0-9]+)?\.xml$' || echo)
                  )
                  echo "''${wml_files[@]}"
                  for i in "''${wml_files[@]}"; do
                    xml_validation "$1" "$i" "$DEVENV_ROOT/schema/ooxml/wml.xsd"
                  done
                '';
              };
            }
          ];
        };
      }
    );
}
