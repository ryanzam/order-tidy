type Listener = (event: unknown) => void;

const channels = new Map<string, Set<Listener>>();

export function subscribe(tenantId: string, listener: Listener) {
    let set = channels.get(tenantId);
    if (!set) {
        set = new Set();
        channels.set(tenantId, set);
    }
    set.add(listener);
    return () => {
        set!.delete(listener);
        if (!set!.size) channels.delete(tenantId);
    };
}

export function publish(tenantId: string, event: unknown) {
    channels.get(tenantId)?.forEach((l) => l(event));
}
