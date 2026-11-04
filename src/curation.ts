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
    "esbenp.prettier-vscode",
    "EditorConfig.EditorConfig",
    "maptz.regionfolder",
];

export const LANGUAGES: readonly LanguageCuration[] = [
    {
        id: "python",
        label: "python",
        blurb: "Python support is assembled from registry extensions: type checking and code navigation via basedpyright, linting and formatting via ruff, and Python Indent for correct indentation on Enter.",
        recommended: ["detachhead.basedpyright", "charliermarsh.ruff", "KevinRose.vsc-python-indent"],
    },
    {
        id: "typescript",
        label: "typescript / javascript",
        aliases: ["javascript"],
        blurb: "Types, navigation and completion ship with diode itself — the builtin client runs the stock typescript-language-server. The catalog adds ESLint — diagnostics from the linter installed in your project, quick fixes per rule and fix-on-save — and Prettier, which formats the whole document or the selection; Biome does both as one tool, and npm Intellisense completes module names in imports.",
        recommended: ["dbaeumer.vscode-eslint", "esbenp.prettier-vscode", "biomejs.biome", "christian-kohler.npm-intellisense"],
    },
    {
        id: "java",
        label: "java",
        blurb: "Java support comes from Red Hat's extension running the Eclipse JDT language server: diagnostics, completion, navigation into library sources, refactorings and source generation. Maven and Gradle projects are imported by the server itself, and the platform builds bundle a JRE — you do not need to install a JDK. Maven for Java adds the Maven tree and goals, Bazel for Java imports Bazel workspaces.",
        recommended: ["redhat.java", "vscjava.vscode-maven", "tihonove.bazel-java-tihonove"],
    },
    {
        id: "go",
        label: "go",
        blurb: "Go support is the Go team's own extension running gopls: diagnostics, hover with doc comments, go to definition, completion with auto-import, and gofmt with organize imports on save. It needs the Go toolchain on your PATH; gopls is installed by the extension itself on first start.",
        recommended: ["golang.go"],
    },
    {
        id: "cpp",
        label: "c / c++",
        aliases: ["c"],
        blurb: "C and C++ support is the LLVM project's clangd extension: diagnostics, completion, navigation, rename, call and type hierarchy, inlay hints and switching between source and header. It reads compile_commands.json for your build flags; clangd itself is downloaded by the extension, or on Linux arm64 comes from your distribution.",
        recommended: ["llvm-vs-code-extensions.vscode-clangd"],
    },
];

/** Привязка расширений к языкам — для строк списка и карточек. */
export const EXTENSION_LANGUAGES: Readonly<Record<string, readonly string[]>> = {
    "detachhead.basedpyright": ["python"],
    "charliermarsh.ruff": ["python"],
    "KevinRose.vsc-python-indent": ["python"],
    "dbaeumer.vscode-eslint": ["typescript"],
    "esbenp.prettier-vscode": ["typescript"],
    "biomejs.biome": ["typescript"],
    "christian-kohler.npm-intellisense": ["typescript"],
    "redhat.java": ["java"],
    "vscjava.vscode-maven": ["java"],
    "tihonove.bazel-java-tihonove": ["java"],
    "golang.go": ["go"],
    "llvm-vs-code-extensions.vscode-clangd": ["cpp"],
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
