import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orderSchema } from "@/lib/validation";
import { tenantForSlug, requireRole } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { publish } from "@/lib/events";

export async function GET() {
    try {
        const s = await requireRole(["owner", "manager", "waiter", "kitchen"]);
        const rows = await (
            await db()
        )
            .collection("orders")
            .find({ tenantId: s.tenantId })
            .sort({ createdAt: -1 })
            .limit(100)
            .toArray();
        return NextResponse.json(
            rows.map((o) => ({
                ...o,
                _id: o._id.toHexString(),
                createdAt: o.createdAt.toISOString(),
            })),
        );
    } catch (e) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}

export async function POST(req: Request) {
    try {
        const x = orderSchema.parse(await req.json());
        const t = await tenantForSlug(x.tenantSlug);

        if (!t)
            return NextResponse.json(
                { error: "Cafe not found" },
                { status: 404 },
            );

        const ids = x.items.map((i) => new ObjectId(i.productId));

        const products = await (
            await db()
        )
            .collection("products")
            .find({
                _id: { $in: ids },
                tenantId: t._id.toHexString(),
                available: true,
            })
            .toArray();

        if (products.length !== x.items.length)
            return NextResponse.json(
                { error: "One or more products are unavailable" },
                { status: 400 },
            );

        const items = x.items.map((i) => {
            const p = products.find(
                (p) => p._id.toHexString() === i.productId,
            )!;
            return {
                productId: i.productId,
                name: p.name,
                price: p.price,
                quantity: i.quantity,
            };
        });

        const total = items.reduce((a, i) => a + i.price * i.quantity, 0);
        const order = {
            tenantId: t._id.toHexString(),
            tableNumber: x.tableNumber,
            customerName: x.customerName,
            items,
            total,
            status: "pending",
            notes: x.notes,
            createdAt: new Date(),
        };
        
        const r = await (await db()).collection("orders").insertOne(order);
        const event = {
            type: "order.created",
            order: {
                ...order,
                _id: r.insertedId.toHexString(),
                createdAt: order.createdAt.toISOString(),
            },
        };
        publish(order.tenantId, event);
        return NextResponse.json(event.order, { status: 201 });
    } catch (e) {
        return NextResponse.json(
            { error: e instanceof Error ? e.message : "Invalid order" },
            { status: 400 },
        );
    }
}
