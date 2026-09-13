import { Logo } from "./ds/Logo";

const EDITOR_REPO = "https://github.com/diode-editor/diode";

export type Theme = "system" | "dark" | "light";

export function Header({ theme, onToggleTheme }: { readonly theme: Theme; readonly onToggleTheme: () => void }): React.JSX.Element {
    return (
        <header className="site-header">
            <div className="wrap">
                <a href="#/" style={{ color: "inherit" }}>
                    <Logo variant="lockup" />
                </a>
                <nav className="site-nav">
                    <a href="#/" className="active">
                        extensions
                    </a>
                    <a href={`${EDITOR_REPO}/tree/main/docs`}>docs</a>
                    <a href={EDITOR_REPO}>source</a>
                    <button type="button" className="theme-toggle" onClick={onToggleTheme}>
                        theme: {theme}
                    </button>
                </nav>
            </div>
        </header>
    );
}

export function Footer(): React.JSX.Element {
    return (
        <footer className="site-footer">
            <div className="wrap">
                <span>
                    The registry is curated: only what has been verified in diode makes it in.{" "}
                    <a href="https://github.com/diode-editor/diode-editor.github.io#как-добавить-расширение">add an extension →</a>
                </span>
                <span>
                    <a href="https://diode-editor.github.io/">diode-editor.github.io</a>
                </span>
            </div>
        </footer>
    );
}
