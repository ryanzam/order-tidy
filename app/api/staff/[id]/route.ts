import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const s = await requireRole(["owner"]);
        await (await db()).collection("users").deleteOne({
            _id: new ObjectId((await params).id),
            tenantId: s.tenantId,
            role: { $ne: "owner" },
        });
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json(
            { error: "Unable to remove staff" },
            { status: 400 },
        );
    }
}
