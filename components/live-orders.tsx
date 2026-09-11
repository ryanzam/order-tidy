"use client";
import { useEffect, useRef, useState } from "react";
import { Bell, Volume2 } from "lucide-react";

export function LiveOrders({ initial }: { initial: any[] }) {

    const [orders, setOrders] = useState(initial);
    const audio = useRef<AudioContext | null>(null);

    useEffect(() => {
        const es = new EventSource("/api/orders/events");
        es.onmessage = (e) => {
            const x = JSON.parse(e.data);
            if (x.type === "order.created") {
                setOrders((o) => [x.order, ...o]);
                try {
                    audio.current ??= new AudioContext();
                    const osc = audio.current.createOscillator();
                    const gain = audio.current.createGain();
                    osc.connect(gain);
                    gain.connect(audio.current.destination);
                    osc.frequency.value = 880;
                    gain.gain.value = 0.06;
                    osc.start();
                    osc.stop(audio.current.currentTime + 0.25);
                } catch {}
            }
            if (x.type === "order.updated")
                setOrders((o) =>
                    o.map((v) => (v._id === x.order._id ? x.order : v)),
                );
        };
        return () => es.close();
    }, []);

    async function status(id: string, status: string) {
        await fetch(`/api/orders/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        });
    }
    
    return (
        <div className="p-5 md:p-10">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-stone-500">Live operations</p>
                    <h1 className="serif text-4xl">Orders</h1>
                </div>
                <div className="rounded-full bg-stone-100 p-3">
                    <Bell />
                </div>
            </div>
            <div className="mt-8 grid gap-4">
                {orders.map((o) => (
                    <article className="card p-5" key={o._id}>
                        <div className="flex justify-between gap-4">
                            <div>
                                <span className="font-semibold">
                                    Table {o.tableNumber}
                                </span>
                                <span className="ml-3 text-stone-500">
                                    {o.customerName}
                                </span>
                            </div>
                            <strong>{o.total.toFixed(2)}</strong>
                        </div>
                        <div className="mt-4 space-y-1 text-sm">
                            {o.items.map((i: any) => (
                                <div key={i.productId}>
                                    {i.quantity} × {i.name}
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <span className="rounded-full bg-stone-100 px-3 py-1 text-sm">
                                {o.status}
                            </span>
                            {o.status === "pending" && (
                                <button
                                    onClick={() => status(o._id, "confirmed")}
                                    className="rounded-full bg-stone-900 text-white px-3 py-1 text-sm"
                                >
                                    Confirm
                                </button>
                            )}
                            {o.status === "confirmed" && (
                                <button
                                    onClick={() => status(o._id, "preparing")}
                                    className="rounded-full bg-stone-900 text-white px-3 py-1 text-sm"
                                >
                                    Start
                                </button>
                            )}
                            {o.status === "preparing" && (
                                <button
                                    onClick={() => status(o._id, "ready")}
                                    className="rounded-full bg-stone-900 text-white px-3 py-1 text-sm"
                                >
                                    Ready
                                </button>
                            )}
                            {o.status === "ready" && (
                                <button
                                    onClick={() => status(o._id, "completed")}
                                    className="rounded-full bg-stone-900 text-white px-3 py-1 text-sm"
                                >
                                    Complete
                                </button>
                            )}
                        </div>
                    </article>
                ))}
            </div>
            <p className="mt-5 text-xs text-stone-400 flex gap-2">
                <Volume2 size={14} /> Live order sound is enabled after browser
                interaction.
            </p>
        </div>
    );
}
