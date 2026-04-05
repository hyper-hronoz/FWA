# FWA — клиенты для ЛР3 (состояние)

В проекте три фронтенда:

| Папка | Назначение |
|--------|------------|
| `frontend/` | Базовая версия (контекст и хуки), как в предыдущей лабораторной. |
| `frontend-rtk/` | **Redux Toolkit** + **RTK Query**: `src/redux/services/backendApi.ts`, слайсы `session` и `swipeDeck`. |
| `frontend-mobx/` | **MobX** (`mobx`, `mobx-react-lite`): один класс `ApplicationStore` в `src/state/applicationStore.ts`. |

Требования ЛР3:

- Данные с API (пользователь, очередь свайпов, лайки, админ-список) идут через выбранный менеджер состояния.
- **Кэш:** у RTK Query — штатный кэш эндпоинтов и теги `Session`, `SwipeQueue`, `Favorites`, `AdminCatalog`; у MobX — временные метки и TTL **45 с**, сброс после лайков/анлайков и CRUD в админке.
- **Общие данные:** список лайкнутых переиспользуется на `/liked` и в блоке статистики в `ProfileSettings` (разный текст подсказок в RTK и MobX).

Запуск (нужен поднятый gateway, как раньше):

```bash
cd frontend-rtk
npm install
npm run dev
```

```bash
cd frontend-mobx
npm install
npm run dev
```

Проверка сборки:

```bash
cd frontend-rtk && npm run build
cd frontend-mobx && npm run build
```

### Docker (все три фронта сразу)

Из корня `FWA`:

```bash
docker compose up --build
```

| Сервис в compose | URL на машине | Содержимое |
|------------------|---------------|------------|
| `frontend` | http://localhost:5000 | классический вариант (`frontend/`) |
| `frontend-rtk` | http://localhost:5001 | Redux Toolkit + RTK Query |
| `frontend-mobx` | http://localhost:5002 | MobX |

API по-прежнему с хоста: **http://localhost:3000** (gateway), как в `src/config/api.ts`.

Полезные материалы: [Redux Toolkit](https://redux-toolkit.js.org/), [MobX + React](https://mobx.js.org/react-integration.html).
