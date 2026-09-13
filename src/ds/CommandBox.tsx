import { useState, type CSSProperties } from "react";

/* Порт components/core/CommandBox.jsx из дизайн-системы diode (claude.ai/design). */

export interface CommandBoxProps {
    readonly command: string;
    readonly prompt?: string;
    readonly copyable?: boolean;
    readonly style?: CSSProperties;
}

export function CommandBox({ command, prompt = "$", copyable = false, style }: CommandBoxProps): React.JSX.Element {
    const [copied, setCopied] = useState(false);
    const copy = (): void => {
        if (!copyable) return;
        void navigator.clipboard?.writeText(command);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
    };
    return (
        <div
            onClick={copy}
            style={{
                border: "var(--bw-hairline) solid var(--border-strong)",
                background: "var(--surface-chrome)",
                padding: "var(--pad-btn-ghost)",
                fontFamily: "var(--font-code)",
                fontSize: "var(--fs-ui)",
                color: "var(--text-code)",
                borderRadius: "var(--radius-none)",
                whiteSpace: "nowrap",
                cursor: copyable ? "pointer" : "default",
                display: "inline-flex",
                gap: "var(--sp-2)",
                ...style,
            }}
        >
            <span style={{ color: "var(--text-faint)" }}>{prompt}</span>
            <span>{command}</span>
            {copyable && <span style={{ color: "var(--text-accent)", marginLeft: "var(--sp-2)" }}>{copied ? "ok" : "copy"}</span>}
        </div>
    );
}
