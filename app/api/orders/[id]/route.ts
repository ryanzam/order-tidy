import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { publish } from "@/lib/events";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const s = await requireRole(["owner", "manager", "kitchen", "waiter"]);
        const { status } = await req.json();
        if (
            ![
                "pending",
                "confirmed",
                "preparing",
                "ready",
                "completed",
                "cancelled",
            ].includes(status)
        )
            return NextResponse.json(
                { error: "Invalid status" },
                { status: 400 },
            );
        const id = (await params).id;
        await (
            await db()
        )
            .collection("orders")
            .updateOne(
                { _id: new ObjectId(id), tenantId: s.tenantId },
                { $set: { status, updatedAt: new Date() } },
            );
        const o = await (
            await db()
        )
            .collection("orders")
            .findOne({ _id: new ObjectId(id), tenantId: s.tenantId });
        if (o)
            publish(s.tenantId, {
                type: "order.updated",
                order: {
                    ...o,
                    _id: o._id.toHexString(),
                    createdAt: o.createdAt.toISOString(),
                },
            });
        return NextResponse.json({ ok: true });
    } catch (e) {
        return NextResponse.json(
            { error: "Unable to update order" },
            { status: 400 },
        );
    }
}
