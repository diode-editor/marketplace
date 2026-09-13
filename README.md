# diode marketplace

Магазин расширений Diode — веб-смотрелка [курируемого реестра](https://github.com/diode-editor/diode-editor.github.io).
Живёт на <https://diode-editor.github.io/marketplace/>.

Дизайн — по канвасу «Extensions Store.dc.html» и дизайн-системе diode в
claude.ai/design: главная (артборды 1a/1d), страница расширения (1c),
страница языка (по мотивам 1b). Токены и компоненты в `src/ds/` — снапшот
дизайн-системы, правки дизайна живут там и приезжают сюда синком.

## Устройство

```
src/registry/client.ts   единственное место, знающее контракт registry/v1
src/curation.ts          фичи магазина поверх реестра: подборка главной,
                         языковые страницы, привязка расширений к языкам
src/ds/                  дизайн-система diode: токены (css) и компоненты
src/pages/               главная, страница расширения, страница языка
.github/workflows/       build на PR, build+deploy на push в main
```

Роутинг — hash (`#/ext/<id>`, `#/lang/<id>`): прямые ссылки работают на
GitHub Pages без 404-трюков. Данные — рантайм-fetch `registry/v1/index.json`
и `meta/<id>.json` с того же origin.

Типы контракта срисованы с норматива `registryFormat.ts` в
[репозитории редактора](https://github.com/diode-editor/diode)
(`src/vs/platform/extensionManagement/common/`). Ломающая смена контракта
приедет как `/v2` рядом с `/v1` — тогда обновляется только `client.ts`.
Когда в `v1` появится поле `languages` (извлекается из манифестов vsix при
сборке реестра), привязка расширений к языкам уйдёт из `curation.ts` в данные.

## Разработка

```sh
npm ci
npm run dev     # dev-сервер; данные тянутся с прода diode-editor.github.io
npm run build   # typecheck + прод-сборка в dist/
```
