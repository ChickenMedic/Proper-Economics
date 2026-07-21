import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-(--line)">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-(--fg-soft) flex flex-wrap gap-x-8 gap-y-3 items-baseline">
        <p className="font-display text-base text-(--fg)">
          Proper<span className="text-(--accent)">Economics</span>
        </p>
        <p>
          Every big idea in economics, explained so your neighbor gets it - free, no
          accounts, no tracking.
        </p>
        <p>
          <Link href="/about/" className="underline underline-offset-2 hover:text-(--fg)">
            About, methodology &amp; corrections
          </Link>
        </p>
      </div>
    </footer>
  );
}
