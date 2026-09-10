"use client";
import { useMemo, useState } from "react";
import { ShoppingBag, Plus, X } from "lucide-react";

export function MenuClient({
    tenant,
    products,
}: {
    tenant: {
        name: string;
        slug: string;
        description: string;
        currency: string;
        logoUrl: string;
    };
    products: any[];
}) {
    const [cart, setCart] = useState<Record<string, number>>({});
    const [open, setOpen] = useState(false);
    const [done, setDone] = useState(false);
    const [form, setForm] = useState({
        tableNumber:
            new URLSearchParams(
                typeof window !== "undefined" ? location.search : "",
            ).get("table") || "",
        customerName: "",
        notes: "",
    });

    const total = useMemo(
        () => products.reduce((a, p) => a + (cart[p._id] || 0) * p.price, 0),
        [cart, products],
    );

    const count = Object.values(cart).reduce((a, b) => a + b, 0);

    function add(id: string) {
        setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
    }

    function remove(id: string) {
        setCart((c) => {
            const n = Math.max(0, (c[id] || 0) - 1);
            const x = { ...c };
            if (n) x[id] = n;
            else delete x[id];
            return x;
        });
    }

    async function order(e: React.FormEvent) {
        e.preventDefault();
        const items = Object.entries(cart).map(([productId, quantity]) => ({
            productId,
            quantity,
        }));
        const r = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...form, tenantSlug: tenant.slug, items }),
        });
        if (r.ok) {
            setDone(true);
            setCart({});
            setOpen(false);
        } else alert((await r.json()).error || "Order failed");
    }

    return (
        <main className="min-h-screen bg-[#faf9f6] pb-28">
            <header className="px-5 pt-10 pb-8 text-center max-w-3xl mx-auto">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-stone-900 text-white grid place-items-center serif text-2xl">
                    {tenant.name[0]}
                </div>
                <h1 className="serif text-4xl md:text-5xl">{tenant.name}</h1>
                <p className="mt-2 text-stone-500">{tenant.description}</p>
            </header>
            <section className="max-w-5xl mx-auto px-5 space-y-10">
                {[...new Set(products.map((p) => p.category))].map((cat) => (
                    <div key={cat}>
                        <h2 className="serif text-2xl mb-4">{cat}</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {products
                                .filter((p) => p.category === cat)
                                .map((p) => (
                                    <article
                                        key={p._id}
                                        className="card p-4 flex gap-4"
                                    >
                                        <div className="h-24 w-24 rounded-xl bg-stone-100 overflow-hidden shrink-0">
                                            {p.imageUrl && (
                                                <img
                                                    src={p.imageUrl}
                                                    className="h-full w-full object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold">
                                                {p.name}
                                            </h3>
                                            <p className="text-sm text-stone-500 mt-1">
                                                {p.description}
                                            </p>
                                            <div className="mt-3 flex items-center justify-between">
                                                <span className="font-semibold">
                                                    {tenant.currency}{" "}
                                                    {p.price.toFixed(2)}
                                                </span>
                                                <button
                                                    onClick={() => add(p._id)}
                                                    className="rounded-full bg-stone-900 text-white p-2"
                                                >
                                                    <Plus size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                        </div>
                    </div>
                ))}
            </section>
            {count > 0 && (
                <button
                    onClick={() => setOpen(true)}
                    className="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-stone-900 text-white px-6 py-4 shadow-xl flex gap-3"
                >
                    <ShoppingBag /> {count} items · {tenant.currency}{" "}
                    {total.toFixed(2)}
                </button>
            )}
            {open && (
                <div className="fixed inset-0 bg-black/40 p-4 grid place-items-center">
                    <form
                        onSubmit={order}
                        className="bg-white rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-auto"
                    >
                        <div className="flex justify-between">
                            <h2 className="serif text-3xl">Order details</h2>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                            >
                                <X />
                            </button>
                        </div>
                        <div className="my-5 space-y-3">
                            {products
                                .filter((p) => cart[p._id])
                                .map((p) => (
                                    <div
                                        className="flex items-center justify-between"
                                        key={p._id}
                                    >
                                        <span>
                                            {p.name} × {cart[p._id]}
                                        </span>
                                        <span>
                                            {tenant.currency}{" "}
                                            {(p.price * cart[p._id]).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            <div className="border-t pt-3 font-bold flex justify-between">
                                <span>Total</span>
                                <span>
                                    {tenant.currency} {total.toFixed(2)}
                                </span>
                            </div>
                        </div>
                        <input
                            required
                            className="w-full border rounded-xl p-3 mb-3"
                            placeholder="Table number"
                            value={form.tableNumber}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    tableNumber: e.target.value,
                                })
                            }
                        />
                        <input
                            required
                            className="w-full border rounded-xl p-3 mb-3"
                            placeholder="Customer name"
                            value={form.customerName}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    customerName: e.target.value,
                                })
                            }
                        />
                        <textarea
                            className="w-full border rounded-xl p-3 mb-4"
                            placeholder="Notes (optional)"
                            value={form.notes}
                            onChange={(e) =>
                                setForm({ ...form, notes: e.target.value })
                            }
                        />
                        <button className="w-full rounded-xl bg-stone-900 py-3 text-white">
                            Place order
                        </button>
                    </form>
                </div>
            )}
            {done && (
                <div className="fixed inset-0 bg-black/30 grid place-items-center p-6">
                    <div className="bg-white rounded-3xl p-8 text-center">
                        <h2 className="serif text-3xl">Thank you!</h2>
                        <p className="mt-2 text-stone-500">
                            Your order has been sent to the cafe.
                        </p>
                        <button
                            onClick={() => setDone(false)}
                            className="mt-6 rounded-xl bg-stone-900 px-6 py-3 text-white"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}
