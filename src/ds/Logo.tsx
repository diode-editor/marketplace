import type { CSSProperties } from "react";

/* Порт components/core/Logo.jsx из дизайн-системы diode (claude.ai/design). */

const MARK_LEAD = "M2 7h3";
const MARK_TRAIL = "M11 7h3";

/** The diode mark: lead wire → anode triangle → cathode bar. Square, currentColor. */
function Mark({ size = 16, showTrail = true }: { readonly size?: number; readonly showTrail?: boolean }): React.JSX.Element {
    const w = size;
    const h = Math.round((size * 14) / 16);
    return (
        <svg width={w} height={h} viewBox="0 0 16 14" aria-hidden="true" style={{ display: "block", flex: "none" }}>
            <path d={showTrail ? MARK_LEAD + MARK_TRAIL : MARK_LEAD} stroke="currentColor" strokeWidth="1.4" />
            <path d="M5 2.2 5 11.8 11 7Z" fill="currentColor" />
            <path d="M11 2.2v9.6" stroke="currentColor" strokeWidth="1.6" />
        </svg>
    );
}

export interface LogoProps {
    readonly variant?: "lockup" | "mark";
    readonly size?: number;
    readonly tone?: "accent" | "inherit" | "strong";
    readonly style?: CSSProperties;
}

export function Logo({ variant = "lockup", size, tone = "accent", style }: LogoProps): React.JSX.Element {
    const markColor = tone === "accent" ? "var(--accent)" : tone === "inherit" ? "currentColor" : "var(--text-strong)";

    if (variant === "mark") {
        return (
            <span style={{ color: markColor, display: "inline-flex", ...style }}>
                <Mark size={size ?? 16} />
            </span>
        );
    }

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--gap-chip)",
                fontFamily: "var(--font-ui)",
                fontSize: size ?? "var(--fs-wordmark-nav)",
                fontWeight: "var(--fw-bold)" as CSSProperties["fontWeight"],
                letterSpacing: "var(--ls-lockup)",
                color: "var(--text-strong)",
                ...style,
            }}
        >
            <span style={{ color: markColor, display: "inline-flex" }}>
                <Mark size={16} />
            </span>
            diode
        </div>
    );
}
