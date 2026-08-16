{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.nodejs_22      # Node 22 LTS (Expo SDK 57 / RN 0.86 compatible)
    pkgs.watchman       # Metro's file watcher
    pkgs.git
  ];

  shellHook = ''
    echo "Expo devshell ready — node $(node -v), npm $(npm -v)"
    if [ ! -d node_modules ]; then
      echo "node_modules missing — running npm install..."
      npm install
    fi
  '';
}