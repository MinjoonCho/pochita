#!/bin/zsh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/../../pochita-server" && pwd)"

if [[ -x "$BACKEND_DIR/gradlew" ]]; then
  cd "$BACKEND_DIR"
  exec ./gradlew bootRun
fi

if command -v gradle >/dev/null 2>&1; then
  cd "$BACKEND_DIR"
  exec gradle bootRun
fi

if command -v docker >/dev/null 2>&1; then
  cd "$BACKEND_DIR"
  mkdir -p "$BACKEND_DIR/.data"
  docker build -t pochita-server-local .
  exec docker run --rm -p 8080:8080 --name pochita-server-local \
    -v "$BACKEND_DIR/.data:/app/data" \
    pochita-server-local
fi

echo "No supported backend runtime found. Install Gradle or start Docker Desktop." >&2
exit 1
