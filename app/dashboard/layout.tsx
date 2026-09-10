import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();
    if (!session) redirect("/login");

    return (
        <div className="min-h-screen md:flex">
            <aside className="hidden md:flex w-60 bg-stone-900 text-white p-5 flex-col gap-2">
                <div className="serif text-2xl mb-8">
                    {session.name || "MyCafe"}
                </div>
                {[
                    ["/dashboard", "Orders"],
                    ["/dashboard/products", "Products"],
                    ["/dashboard/staff", "Staff"],
                    ["/kitchen", "Kitchen"],
                    ["/dashboard/settings", "Settings"],
                ].map(([href, label]) => (
                    <Link
                        className="rounded-xl px-4 py-3 hover:bg-white/10"
                        href={href}
                        key={href}
                    >
                        {label}
                    </Link>
                ))}
                <form
                    action="/api/auth/logout"
                    method="post"
                    className="mt-auto"
                >
                    <button className="text-sm text-white/60">Sign out</button>
                </form>
            </aside>
            <main className="flex-1">{children}</main>
        </div>
    );
}
