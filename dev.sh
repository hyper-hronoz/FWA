#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

COMPOSE_FILE="docker-compose.dev.yaml"

usage() {
  cat <<'EOF'
Usage:
  ./dev.sh           Start dev stack with hot reload
  ./dev.sh down      Stop dev stack
  ./dev.sh logs      Show logs
  ./dev.sh restart   Restart dev stack
EOF
}

require_tools() {
  command -v docker >/dev/null 2>&1 || {
    echo "docker is required" >&2
    exit 1
  }

  docker compose version >/dev/null 2>&1 || {
    echo "docker compose is required" >&2
    exit 1
  }
}

compose() {
  docker compose -f "$COMPOSE_FILE" "$@"
}

start() {
  compose up -d db
  compose up -d service-auth service-users service-girls service-gateway
  compose up -d frontend-host frontend-remote-main frontend-remote-admin

  cat <<'EOF'
Dev stack started.

Frontend:
  host         http://localhost:3003
  remote-main  http://localhost:3004
  remote-admin http://localhost:3005

Backend:
  gateway       http://localhost:3000
  service-auth  http://localhost:3001
  service-girls http://localhost:3002
  service-users http://localhost:3103

Logs:
  ./dev.sh logs
Stop:
  ./dev.sh down
EOF
}

main() {
  require_tools

  case "${1:-up}" in
    up)
      start
      ;;
    down)
      compose down
      ;;
    logs)
      compose logs -f
      ;;
    restart)
      compose down
      start
      ;;
    help|-h|--help)
      usage
      ;;
    *)
      echo "Unknown command: $1" >&2
      usage
      exit 1
      ;;
  esac
}

main "$@"
