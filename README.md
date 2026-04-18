# FWA Microfrontends

Репозиторий переведен на монорепозиторий с `npm workspaces` и `webpack module federation`.

Структура:

- `apps/host` — shell-приложение: авторизация, header, footer, навигация, fallback для недоступных remote.
- `apps/remote-main` — основной пользовательский микрофронт: свайпы, лайкнутые анкеты, настройки, финальный экран.
- `apps/remote-admin` — админ-микрофронт.
- `packages/shared-ui` — общий UI, auth context, hooks, страницы и стили.
- `packages/webpack-config` — общая webpack-конфигурация.
- `shared` — общие типы.

Запуск локальной сборки:

```bash
npm install
npm run build
```

Dev stack через Docker:

```bash
bash ./dev.sh
```

Адреса:

- host: `http://localhost:3003`
- remote-main: `http://localhost:3004`
- remote-admin: `http://localhost:3005`
- gateway: `http://localhost:3000`

Production stack через Docker Compose:

```bash
docker compose up --build
```

Адреса:

- host: `http://localhost`
- remote-main: `http://localhost:3004`
- remote-admin: `http://localhost:3005`

Отказоустойчивость:

- каждый frontend работает в отдельном контейнере;
- host загружает remotes через Module Federation;
- если remote остановлен или недоступен, host не падает и показывает сообщение: что-то сломалось, скоро все починим.
