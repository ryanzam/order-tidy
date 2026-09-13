import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { LiveOrders } from "@/components/live-orders";

export default async function Dashboard() {
    const session = await requireSession();

    const rows = await (
        await db()
    )
        .collection("orders")
        .find({ tenantId: session.tenantId })
        .sort({ createdAt: -1 })
        .limit(50)
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
