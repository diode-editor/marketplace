import { useEffect, useState } from "react";

export function useHashRoute(): string {
    const [hash, setHash] = useState(window.location.hash);
    useEffect(() => {
        const onChange = (): void => setHash(window.location.hash);
        window.addEventListener("hashchange", onChange);
        return () => window.removeEventListener("hashchange", onChange);
    }, []);
    return hash;
}

export type Remote<T> = { state: "loading" } | { state: "error"; message: string } | { state: "ok"; data: T };

export function useRemote<T>(load: () => Promise<T>, key: string): Remote<T> {
    const [remote, setRemote] = useState<Remote<T>>({ state: "loading" });
    useEffect(() => {
        let alive = true;
        setRemote({ state: "loading" });
        load().then(
            (data) => alive && setRemote({ state: "ok", data }),
            (error: unknown) =>
                alive && setRemote({ state: "error", message: error instanceof Error ? error.message : String(error) }),
        );
        return () => {
            alive = false;
        };
        // key — единственный вход, определяющий что грузить; load намеренно вне deps.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);
    return remote;
}
