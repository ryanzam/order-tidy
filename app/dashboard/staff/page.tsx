"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";

export default function Staff() {
    const [rows, setRows] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "waiter",
    });

    async function load() {
        setError(null);
        const r = await fetch("/api/staff");

        if (!r.ok) {
            setError("You are not authorized to access this page.");
            return;
        }
        const json = await r.json();
        if (r.ok) setRows(json);
    }
    useEffect(() => {
        load();
    }, []);

    async function add() {
        const r = await fetch("/api/staff", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        if (r.ok) {
            setForm({ ...form, name: "", email: "", password: "" });
            load();
        } else alert((await r.json()).error);

        console.log({ form });
    }

    async function del(id: string) {
        await fetch(`/api/staff/${id}`, { method: "DELETE" });
        load();
    }

    if (error) {
        return (
            <div className="w-full h-full p-5 md:p-10 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <AlertTriangle size={50} color="#7b5e3b" />
                    <h1 className="text-accent text-2xl">{error}</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="p-5 md:p-10">
            <h1 className="serif text-4xl">Staff & roles</h1>
            <div className="card p-5 mt-6 grid md:grid-cols-2 gap-3">
                <input
                    className="border rounded-xl p-3"
                    placeholder="Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <input
                    className="border rounded-xl p-3"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                    }
                />
                <input
                    className="border rounded-xl p-3"
                    type="password"
                    placeholder="Temporary password"
                    value={form.password}
                    onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                    }
                />
                <select
                    className="border rounded-xl p-3"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                    <option value="manager">Manager</option>
                    <option value="waiter">Waiter</option>
                    <option value="kitchen">Kitchen</option>
                </select>
                <button
                    onClick={add}
                    className="md:col-span-2 bg-stone-900 text-white rounded-xl py-3"
                >
                    Add staff
                </button>
            </div>
            <div className="mt-6 space-y-3">
                {rows.map((x) => (
                    <div className="card p-4 flex justify-between" key={x._id}>
                        <div>
                            <b>{x.name}</b>
                            <p className="text-sm text-stone-500">
                                {x.email} · {x.role}
                            </p>
                        </div>
                        {x.role !== "owner" && (
                            <button
                                onClick={() => del(x._id)}
                                className="text-red-600"
                            >
                                <Trash2 />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
