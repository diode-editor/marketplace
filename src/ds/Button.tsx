import { useState, type CSSProperties, type ReactNode } from "react";

/* Порт components/core/Button.jsx из дизайн-системы diode (claude.ai/design).
   as="a" — для кнопок-ссылок (Источник и т.п.). */

export interface ButtonProps {
    readonly variant?: "primary" | "secondary" | "ghost";
    readonly size?: "md" | "sm";
    readonly as?: "button" | "a";
    readonly href?: string;
    readonly target?: string;
    readonly rel?: string;
    readonly disabled?: boolean;
    readonly arrow?: boolean;
    readonly children: ReactNode;
    readonly onClick?: () => void;
    readonly style?: CSSProperties;
}

const SIZES: Record<"md" | "sm", CSSProperties> = {
    md: { padding: "var(--pad-btn)", fontSize: "var(--fs-ui)" },
    sm: { padding: "7px 14px", fontSize: "var(--fs-chip)" },
};

export function Button({
    variant = "primary",
    size = "md",
    as = "button",
    href,
    target,
    rel,
    disabled = false,
    arrow = false,
    children,
    onClick,
    style,
}: ButtonProps): React.JSX.Element {
    const [hover, setHover] = useState(false);
    const base: CSSProperties = {
        fontFamily: "var(--font-ui)",
        fontWeight: "var(--fw-medium)" as CSSProperties["fontWeight"],
        lineHeight: 1.2,
        borderRadius: "var(--radius-chip)",
        cursor: disabled ? "default" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--sp-2)",
        textDecoration: "none",
        transition: "background var(--dur-fast) var(--ease-linear), color var(--dur-fast) var(--ease-linear)",
        opacity: disabled ? 0.45 : 1,
        ...SIZES[size],
    };
    const skins: Record<"primary" | "secondary" | "ghost", CSSProperties> = {
        primary: {
            background: hover && !disabled ? "var(--accent-fill-hover)" : "var(--accent-fill)",
            color: "var(--accent-fill-ink)",
            border: "none",
        },
        secondary: {
            background: "var(--surface-chrome)",
            color: "var(--text-code)",
            border: "var(--bw-hairline) solid var(--border-strong)",
            padding: size === "md" ? "var(--pad-btn-ghost)" : "6px 13px",
        },
        ghost: {
            background: "transparent",
            color: hover && !disabled ? "var(--text-strong)" : "var(--text-muted)",
            border: "none",
        },
    };
    const merged = { ...base, ...skins[variant], ...style };
    const shared = {
        onMouseEnter: () => setHover(true),
        onMouseLeave: () => setHover(false),
        style: merged,
    };
    if (as === "a") {
        return (
            <a href={href} target={target} rel={rel} onClick={disabled ? undefined : onClick} {...shared}>
                {children}
                {arrow && <span aria-hidden="true">→</span>}
            </a>
        );
    }
    return (
        <button type="button" disabled={disabled} onClick={disabled ? undefined : onClick} {...shared}>
            {children}
            {arrow && <span aria-hidden="true">→</span>}
        </button>
    );
}
