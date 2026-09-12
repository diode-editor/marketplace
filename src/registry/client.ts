/**
 * HTTP-клиент реестра расширений Diode — единственное место, знающее контракт.
 *
 * Типы срисованы с норматива `registryFormat.ts` в репозитории редактора
 * (diode-editor/diode, src/vs/platform/extensionManagement/common/). Когда
 * контракт поедет или появится /v2 — меняется этот файл, остальной магазин
 * живёт поверх этих типов.
 */

export const REGISTRY_SCHEMA_VERSION = 1;

/**
 * В проде магазин раздаётся с того же origin, что и реестр
 * (diode-editor.github.io), поэтому ходим относительными путями; в dev-сервере
 * Vite такого соседства нет — ходим в прод напрямую (Pages отдаёт CORS *).
 */
const BASE = import.meta.env.DEV ? "https://diode-editor.github.io" : "";

export type RegistryExtensionKind = "proxy-openvsx" | "proxy-hosted" | "native";

export type RegistryArtifact =
    | { readonly type: "url"; readonly url: string; readonly origin?: "openvsx" | "github-release" }
    | { readonly type: "path"; readonly path: string };

export interface RegistryEngines {
    readonly diode?: string;
    readonly vscode?: string;
}

export interface RegistryVersion {
    readonly version: string;
    readonly engines: RegistryEngines;
    readonly artifact: RegistryArtifact;
    readonly sha256: string;
    readonly size?: number;
    readonly publishedAt?: string;
}

export interface RegistryIndexEntry {
    readonly id: string;
    readonly publisher: string;
    readonly name: string;
    readonly displayName: string;
    readonly description: string;
    readonly kind: RegistryExtensionKind;
    readonly categories?: readonly string[];
    readonly latest: { readonly version: string; readonly engines: RegistryEngines };
}

export interface RegistryIndex {
    readonly schemaVersion: number;
    readonly generatedAt?: string;
    readonly extensions: readonly RegistryIndexEntry[];
}

export interface RegistryExtensionMeta {
    readonly schemaVersion: number;
    readonly id: string;
    readonly publisher: string;
    readonly name: string;
    readonly displayName: string;
    readonly description: string;
    readonly kind: RegistryExtensionKind;
    readonly repository?: string;
    readonly license?: string;
    readonly homepage?: string;
    readonly readme?: string;
    readonly versions: readonly RegistryVersion[];
}

async function fetchJson(path: string): Promise<unknown> {
    const response = await fetch(`${BASE}${path}`);
    if (!response.ok) {
        throw new Error(`GET ${path}: HTTP ${String(response.status)}`);
    }
    return (await response.json()) as unknown;
}

/**
 * Конверт общий для index и меты: объект с числовым schemaVersion не новее
 * поддерживаемого. Заглушке хватает проверки конверта — глубокую валидацию
 * записей несёт норматив в редакторе, сюда она приедет вместе с дизайном.
 */
function checkEnvelope(raw: unknown, what: string): void {
    if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
        throw new Error(`Invalid registry ${what}: expected a JSON object`);
    }
    const schemaVersion = (raw as Record<string, unknown>)["schemaVersion"];
    if (typeof schemaVersion !== "number") {
        throw new Error(`Invalid registry ${what}: missing "schemaVersion"`);
    }
    if (schemaVersion > REGISTRY_SCHEMA_VERSION) {
        throw new Error(`Registry ${what} has schemaVersion ${String(schemaVersion)}, this client supports up to ${String(REGISTRY_SCHEMA_VERSION)}`);
    }
}

export async function fetchRegistryIndex(): Promise<RegistryIndex> {
    const raw = await fetchJson("/registry/v1/index.json");
    checkEnvelope(raw, "index");
    return raw as RegistryIndex;
}

export async function fetchExtensionMeta(id: string): Promise<RegistryExtensionMeta> {
    const raw = await fetchJson(`/registry/v1/meta/${encodeURIComponent(id)}.json`);
    checkEnvelope(raw, "meta");
    return raw as RegistryExtensionMeta;
}
