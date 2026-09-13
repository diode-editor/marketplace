import { Logo } from "./ds/Logo";

const EDITOR_REPO = "https://github.com/diode-editor/diode";

export type Theme = "dark" | "light";

export function Header({ theme, onToggleTheme }: { readonly theme: Theme; readonly onToggleTheme: () => void }): React.JSX.Element {
    return (
        <header className="site-header">
            <a href="#/" style={{ color: "inherit" }}>
                <Logo variant="lockup" />
            </a>
            <nav className="site-nav">
                <a href="#/" className="active">
                    расширения
                </a>
                <a href={`${EDITOR_REPO}/tree/main/docs`}>docs</a>
                <a href={EDITOR_REPO}>source</a>
                <button type="button" className="theme-toggle" onClick={onToggleTheme}>
                    тема: {theme === "light" ? "светлая" : "тёмная"}
                </button>
            </nav>
        </header>
    );
}

export function Footer(): React.JSX.Element {
    return (
        <footer className="site-footer">
            <span>
                Реестр курируемый: в каталог попадает то, что проверено в diode.{" "}
                <a href="https://github.com/diode-editor/diode-editor.github.io#как-добавить-расширение">добавить расширение →</a>
            </span>
            <span>
                <a href="https://diode-editor.github.io/">diode-editor.github.io</a>
            </span>
        </footer>
    );
}
