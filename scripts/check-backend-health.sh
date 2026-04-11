#!/bin/zsh
set -euo pipefail

curl --fail --silent http://localhost:8080/api/health
echo
