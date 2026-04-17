#!/usr/bin/env bash
set -euo pipefail

docker compose down --remove-orphans
docker compose down -v --remove-orphans
docker compose build --no-cache
docker compose up -d
docker compose ps
