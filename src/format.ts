import type { RegistryEngines, RegistryExtensionKind, RegistryVersion } from "./registry/client";

/** Новейшая версия меты. Публикация — append в versions, порядок не нормирован, поэтому сравниваем semver сами. */
export function latestVersion(versions: readonly RegistryVersion[]): RegistryVersion | undefined {
    return [...versions].sort((a, b) => compareSemver(b.version, a.version))[0];
}

function compareSemver(a: string, b: string): number {
    const pa = a.split(/[.+-]/, 3).map(Number);
    const pb = b.split(/[.+-]/, 3).map(Number);
    for (let i = 0; i < 3; i++) {
        const d = (pa[i] ?? 0) - (pb[i] ?? 0);
        if (d !== 0) return d;
    }
    return 0;
}

export function formatSize(bytes: number): string {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
}

export function formatDate(iso: string): string {
    const date = new Date(iso);
    return Number.isNaN(date.getTime())
        ? iso
        : date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export const KIND_LABELS: Readonly<Record<RegistryExtensionKind, string>> = {
    "native": "native",
    "proxy-openvsx": "stock · Open VSX",
    "proxy-hosted": "stock · rehosted",
};

export function formatEngines(engines: RegistryEngines): string {
    const parts: string[] = [];
    if (engines.diode !== undefined) parts.push(`diode ${engines.diode}`);
    if (engines.vscode !== undefined) parts.push(`vscode ${engines.vscode}`);
    return parts.join(" · ");
}

export function installCommand(extensionId: string): string {
    return `diode ext add ${extensionId}`;
}
