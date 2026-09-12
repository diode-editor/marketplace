# diode marketplace

Магазин расширений Diode — веб-смотрелка [курируемого реестра](https://github.com/diode-editor/diode-editor.github.io).
Живёт на <https://diode-editor.github.io/marketplace/>.

Сейчас это **заглушка без дизайна**: она доказывает сквозной путь — CI собирает
Vite-бандл и деплоит на GitHub Pages, приложение читает публичное API реестра
(`/registry/v1/index.json` и `/registry/v1/meta/<id>.json`, тот же origin) и
показывает список и карточку расширения. Дизайн приедет следующим шагом —
по дизайн-системе diode.

## Устройство

```
src/registry/client.ts   единственное место, знающее контракт registry/v1
src/App.tsx              список + карточка, hash-роутинг (#/ext/<id>)
.github/workflows/       build на PR, build+deploy на push в main
```

Типы контракта срисованы с норматива `registryFormat.ts` в
[репозитории редактора](https://github.com/diode-editor/diode)
(`src/vs/platform/extensionManagement/common/`). Ломающая смена контракта
приедет как `/v2` рядом с `/v1` — тогда обновляется только `client.ts`.

## Разработка

```sh
npm ci
npm run dev     # dev-сервер; данные тянутся с прода diode-editor.github.io
npm run build   # typecheck + прод-сборка в dist/
```
