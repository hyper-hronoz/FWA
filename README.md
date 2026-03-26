# FWA

В репозитории теперь есть три клиентских варианта:

- `frontend/` — исходная версия из предыдущей лабораторной.
- `frontend-rtk/` — версия с `Redux Toolkit` и `RTK Query`.
- `frontend-mobx/` — версия с `MobX`.

Обе новые версии сохраняют существующий UI и переводят backend-данные в менеджер состояний:

- текущий пользователь и авторизация;
- анкеты для свайпов;
- лайкнутые анкеты;
- данные админ-панели.

Кэширование:

- `frontend-rtk` использует встроенный кэш `RTK Query`;
- `frontend-mobx` использует store-кэш с TTL и инвалидацией после мутаций.

Повторное использование одних и тех же данных:

- запрос лайкнутых анкет используется и на странице `Liked`, и в `ProfileSettings` для вывода дополнительной статистики о пользователе.

Запуск:

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

Сборка проверена:

- `cd frontend-rtk && npm run build`
- `cd frontend-mobx && npm run build`
