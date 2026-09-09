"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
    const r = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [e, setE] = useState("");

    const submit = async (x: React.FormEvent) => {
        x.preventDefault();

        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const j = await res.json();

        if (!res.ok) return setE(j.error || "Login failed");
        r.push("/dashboard");
    };

    return (
        <main className="min-h-screen grid place-items-center p-6">
            <form
                onSubmit={submit}
                className="card w-full max-w-md p-7 space-y-4"
            >
                <h1 className="serif text-3xl">Welcome back</h1>
                <input
                    className="w-full rounded-xl border px-4 py-3"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    className="w-full rounded-xl border px-4 py-3"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {e && <p className="text-red-600 text-sm">{e}</p>}
                <button className="w-full rounded-xl bg-stone-900 py-3 text-white">
                    Sign in
                </button>
            </form>
        </main>
    );
}
