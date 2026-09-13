"use client";
import { useEffect, useState } from "react";

export default function Settings() {
    const [f, setF] = useState<any>({
        name: "",
        description: "",
        logoUrl: "",
        currency: "NPR",
    });

    const [qr, setQr] = useState("");

    useEffect(() => {
        fetch("/api/settings")
            .then((r) => r.json())
            .then(setF);
    }, []);

    async function save() {
        await fetch("/api/settings", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(f),
        });
        alert("Saved");
    }

    async function gen() {
        const r = await fetch("/api/qr");
        const x = await r.json();
        setQr(x.data);
    }

    return (
        <div className="p-5 md:p-10">
            <h1 className="serif text-4xl">Settings</h1>
            <div className="card p-5 mt-6 max-w-2xl space-y-3">
                <input
                    className="border rounded-xl p-3 w-full"
                    value={f.name}
                    placeholder="Shop Name"
                    onChange={(e) => setF({ ...f, name: e.target.value })}
                />
                <textarea
                    className="border rounded-xl p-3 w-full"
                    value={f.description}
                    placeholder="Short description of your shop"
                    onChange={(e) =>
                        setF({ ...f, description: e.target.value })
                    }
                />
                <input
                    className="border rounded-xl p-3 w-full"
                    placeholder="Logo URL"
                    value={f.logoUrl}
                    onChange={(e) => setF({ ...f, logoUrl: e.target.value })}
                />
                <input
                    className="border rounded-xl p-3 w-full"
                    value={f.currency}
                    onChange={(e) => setF({ ...f, currency: e.target.value })}
                />
                <button
                    onClick={save}
                    className="bg-stone-900 text-white rounded-xl px-5 py-3"
                >
                    Save settings
                </button>
            </div>
            <div className="card p-5 mt-6 max-w-2xl">
                <h2 className="serif text-2xl">Menu QR</h2>
                <button
                    onClick={gen}
                    className="mt-3 border rounded-xl px-5 py-3"
                >
                    Generate QR
                </button>
                {qr && (
                    <div className="mt-5">
                        <img
                            src={qr}
                            className="w-64 h-64"
                            alt="Menu QR code"
                        />
                        <a
                            href={qr}
                            download="menu-qr.png"
                            className="text-sm underline"
                        >
                            Download QR
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
