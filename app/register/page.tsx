"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
    });
    const [error, setError] = useState("");

    const submit = async (x: React.FormEvent) => {
        x.preventDefault();

        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        const j = await res.json();
        if (!res.ok) return setError(j.error || "Registration failed");
        router.push("/dashboard");
    };
    return (
        <main className="min-h-screen grid place-items-center p-6">
            <form
                onSubmit={submit}
                className="card w-full max-w-md p-7 space-y-4"
            >
                <h1 className="serif text-3xl">Create your cafe/restaurant</h1>
                {(["name", "email", "phone", "password"] as const).map((k) => (
                    <input
                        key={k}
                        required
                        type={
                            k === "password"
                                ? "password"
                                : k === "email"
                                  ? "email"
                                  : "text"
                        }
                        placeholder={k[0].toUpperCase() + k.slice(1)}
                        value={form[k]}
                        onChange={(e) =>
                            setForm({ ...form, [k]: e.target.value })
                        }
                        className="w-full rounded-xl border px-4 py-3"
                    />
                ))}
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button className="w-full rounded-xl bg-stone-900 py-3 text-white">
                    Create account
                </button>
            </form>
        </main>
    );
}
