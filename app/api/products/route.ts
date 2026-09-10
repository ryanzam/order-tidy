import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole, tenantForSlug } from "@/lib/auth";
import { productSchema } from "@/lib/validation";

export async function GET(req: Request) {
    const slug = new URL(req.url).searchParams.get("tenant");
    if (slug) {
        const t = await tenantForSlug(slug);
        if (!t)
            return NextResponse.json(
                { error: "Cafe not found" },
                { status: 404 },
            );
        const p = await (
            await db()
        )
            .collection("products")
            .find({ tenantId: t._id.toHexString(), available: true })
            .sort({ category: 1, name: 1 })
            .toArray();
        return NextResponse.json(
            p.map((x) => ({ ...x, _id: x._id.toHexString() })),
        );
    }
    try {
        const s = await requireRole(["owner", "manager"]);
        const p = await (
            await db()
        )
            .collection("products")
            .find({ tenantId: s.tenantId })
            .sort({ category: 1, name: 1 })
            .toArray();
        return NextResponse.json(
            p.map((x) => ({ ...x, _id: x._id.toHexString() })),
        );
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}

export async function POST(req: Request) {
    try {
        const s = await requireRole(["owner", "manager"]);
        const product = productSchema.parse(await req.json());
        const r = await (await db()).collection("products").insertOne({
            ...product,
            tenantId: s.tenantId,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return NextResponse.json(
            { _id: r.insertedId.toHexString() },
            { status: 201 },
        );
    } catch (e) {
        return NextResponse.json(
            { error: e instanceof Error ? e.message : "Invalid request" },
            { status: 400 },
        );
    }
}
