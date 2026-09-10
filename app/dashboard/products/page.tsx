"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";

export default function Products() {
    const [products, setProducts] = useState<any[]>([]);
    const [editing, setEditing] = useState<string | null>(null);
    const [form, setForm] = useState({
        name: "",
        description: "",
        price: 0,
        category: "Coffee",
        imageUrl: "",
        available: true,
    });

    const load = async () => {
        const r = await fetch("/api/products");
        if (r.ok) setProducts(await r.json());
    };

    useEffect(() => {
        load();
    }, []);

    const add = async () => {
        if (editing) {
            await fetch(`/api/products/${editing}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, price: Number(form.price) }),
            });
            setEditing(null);
        } else {
            await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, price: Number(form.price) }),
            });
        }
        setForm({ ...form, name: "", imageUrl: "", description: "", price: 0 });
        load();
    };

    const edit = (x: any) => {
        setEditing(x._id);
        setForm({
            name: x.name,
            description: x.description || "",
            price: x.price,
            category: x.category,
            imageUrl: x.imageUrl || "",
            available: x.available,
        });
    };

    const delelte = async (id: string) => {
        if (!confirm("Delete this product?")) return;
        await fetch(`/api/products/${id}`, { method: "DELETE" });
        load();
    };

    return (
        <div className="p-5 md:p-10">
            <h1 className="serif text-4xl">Products</h1>
            <div className="card p-5 mt-6 grid md:grid-cols-2 gap-3">
                <input
                    className="border rounded-xl p-3"
                    placeholder="Product name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <input
                    className="border rounded-xl p-3"
                    placeholder="Category"
                    value={form.category}
                    onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                    }
                />
                <input
                    className="border rounded-xl p-3"
                    type="number"
                    placeholder="Price"
                    value={form.price}
                    onChange={(e) =>
                        setForm({ ...form, price: Number(e.target.value) })
                    }
                />
                <input
                    className="border rounded-xl p-3"
                    placeholder="Image URL"
                    value={form.imageUrl}
                    onChange={(e) =>
                        setForm({ ...form, imageUrl: e.target.value })
                    }
                />
                <textarea
                    className="border rounded-xl p-3 md:col-span-2"
                    placeholder="Description"
                    value={form.description}
                    onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                    }
                />
                <button
                    onClick={add}
                    className="md:col-span-2 bg-stone-900 text-white rounded-xl py-3 flex justify-center gap-2"
                >
                    <Plus />
                    {editing ? "Save changes" : "Add product"}
                </button>
            </div>
            <div className="mt-6 grid gap-3">
                {products.map((x) => (
                    <div
                        className="card p-4 flex items-center justify-between"
                        key={x._id}
                    >
                        <div>
                            <b>{x.name}</b>
                            <p className="text-sm text-stone-500">
                                {x.category} · {x.price}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => edit(x)}
                                className="text-stone-700"
                            >
                                <Pencil />
                            </button>
                            <button
                                onClick={() => delelte(x._id)}
                                className="text-red-600"
                            >
                                <Trash2 />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
