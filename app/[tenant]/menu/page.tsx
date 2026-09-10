import { tenantForSlug } from "@/lib/auth";
import { db } from "@/lib/db";
import { MenuClient } from "@/components/menu-client";
import { notFound } from "next/navigation";

export default async function Menu({
    params,
}: {
    params: Promise<{ tenant: string }>;
}) {
    const { tenant } = await params;

    const t = await tenantForSlug(tenant);
    if (!t) notFound();
    const p = await (
        await db()
    )
        .collection("products")
        .find({ tenantId: t._id.toHexString(), available: true })
        .sort({ category: 1, name: 1 })
        .toArray();
    return (
        <MenuClient
            tenant={{
                name: t.name,
                slug: t.slug,
                description: t.description || "",
                currency: t.currency || "NPR",
                logoUrl: t.logoUrl || "",
            }}
            products={p.map((x) => ({ ...x, _id: x._id.toHexString() })) as any}
        />
    );
}
