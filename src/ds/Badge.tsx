import type { CSSProperties, ReactNode } from "react";

/* Порт components/core/Badge.jsx из дизайн-системы diode (claude.ai/design). */

export interface BadgeProps {
    readonly tone?: "neutral" | "accent" | "solid";
    readonly children: ReactNode;
    readonly style?: CSSProperties;
}

const TONES: Record<NonNullable<BadgeProps["tone"]>, CSSProperties> = {
    neutral: { background: "var(--surface-chrome)", color: "var(--text-muted)", border: "var(--bw-hairline) solid var(--border-chrome)" },
    accent: { background: "transparent", color: "var(--text-accent)", border: "var(--bw-hairline) solid var(--accent)" },
    solid: { background: "var(--accent-fill)", color: "var(--accent-fill-ink)", border: "none" },
};

export function Badge({ tone = "neutral", children, style }: BadgeProps): React.JSX.Element {
    return (
        <span
            style={{
                fontFamily: "var(--font-ui)",
                fontSize: "var(--fs-micro)",
                fontWeight: "var(--fw-medium)" as CSSProperties["fontWeight"],
                padding: "3px 7px",
                borderRadius: "var(--radius-badge)",
                display: "inline-flex",
                alignItems: "center",
                lineHeight: 1.3,
                whiteSpace: "nowrap",
                ...TONES[tone],
                ...style,
            }}
        >
            {children}
        </span>
    );
}
