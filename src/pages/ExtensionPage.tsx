import { languagesOf } from "../curation";
import { Badge } from "../ds/Badge";
import { Button } from "../ds/Button";
import { CommandBox } from "../ds/CommandBox";
import { Logo } from "../ds/Logo";
import { formatDate, formatEngines, formatSize, installCommand, KIND_LABELS, latestVersion } from "../format";
import { useRemote } from "../hooks";
import { renderMarkdown } from "../markdown";
import { fetchExtensionMeta, type RegistryExtensionMeta, type RegistryVersion } from "../registry/client";

function artifactUrl(version: RegistryVersion): string | undefined {
    return version.artifact.type === "url" ? version.artifact.url : undefined;
}

function VersionEntry({ version }: { readonly version: RegistryVersion }): React.JSX.Element {
    const url = artifactUrl(version);
    return (
        <div className="version-entry">
            <div className="version-head">
                <span className="v">{url !== undefined ? <a href={url}>{version.version}</a> : version.version}</span>
                <span className="date">
                    {version.publishedAt !== undefined && formatDate(version.publishedAt)}
                    {version.size !== undefined && ` · ${formatSize(version.size)}`}
                </span>
            </div>
            <span className="sha" title={`sha256 ${version.sha256}`}>
                sha256 {version.sha256.slice(0, 16)}…
            </span>
        </div>
    );
}

function Meta({ meta }: { readonly meta: RegistryExtensionMeta }): React.JSX.Element {
    const latest = latestVersion(meta.versions);
    const langs = languagesOf(meta.id);

    return (
        <>
            <div className="breadcrumbs">
                <a href="#/">расширения</a>
                {langs[0] !== undefined && (
                    <>
                        <span>/</span>
                        <a href={`#/lang/${langs[0]}`}>{langs[0]}</a>
                    </>
                )}
                <span>/</span>
                <span className="current">{meta.displayName}</span>
            </div>

            <div className="ext-header">
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-5)" }}>
                    <div className="title-row">
                        <h1>
                            <Logo variant="mark" size={26} />
                            {meta.displayName}
                        </h1>
                        {latest !== undefined && <Badge tone="accent">{latest.version}</Badge>}
                    </div>
                    <p className="lead">{meta.description}</p>
                    <div className="meta-line">
                        <span>@{meta.publisher}</span>
                        {meta.license !== undefined && (
                            <>
                                <span>·</span>
                                <span>{meta.license}</span>
                            </>
                        )}
                        <span>·</span>
                        <span>{KIND_LABELS[meta.kind]}</span>
                        {latest?.publishedAt !== undefined && (
                            <>
                                <span>·</span>
                                <span>обновлено {formatDate(latest.publishedAt)}</span>
                            </>
                        )}
                        {latest !== undefined && formatEngines(latest.engines) !== "" && (
                            <>
                                <span>·</span>
                                <span>{formatEngines(latest.engines)}</span>
                            </>
                        )}
                    </div>
                </div>
                <div className="ext-install">
                    <CommandBox command={installCommand(meta.id)} copyable />
                    <div className="btn-row">
                        {meta.repository !== undefined && (
                            <Button as="a" href={meta.repository} variant="secondary" size="sm" arrow>
                                Источник
                            </Button>
                        )}
                        {meta.homepage !== undefined && (
                            <Button as="a" href={meta.homepage} variant="secondary" size="sm" arrow>
                                Сайт
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="ext-body">
                <div className="ext-main">
                    <div className="ext-main-inner">
                        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                            <span className="eyebrow">01 / описание</span>
                            {meta.readme !== undefined && <span className="file-label">README.md</span>}
                        </div>
                        {meta.readme !== undefined ? (
                            // Санитизировано в renderMarkdown (DOMPurify).
                            <div className="readme" dangerouslySetInnerHTML={{ __html: renderMarkdown(meta.readme) }} />
                        ) : (
                            <p className="readme">{meta.description}</p>
                        )}
                    </div>
                </div>

                <aside className="ext-aside">
                    <div className="aside-block">
                        <div className="eyebrow">сведения</div>
                        <dl className="facts">
                            <div className="fact">
                                <dt>id</dt>
                                <dd>{meta.id}</dd>
                            </div>
                            <div className="fact">
                                <dt>автор</dt>
                                <dd>@{meta.publisher}</dd>
                            </div>
                            {meta.license !== undefined && (
                                <div className="fact">
                                    <dt>лицензия</dt>
                                    <dd>{meta.license}</dd>
                                </div>
                            )}
                            <div className="fact">
                                <dt>тип</dt>
                                <dd>{KIND_LABELS[meta.kind]}</dd>
                            </div>
                            {latest?.size !== undefined && (
                                <div className="fact">
                                    <dt>размер</dt>
                                    <dd>{formatSize(latest.size)}</dd>
                                </div>
                            )}
                            {langs.length > 0 && (
                                <div className="fact">
                                    <dt>языки</dt>
                                    <dd>{langs.join(", ")}</dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    <div className="aside-block">
                        <div className="eyebrow">версии</div>
                        <div className="versions">
                            {/* Версия может повторяться: по записи на платформенный артефакт — ключ по sha256. */}
                            {[...meta.versions]
                                .reverse()
                                .map((version) => (
                                    <VersionEntry key={version.sha256} version={version} />
                                ))}
                        </div>
                    </div>
                </aside>
            </div>
        </>
    );
}

export function ExtensionPage({ id }: { readonly id: string }): React.JSX.Element {
    const remote = useRemote(() => fetchExtensionMeta(id), id);

    if (remote.state === "loading") return <p className="status-block">загрузка {id}…</p>;
    if (remote.state === "error") {
        return (
            <p className="status-block error" role="alert">
                не удалось загрузить {id}: {remote.message} · <a href="#/">← все расширения</a>
            </p>
        );
    }
    return <Meta meta={remote.data} />;
}
