import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { LiveOrders } from "@/components/live-orders";

export default async function Kitchen() {
    const s = await requireRole(["owner", "manager", "kitchen"]);
    const rows = await (
        await db()
    )
        .collection("orders")
        .find({
            tenantId: s.tenantId,
            status: { $in: ["confirmed", "preparing", "ready"] },
        })
        .sort({ createdAt: 1 })
        .toArray();
    return (
        <LiveOrders
            initial={rows.map((o) => ({
                ...o,
                _id: o._id.toHexString(),
                createdAt: o.createdAt.toISOString(),
            }))}
        />
    );
}
