import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { db } from "./db";

const secret = new TextEncoder().encode(
    process.env.AUTH_SECRET || "change-this-secret-in-production",
);

export type Session = {
    userId: string;
    tenantId: string;
    name: string;
    role: "owner" | "manager" | "waiter" | "kitchen";
};

export async function hashPassword(p: string) {
    return bcrypt.hash(p, 12);
}

export async function verifyPassword(p: string, h: string) {
    return bcrypt.compare(p, h);
}

export async function setSession(s: Session) {
    const token = await new SignJWT(s)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secret);
    (await cookies()).set("session", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 604800,
    });
}

export async function getSession(): Promise<Session | null> {
    const token = (await cookies()).get("session")?.value;
    if (!token) return null;
    try {
        return (await jwtVerify(token, secret)).payload as unknown as Session;
    } catch {
        return null;
    }
}

export async function requireSession() {
    const s = await getSession();
    if (!s) throw new Error("UNAUTHORIZED");
    return s;
}

export async function requireRole(roles: Session["role"][]) {
    const s = await requireSession();
    if (!roles.includes(s.role)) throw new Error("FORBIDDEN");
    return s;
}

export async function tenantForSlug(slug: string) {
    return (await db()).collection("tenants").findOne({ slug, active: true });
}
