import { useEffect, useState } from "react";
import { Footer, Header, type Theme } from "./Header";
import { useHashRoute, useRemote } from "./hooks";
import { ExtensionPage } from "./pages/ExtensionPage";
import { Home } from "./pages/Home";
import { LanguagePage } from "./pages/LanguagePage";
import { fetchRegistryIndex, type RegistryIndex } from "./registry/client";

/** Роутинг hash (#/ext/<id>, #/lang/<id>) — прямые ссылки работают на GitHub Pages без 404-трюков. */

function readTheme(): Theme {
    return localStorage.getItem("theme") === "light" ? "light" : "dark";
}

function Routed({ hash, index }: { readonly hash: string; readonly index: RegistryIndex }): React.JSX.Element {
    const [query, setQuery] = useState("");

    const ext = /^#\/ext\/(.+)$/.exec(hash);
    if (ext?.[1] !== undefined) return <ExtensionPage id={decodeURIComponent(ext[1])} />;

    const lang = /^#\/lang\/(.+)$/.exec(hash);
    if (lang?.[1] !== undefined) return <LanguagePage id={decodeURIComponent(lang[1])} index={index} />;

    return <Home index={index} query={query} onQueryChange={setQuery} />;
}

export function App(): React.JSX.Element {
    const hash = useHashRoute();
    const [theme, setTheme] = useState<Theme>(readTheme);
    const remote = useRemote(fetchRegistryIndex, "index");

    useEffect(() => {
        document.documentElement.dataset["theme"] = theme;
        localStorage.setItem("theme", theme);
    }, [theme]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [hash]);

    return (
        <div className="page">
            <Header theme={theme} onToggleTheme={() => setTheme(theme === "light" ? "dark" : "light")} />
            <main>
                {remote.state === "loading" && <p className="status-block">загрузка каталога…</p>}
                {remote.state === "error" && (
                    <p className="status-block error" role="alert">
                        не удалось загрузить каталог: {remote.message}
                    </p>
                )}
                {remote.state === "ok" && <Routed hash={hash} index={remote.data} />}
            </main>
            <Footer />
        </div>
    );
}
