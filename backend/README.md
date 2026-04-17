# Anime Dating Project

## Requirements

Install:

- Docker
- Docker Compose
- Git

## Setup

Clone repository

git clone https://github.com/hyper-hronoz/FWA

Go to project

cd anime-dating

Create .env file

cp .env.example .env

Edit `.env` and set both `DB_PASSWORD` and `DB_ROOT_PASSWORD`.

If you already started MySQL before changing credentials, the existing Docker volume keeps the old users/passwords. In that case recreate the DB volume or manually create/update the `DB_USER` account inside MySQL.

Run project

docker compose up --build
