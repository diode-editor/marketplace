import { useEffect, useRef } from "react";
import { FEATURED, LANGUAGES, languagesOf } from "../curation";
import { Badge } from "../ds/Badge";
import { Logo } from "../ds/Logo";
import type { RegistryIndex, RegistryIndexEntry } from "../registry/client";

/** Семантика поиска — как в registryFormat.ts редактора: substring по id/displayName/description. */
function matchesQuery(entry: RegistryIndexEntry, needle: string): boolean {
    return (
        entry.id.toLowerCase().includes(needle) ||
        entry.displayName.toLowerCase().includes(needle) ||
        entry.description.toLowerCase().includes(needle)
    );
}

function ExtensionRow({ entry }: { readonly entry: RegistryIndexEntry }): React.JSX.Element {
    const langs = languagesOf(entry.id);
    return (
        <a href={`#/ext/${entry.id}`} className="ext-row" style={{ color: "inherit" }}>
            <span className="row-name">{entry.displayName}</span>
            <span className="row-desc">{entry.description}</span>
            <span className="row-by">{langs.length > 0 ? langs.join(", ") : `@${entry.publisher}`}</span>
            <span className="row-version">{entry.latest.version}</span>
        </a>
    );
}

function FeaturedCard({ entry }: { readonly entry: RegistryIndexEntry }): React.JSX.Element {
    const langs = languagesOf(entry.id);
    return (
        <a href={`#/ext/${entry.id}`} className="featured-card" style={{ color: "inherit" }}>
            <div className="card-head">
                <span className="card-title">
                    <Logo variant="mark" size={16} />
                    {entry.displayName}
                </span>
                <Badge tone="neutral">{entry.latest.version}</Badge>
            </div>
            <p>{entry.description}</p>
            <div className="card-meta">
                {langs.length > 0 && (
                    <>
                        <span>{langs.join(", ")}</span>
                        <span>·</span>
                    </>
                )}
                <span>@{entry.publisher}</span>
            </div>
        </a>
    );
}

export interface HomeProps {
    readonly index: RegistryIndex;
    readonly query: string;
    readonly onQueryChange: (query: string) => void;
}

export function Home({ index, query, onQueryChange }: HomeProps): React.JSX.Element {
    const inputRef = useRef<HTMLInputElement>(null);
    const searching = query.trim().length > 0;

    // Как в редакторе: "/" начинает поиск, esc сбрасывает.
    useEffect(() => {
        const onKey = (event: KeyboardEvent): void => {
            if (event.key === "/" && document.activeElement !== inputRef.current) {
                event.preventDefault();
                inputRef.current?.focus();
            }
            if (event.key === "Escape") {
                onQueryChange("");
                inputRef.current?.blur();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onQueryChange]);

    const needle = query.trim().toLowerCase();
    const results = index.extensions.filter((e) => matchesQuery(e, needle));
    const featured = FEATURED.map((id) => index.extensions.find((e) => e.id === id)).filter(
        (e): e is RegistryIndexEntry => e !== undefined,
    );

    return (
        <>
            <div className={searching ? "hero compact" : "hero"}>
                {!searching && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
                        <div className="eyebrow">extension store</div>
                        <h1>extensions</h1>
                        <p className="lead">
                            One binary, no build step — an extension installs with one command and reads as one file.
                        </p>
                    </div>
                )}

                <div
                    className={searching ? "search-box active" : "search-box"}
                    onClick={() => inputRef.current?.focus()}
                >
                    <span className="slash">/</span>
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => onQueryChange(e.target.value)}
                        placeholder="search by name, description or id"
                        aria-label="Search extensions"
                    />
                    <span className="caret" />
                    {searching && (
                        <a href="#/" className="esc" onClick={() => onQueryChange("")}>
                            esc
                        </a>
                    )}
                </div>

                <div className="chips">
                    <span className="chips-label">languages</span>
                    {LANGUAGES.map((lang) => (
                        <a key={lang.id} href={`#/lang/${lang.id}`} className="chip">
                            {lang.label}
                        </a>
                    ))}
                </div>
            </div>

            {searching ? (
                <>
                    <div className="section-head">
                        <span className="eyebrow">search results</span>
                        <span className="section-note">
                            query: {query.trim()} · {results.length} found
                        </span>
                    </div>
                    <div>
                        {results.map((entry) => (
                            <ExtensionRow key={entry.id} entry={entry} />
                        ))}
                        <div className="list-footer">
                            <span className="hint">
                                same thing in a buffer: <code>:ext search {query.trim()}</code>
                            </span>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {featured.length > 0 && (
                        <>
                            <div className="section-head">
                                <span className="eyebrow">featured</span>
                                <span className="section-note">maintainers&rsquo; picks</span>
                            </div>
                            <div className="featured-grid">
                                {featured.map((entry) => (
                                    <FeaturedCard key={entry.id} entry={entry} />
                                ))}
                            </div>
                        </>
                    )}
                    <div className="section-head">
                        <span className="eyebrow">all extensions</span>
                        <span className="section-note">{index.extensions.length} in the catalog</span>
                    </div>
                    <div>
                        {index.extensions.map((entry) => (
                            <ExtensionRow key={entry.id} entry={entry} />
                        ))}
                    </div>
                </>
            )}
        </>
    );
}
