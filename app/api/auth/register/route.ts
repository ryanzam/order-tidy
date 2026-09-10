import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, setSession } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
    try {
        const formDate = registerSchema.parse(await req.json());
        const d = await db();
        if (
            await d
                .collection("users")
                .findOne({ email: formDate.email.toLowerCase() })
        )
            return NextResponse.json(
                { error: "Email already registered" },
                { status: 409 },
            );

        const tenantId = new ObjectId();

        await d.collection("tenants").insertOne({
            _id: tenantId,
            name: formDate.name,
            slug: formDate.name + new Date().toISOString().split("T")[0],
            description: "",
            logoUrl: "",
            currency: "NPR",
            active: true,
            createdAt: new Date(),
        });

        const userCollection = await d.collection("users").insertOne({
            email: formDate.email.toLowerCase(),
            name: formDate.name,
            passwordHash: await hashPassword(formDate.password),
            tenantId: tenantId.toHexString(),
            role: "owner",
            createdAt: new Date(),
        });

        await setSession({
            userId: userCollection.insertedId.toHexString(),
            tenantId: tenantId.toHexString(),
            role: "owner",
        });

        return NextResponse.json({ ok: true });
    } catch (e) {
        return NextResponse.json(
            { error: e instanceof Error ? e.message : "Invalid request" },
            { status: 400 },
        );
    }
}
