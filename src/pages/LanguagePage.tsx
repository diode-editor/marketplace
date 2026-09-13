import { LANGUAGES, languageById, languagesOf } from "../curation";
import { CommandBox } from "../ds/CommandBox";
import { Logo } from "../ds/Logo";
import { installCommand } from "../format";
import type { RegistryIndex, RegistryIndexEntry } from "../registry/client";

/**
 * Страница языка — по мотивам артборда 1b: сайдбар с языками, витрина
 * рекомендованного расширения, ниже — все расширения языка. Заготовка под
 * language support: когда в registry/v1 появится поле languages, список
 * перестанет зависеть от локальной курации.
 */

function Sidebar({ activeId }: { readonly activeId: string }): React.JSX.Element {
    return (
        <aside className="lang-sidebar">
            <div className="group">
                <div className="group-label">languages</div>
                <nav>
                    {LANGUAGES.map((lang) => (
                        <a key={lang.id} href={`#/lang/${lang.id}`} className={lang.id === activeId ? "active" : undefined}>
                            {lang.label}
                        </a>
                    ))}
                </nav>
            </div>
            <div className="side-note">
                The catalog is curated: only what has been verified in diode makes it in.
                <br />
                Installs into ~/.diode/ext
            </div>
        </aside>
    );
}

export function LanguagePage({ id, index }: { readonly id: string; readonly index: RegistryIndex }): React.JSX.Element {
    const lang = languageById(id);
    if (lang === undefined) {
        return (
            <p className="status-block error" role="alert">
                no language &ldquo;{id}&rdquo; in the catalog · <a href="#/">← all extensions</a>
            </p>
        );
    }

    const extensions = index.extensions.filter((e) => languagesOf(e.id).includes(lang.id));
    const showcase = lang.recommended
        .map((recommendedId) => index.extensions.find((e) => e.id === recommendedId))
        .find((e): e is RegistryIndexEntry => e !== undefined);
    const rest = extensions.filter((e) => e.id !== showcase?.id);

    return (
        <div className="lang-layout">
            <Sidebar activeId={lang.id} />
            <div>
                <div className="lang-hero">
                    <div className="eyebrow">01 / language support</div>
                    <h1>
                        <Logo variant="mark" size={20} />
                        {lang.label}
                    </h1>
                    <p className="lead">{lang.blurb}</p>
                    {showcase !== undefined && (
                        <div className="install-row">
                            <CommandBox command={installCommand(showcase.id)} copyable />
                            <a href={`#/ext/${showcase.id}`} style={{ fontSize: "var(--fs-ui)", color: "var(--text-muted)" }}>
                                details →
                            </a>
                        </div>
                    )}
                </div>

                <div className="section-head">
                    <span className="eyebrow">02 / extensions</span>
                    <span className="section-note">language: {lang.label}</span>
                </div>
                <div className="lang-rows">
                    {extensions.length === 0 && <p className="status-block">nothing in the catalog for this language yet</p>}
                    {[...(showcase !== undefined ? [showcase] : []), ...rest].map((entry) => (
                        <a key={entry.id} href={`#/ext/${entry.id}`} className="ext-row" style={{ color: "inherit" }}>
                            <span className="row-name">{entry.displayName}</span>
                            <span className="row-desc">{entry.description}</span>
                            <span className="row-by">@{entry.publisher}</span>
                            <span className="row-version">{entry.latest.version}</span>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
