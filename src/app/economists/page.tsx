import type { Metadata } from "next";
import { getAllEconomists } from "@/lib/content";
import { toCardData } from "@/lib/portraits";
import EconomistIndex from "@/components/EconomistIndex";

export const metadata: Metadata = {
  title: "The economists",
  description:
    "Plain-English profiles of the people who shaped how we think about markets - from the mercantilists to the behavioral economists.",
};

export default function EconomistsPage() {
  const economists = getAllEconomists().map(toCardData);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl sm:text-4xl font-semibold">
        The economists
      </h1>
      <p className="mt-3 max-w-2xl text-(--fg-soft)">
        Every big idea in economics, explained so your neighbor gets it - free, no
        accounts, no tracking. Flagship profiles are marked with a ★.
      </p>
      <div className="mt-8">
        <EconomistIndex economists={economists} />
      </div>
    </div>
  );
}
