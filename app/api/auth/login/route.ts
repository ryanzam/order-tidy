import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validation";
import { setSession, verifyPassword } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const formData = loginSchema.parse(await req.json());
        const userCollection = await (
            await db()
        )
            .collection("users")
            .findOne({ email: formData.email.toLowerCase() });
        if (
            !userCollection ||
            !(await verifyPassword(
                formData.password,
                userCollection.passwordHash,
            ))
        )
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 },
            );
        await setSession({
            userId: userCollection._id.toHexString(),
            tenantId: userCollection.tenantId,
            role: userCollection.role,
        });

        return NextResponse.json({ ok: true });
    } catch (e) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}
