import { useEffect, useState } from "react";
import {
    fetchExtensionMeta,
    fetchRegistryIndex,
    type RegistryExtensionMeta,
    type RegistryIndex,
} from "./registry/client";

/**
 * Заглушка магазина: без дизайна, задача — доказать сквозной путь
 * «Pages-деплой → чтение registry/v1 → список → карточка». Роутинг — hash
 * (#/ext/<id>), чтобы прямые ссылки работали на GitHub Pages без 404-трюков.
 */

function useHashRoute(): string {
    const [hash, setHash] = useState(window.location.hash);
    useEffect(() => {
        const onChange = (): void => setHash(window.location.hash);
        window.addEventListener("hashchange", onChange);
        return () => window.removeEventListener("hashchange", onChange);
    }, []);
    return hash;
}

type Remote<T> = { state: "loading" } | { state: "error"; message: string } | { state: "ok"; data: T };

function useRemote<T>(load: () => Promise<T>, key: string): Remote<T> {
    const [remote, setRemote] = useState<Remote<T>>({ state: "loading" });
    useEffect(() => {
        let alive = true;
        setRemote({ state: "loading" });
        load().then(
            (data) => alive && setRemote({ state: "ok", data }),
            (error: unknown) => alive && setRemote({ state: "error", message: error instanceof Error ? error.message : String(error) }),
        );
        return () => {
            alive = false;
        };
        // key — единственный вход, определяющий что грузить; load намеренно вне deps.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);
    return remote;
}

function IndexPage(): React.JSX.Element {
    const remote = useRemote<RegistryIndex>(fetchRegistryIndex, "index");
    const [query, setQuery] = useState("");

    if (remote.state === "loading") return <p>Loading registry index…</p>;
    if (remote.state === "error") return <p role="alert">Failed to load registry index: {remote.message}</p>;

    const needle = query.trim().toLowerCase();
    const extensions = remote.data.extensions.filter(
        (e) =>
            e.id.toLowerCase().includes(needle) ||
            e.displayName.toLowerCase().includes(needle) ||
            e.description.toLowerCase().includes(needle),
    );

    return (
        <>
            <p>
                {remote.data.extensions.length} extensions · schema v{remote.data.schemaVersion}
                {remote.data.generatedAt !== undefined && <> · generated {remote.data.generatedAt}</>}
            </p>
            <input
                type="search"
                placeholder="Search extensions"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <ul>
                {extensions.map((e) => (
                    <li key={e.id}>
                        <a href={`#/ext/${e.id}`}>{e.displayName}</a> — {e.description}
                        <br />
                        <small>
                            {e.id} · {e.latest.version} · {e.kind}
                        </small>
                    </li>
                ))}
            </ul>
        </>
    );
}

function ExtensionPage({ id }: { readonly id: string }): React.JSX.Element {
    const remote = useRemote<RegistryExtensionMeta>(() => fetchExtensionMeta(id), id);

    if (remote.state === "loading") return <p>Loading {id}…</p>;
    if (remote.state === "error") return <p role="alert">Failed to load {id}: {remote.message}</p>;
    const meta = remote.data;

    return (
        <>
            <p>
                <a href="#/">← all extensions</a>
            </p>
            <h2>{meta.displayName}</h2>
            <p>{meta.description}</p>
            <dl>
                <dt>id</dt>
                <dd>{meta.id}</dd>
                <dt>kind</dt>
                <dd>{meta.kind}</dd>
                {meta.license !== undefined && (
                    <>
                        <dt>license</dt>
                        <dd>{meta.license}</dd>
                    </>
                )}
                {meta.repository !== undefined && (
                    <>
                        <dt>repository</dt>
                        <dd>
                            <a href={meta.repository}>{meta.repository}</a>
                        </dd>
                    </>
                )}
                {meta.homepage !== undefined && (
                    <>
                        <dt>homepage</dt>
                        <dd>
                            <a href={meta.homepage}>{meta.homepage}</a>
                        </dd>
                    </>
                )}
            </dl>
            <h3>Versions</h3>
            <ul>
                {meta.versions.map((v) => (
                    <li key={v.version}>
                        {v.version}
                        {v.publishedAt !== undefined && <> · {v.publishedAt}</>}
                        {v.size !== undefined && <> · {v.size} bytes</>}
                        <br />
                        <small>sha256 {v.sha256}</small>
                    </li>
                ))}
            </ul>
            {meta.readme !== undefined && (
                <>
                    <h3>Readme</h3>
                    {/* Markdown пока не рендерим — заглушка показывает сырой текст. */}
                    <pre style={{ whiteSpace: "pre-wrap" }}>{meta.readme}</pre>
                </>
            )}
        </>
    );
}

export function App(): React.JSX.Element {
    const hash = useHashRoute();
    const match = /^#\/ext\/(.+)$/.exec(hash);

    return (
        <main>
            <h1>
                <a href="#/">diode marketplace</a>
            </h1>
            {match?.[1] !== undefined ? <ExtensionPage id={decodeURIComponent(match[1])} /> : <IndexPage />}
        </main>
    );
}
