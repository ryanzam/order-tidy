import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="max-w-3xl text-center">
        <p className="uppercase tracking-[.25em] text-sm text-[#7b5e3b]">
          OrderTidy SaaS
        </p>
        <h1 className="serif text-5xl md:text-7xl mt-4">
          Digital menus, ordering & kitchen flow.
        </h1>
        <p className="mt-6 text-lg text-stone-600">
          A multi-tenant cafe platform inspired by the Apero Cafe experience,
          with staff roles, QR menus, live orders and kitchen display.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            className="rounded-full bg-stone-900 px-6 py-3 text-white"
            href="/register"
          >
            Create cafe
          </Link>
          <Link className="rounded-full border px-6 py-3" href="/login">
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
