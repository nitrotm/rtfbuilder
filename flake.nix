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
                gh
                libxml2
                jq
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
                release-preflight.exec = ''
                  set -eou pipefail

                  # check that gh cli is authenticated
                  if ! gh auth status -a >/dev/null 2>&1; then
                    echo "Error: run 'gh auth login -h github.com -p ssh --skip-ssh-key -w' first"
                    exit 1
                  fi

                  # check that repo is up-to-date
                  if [[ ! -z "$(git status --porcelain)" ]]; then
                    echo "Error: uncommitted changes detected"
                    git status
                    exit 1
                  fi

                  # check that we are on the main branch
                  if [[ ! "$(git branch --show-current)" == "main" ]]; then
                    echo "Error: not on main branch, currently on $(git branch --show-current)"
                    exit 1
                  fi

                  # check that package can be built
                  (cd ./jsx-runtime && yarn install --immutable && yarn build)
                  yarn install --immutable && yarn build

                  # bump package version
                  yarn version "''${1:-patch}"
                  tag="v$(jq -r '.version' package.json)"
                  git add package.json && git commit -m "release $tag"

                  # tag version & push to main and tag
                  git tag "$tag" HEAD && git push && git push origin "$tag"

                  # create draft release
                  gh release create "$tag" --draft --generate-notes
                '';
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

                  wml_files=(
                    word/document.xml
                    word/styles.xml
                    word/settings.xml
                    word/fontTable.xml
                  )
                  wml_files+=(
                    $(unzip -lqq "$1" | grep -o -E 'word/(header|firstHeader|evenHeader|footer|firstFooter|evenFooter|numbering|footnotes|endnotes|comments)([0-9]+)?\.xml$' || echo)
                  )
                  for i in "''${wml_files[@]}"; do
                    xml_validation "$1" "$i" "$DEVENV_ROOT/schema/ooxml/wml.xsd"
                  done

                  rel_files=(
                    word/_rels/document.xml.rels
                  )
                  rel_files+=(
                    $(unzip -lqq "$1" | grep -o -E 'word/_rels/(header|firstHeader|evenHeader|footer|firstFooter|evenFooter|numbering|footnotes|endnotes|comments)([0-9]+)?\.xml\.rels$' || echo)
                  )
                  for i in "''${rel_files[@]}"; do
                    xml_validation "$1" "$i" "$DEVENV_ROOT/schema/ooxml/opc-relationships.xsd"
                  done
                '';
              };
            }
          ];
        };
      }
    );
}
