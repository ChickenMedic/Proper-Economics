import Link from "next/link";
import Portrait from "./Portrait";
import { SchoolBadge } from "./Badges";

/** Serializable card data - safe to pass from server pages into client lists. */
export type EconomistCardData = {
  slug: string;
  name: string;
  born: number;
  died: number | null;
  nationality: string;
  school: string;
  era: string;
  knownFor: string;
  flagship: boolean;
  portraitSrc: string | null;
};

export default function EconomistCard({ economist }: { economist: EconomistCardData }) {
  return (
    <Link
      href={`/economists/${economist.slug}/`}
      className="group flex gap-4 rounded-xl border border-(--line) bg-(--bg-raised) p-4 hover:border-(--accent) transition-colors"
    >
      <Portrait name={economist.name} src={economist.portraitSrc} size="sm" />
      <div className="min-w-0">
        <p className="font-display font-semibold group-hover:text-(--accent) transition-colors">
          {economist.name}
          {economist.flagship && (
            <span
              className="ml-2 align-middle text-xs text-(--accent)"
              title="Flagship profile"
            >
              ★
            </span>
          )}
        </p>
        <p className="text-xs text-(--fg-soft) tabular-nums mb-1">
          {economist.born}–{economist.died ?? ""} · {economist.nationality}
        </p>
        <p className="text-sm text-(--fg-soft) line-clamp-2">{economist.knownFor}</p>
        <div className="mt-2">
          <SchoolBadge school={economist.school} link={false} />
        </div>
      </div>
    </Link>
  );
}
