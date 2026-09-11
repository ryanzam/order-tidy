import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole, hashPassword } from "@/lib/auth";
import { staffSchema } from "@/lib/validation";

export async function GET() {
    try {
        const s = await requireRole(["owner", "manager"]);
        const rows = await (
            await db()
        )
            .collection("users")
            .find({ tenantId: s.tenantId })
            .project({ passwordHash: 0 })
            .sort({ createdAt: -1 })
            .toArray();
        return NextResponse.json(
            rows.map((x) => ({ ...x, _id: x._id.toHexString() })),
        );
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}

export async function POST(req: Request) {
    try {
        const s = await requireRole(["owner"]);
        const x = staffSchema.parse(await req.json());

        const d = await db();
        if (
            await d
                .collection("users")
                .findOne({ email: x.email.toLowerCase() })
        )
            return NextResponse.json(
                { error: "Email already exists" },
                { status: 409 },
            );

        const r = await d.collection("users").insertOne({
            name: x.name,
            email: x.email.toLowerCase(),
            passwordHash: await hashPassword(x.password),
            role: x.role,
            tenantId: s.tenantId,
            createdAt: new Date(),
        });

        return NextResponse.json(
            { _id: r.insertedId.toHexString() },
            { status: 201 },
        );
    } catch (e) {
        return NextResponse.json(
            { error: "Unable to create staff" },
            { status: 400 },
        );
    }
}
