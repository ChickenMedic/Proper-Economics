import type { Metadata } from "next";
import Link from "next/link";
import SupplyDemand from "@/components/interactives/SupplyDemand";

export const metadata: Metadata = {
  title: "Supply & Demand - an interactive introduction",
  description:
    "Drag the price of coffee, trigger a frost, impose rent control - and watch a market find its own price. Five short acts, no math required.",
};

export default function SupplyAndDemandPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="text-xs uppercase tracking-wide text-(--accent) font-medium">
        Interactive · 5 acts + sandbox
      </p>
      <h1 className="mt-1 font-display text-3xl sm:text-4xl font-semibold">
        Supply &amp; Demand
      </h1>
      <p className="mt-3 max-w-2xl text-(--fg-soft)">
        The most famous diagram in economics, one idea at a time. You&apos;ve felt
        all of this at the coffee counter - here you get to drive it.
      </p>

      <div className="mt-8">
        <SupplyDemand />
      </div>

      <p className="mt-8 text-sm text-(--fg-soft)">
        The scissors diagram is due to{" "}
        <Link href="/economists/" className="text-(--accent) underline">
          Alfred Marshall
        </Link>{" "}
        (profile coming soon). A deliberately simplified teaching model - real
        markets are messier, but the logic is the same.
      </p>
    </div>
  );
}
