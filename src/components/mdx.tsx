import Link from "next/link";
import type { MDXComponents } from "mdx/types";

type TipMap = Record<string, { term: string; short: string }>;

/**
 * Builds the component map passed to MDXRemote. Content authors get:
 *   <G term="elasticity">elastic</G>  — glossary tooltip + link
 *   <E to="karl-marx">Marx</E>        — cross-link to an economist profile
 */
export function mdxComponents(tips: TipMap): MDXComponents {
  return {
    G: ({ term, children }: { term: string; children: React.ReactNode }) => {
      const tip = tips[term];
      if (!tip) {
        // Unknown terms fail the index build; render plain as a safety net.
        return <span>{children}</span>;
      }
      return (
        <a
          href={`/glossary/#${term}`}
          className="glossary-term"
          data-tip={tip.short}
          aria-label={`${tip.term}: ${tip.short} (opens glossary)`}
        >
          {children}
        </a>
      );
    },
    E: ({ to, children }: { to: string; children: React.ReactNode }) => (
      <Link href={`/economists/${to}/`}>{children}</Link>
    ),
  };
}
