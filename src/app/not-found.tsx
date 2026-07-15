import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="font-display text-4xl font-semibold">404 — no such page</h1>
      <p className="mt-4 text-(--fg-soft)">
        As any economist will tell you: sometimes the thing you demand simply
        isn&apos;t supplied.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-full bg-(--accent) px-5 py-2.5 text-sm font-medium text-(--bg) hover:opacity-90"
      >
        Back to the home page
      </Link>
    </div>
  );
}
