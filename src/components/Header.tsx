import Link from "next/link";
import SiteSearch from "./SiteSearch";

const NAV = [
  { href: "/timeline/", label: "Timeline" },
  { href: "/economists/", label: "Economists" },
  { href: "/schools/", label: "Schools" },
  { href: "/learn/", label: "Learn" },
  { href: "/tax/", label: "Tax" },
  { href: "/glossary/", label: "Glossary" },
  { href: "/about/", label: "About" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-(--line) bg-(--bg)/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
        <Link href="/" className="font-display text-xl font-semibold tracking-tight">
          Proper<span className="text-(--accent)">Economics</span>
        </Link>
        <nav aria-label="Main" className="order-3 w-full sm:order-none sm:w-auto sm:flex-1">
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-(--fg-soft) hover:text-(--fg) transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <SiteSearch />
      </div>
    </header>
  );
}
