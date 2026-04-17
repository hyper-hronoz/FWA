#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

COMPOSE_CMD=(docker compose)

usage() {
  cat <<'EOF'
Usage:
  ./rebuild-fast.sh           Rebuild only services affected by current git changes
  ./rebuild-fast.sh --full    Rebuild and restart the whole stack without dropping volumes
  ./rebuild-fast.sh --help    Show this help

Notes:
  - The script uses docker build cache by default for faster rebuilds.
  - MySQL volume is preserved.
  - If git shows no local changes, the script only ensures containers are up.
EOF
}

log() {
  printf '[rebuild-fast] %s\n' "$*"
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

append_unique() {
  local item="$1"
  shift
  local existing

  for existing in "$@"; do
    if [[ "$existing" == "$item" ]]; then
      return 1
    fi
  done

  return 0
}

git_changes() {
  git status --porcelain --untracked-files=all | sed 's/^.. //'
}

restart_service() {
  local service="$1"
  log "Restarting $service"
  "${COMPOSE_CMD[@]}" up -d --no-deps "$service"
}

rebuild_service() {
  local service="$1"
  log "Rebuilding $service"
  "${COMPOSE_CMD[@]}" up -d --build "$service"
}

full_rebuild() {
  log "Rebuilding the whole stack"
  "${COMPOSE_CMD[@]}" up -d --build
}

main() {
  require_tools

  if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
    usage
    exit 0
  fi

  if [[ "${1:-}" == "--full" ]]; then
    full_rebuild
    exit 0
  fi

  mapfile -t changed_files < <(git_changes)

  if [[ "${#changed_files[@]}" -eq 0 ]]; then
    log "No local git changes found. Ensuring containers are running."
    "${COMPOSE_CMD[@]}" up -d
    exit 0
  fi

  local rebuild_all=0
  local ensure_stack=0
  local restart_frontend=0
  local restart_gateway=0
  local restart_girls=0
  local file
  local service
  local rebuild_services=()

  for file in "${changed_files[@]}"; do
    case "$file" in
      frontend/*|shared/*|frontend/Dockerfile|nginx.conf)
        if append_unique "frontend" "${rebuild_services[@]}"; then
          rebuild_services+=("frontend")
        fi
        ;;
      backend/service-gateway/*)
        if append_unique "service-gateway" "${rebuild_services[@]}"; then
          rebuild_services+=("service-gateway")
        fi
        ;;
      backend/services/service-auth/*)
        if append_unique "service-auth" "${rebuild_services[@]}"; then
          rebuild_services+=("service-auth")
        fi
        if append_unique "service-gateway" "${rebuild_services[@]}"; then
          rebuild_services+=("service-gateway")
        fi
        ;;
      backend/services/service-users/*)
        if append_unique "service-users" "${rebuild_services[@]}"; then
          rebuild_services+=("service-users")
        fi
        if append_unique "service-gateway" "${rebuild_services[@]}"; then
          rebuild_services+=("service-gateway")
        fi
        ;;
      backend/services/service-girls/*)
        if append_unique "service-girls" "${rebuild_services[@]}"; then
          rebuild_services+=("service-girls")
        fi
        if append_unique "service-gateway" "${rebuild_services[@]}"; then
          rebuild_services+=("service-gateway")
        fi
        ;;
      backend/static/videos/*|backend/static/avatars/*)
        restart_frontend=1
        restart_gateway=1
        restart_girls=1
        ;;
      backend/static/*)
        restart_gateway=1
        restart_girls=1
        ;;
      backend/docker/mysql/init/*)
        ensure_stack=1
        ;;
      docker-compose.yaml|.env|.env.example)
        rebuild_all=1
        ;;
      backend/package.json|backend/package-lock.json)
        rebuild_all=1
        ;;
      README.md|TODO.txt|LICENSE|.gitignore|backend/.gitignore|frontend/.gitignore)
        ;;
      *)
        rebuild_all=1
        ;;
    esac
  done

  if [[ "$rebuild_all" -eq 1 ]]; then
    full_rebuild
    exit 0
  fi

  if [[ "$ensure_stack" -eq 1 ]]; then
    log "Applying stack-level changes"
    "${COMPOSE_CMD[@]}" up -d
  fi

  if [[ "${#rebuild_services[@]}" -eq 0 && "$restart_frontend" -eq 0 && "$restart_gateway" -eq 0 && "$restart_girls" -eq 0 ]]; then
    log "Only non-runtime files changed. Ensuring containers are running."
    "${COMPOSE_CMD[@]}" up -d
    exit 0
  fi

  for service in "${rebuild_services[@]}"; do
    rebuild_service "$service"
  done

  if [[ "$restart_girls" -eq 1 ]]; then
    restart_service "service-girls"
  fi

  if [[ "$restart_gateway" -eq 1 ]]; then
    restart_service "service-gateway"
  fi

  if [[ "$restart_frontend" -eq 1 ]]; then
    restart_service "frontend"
  fi

  log "Done"
}

main "$@"
