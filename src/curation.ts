/**
 * Курация магазина — фича витрины, в API реестра её нет и не будет:
 * подборка главной, языковые страницы и привязка расширений к языкам живут
 * здесь. Когда в registry/v1 появится поле `languages` (извлекается из
 * манифестов vsix при сборке реестра), EXTENSION_LANGUAGES уйдёт, а страницы
 * языков начнут строиться по данным индекса.
 */

export interface LanguageCuration {
    /** Сегмент URL: #/lang/<id>. */
    readonly id: string;
    readonly label: string;
    /**
     * Дополнительные сегменты URL, ведущие на эту же страницу: одна запись
     * может закрывать несколько языков (typescript / javascript), а ссылку
     * снаружи дадут на любой из них.
     */
    readonly aliases?: readonly string[];
    /** Лид на странице языка. */
    readonly blurb: string;
    /** id расширений в порядке важности; первое — в витрине страницы. */
    readonly recommended: readonly string[];
}

/** Подборка главной — отбор мейнтейнеров, порядок значим. */
export const FEATURED: readonly string[] = [
    "detachhead.basedpyright",
    "charliermarsh.ruff",
    "dbaeumer.vscode-eslint",
    "EditorConfig.EditorConfig",
    "maptz.regionfolder",
];

export const LANGUAGES: readonly LanguageCuration[] = [
    {
        id: "python",
        label: "python",
        blurb: "Python support is assembled from registry extensions: type checking and code navigation via basedpyright, linting and formatting via ruff.",
        recommended: ["detachhead.basedpyright", "charliermarsh.ruff"],
    },
    {
        id: "typescript",
        label: "typescript / javascript",
        aliases: ["javascript"],
        blurb: "Types, navigation and completion ship with diode itself — the builtin client runs the stock typescript-language-server. The catalog adds ESLint: diagnostics from the linter installed in your project, quick fixes per rule and fix-on-save.",
        recommended: ["dbaeumer.vscode-eslint"],
    },
];

/** Привязка расширений к языкам — для строк списка и карточек. */
export const EXTENSION_LANGUAGES: Readonly<Record<string, readonly string[]>> = {
    "detachhead.basedpyright": ["python"],
    "charliermarsh.ruff": ["python"],
    "dbaeumer.vscode-eslint": ["typescript"],
};

export function languageById(id: string): LanguageCuration | undefined {
    return LANGUAGES.find((l) => l.id === id || (l.aliases ?? []).includes(id));
}

export function languagesOf(extensionId: string): readonly string[] {
    return EXTENSION_LANGUAGES[extensionId] ?? [];
}

/** Подписи языков расширения — в списках и карточках показываем их, а не id. */
export function languageLabelsOf(extensionId: string): readonly string[] {
    return languagesOf(extensionId).map((id) => languageById(id)?.label ?? id);
}
