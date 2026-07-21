import type { Metadata } from "next";
import Link from "next/link";
import TaxExplorer from "@/components/tax/TaxExplorer";
import taxData from "@/data/tax-data.json";
import type { TaxData } from "@/lib/tax";

export const metadata: Metadata = {
  title: "How countries tax today",
  description:
    "Sourced, dated tax rates for ~45 countries - income, corporate, VAT, and tax-to-GDP - plus a compare tool, a stylized regime calculator, and an honest Laffer curve.",
};

export default function TaxTodayPage() {
  const data = taxData as unknown as TaxData;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="text-xs uppercase tracking-wide text-(--accent) font-medium">
        Data explorer
      </p>
      <h1 className="mt-1 font-display text-3xl sm:text-4xl font-semibold">
        How countries tax today
      </h1>
      <p className="mt-3 max-w-2xl text-(--fg-soft)">
        Headline rates for {data.countries.length} countries - every figure dated
        and linked to its source. For how we got here, read{" "}
        <Link href="/tax/history/" className="text-(--accent) underline">
          the history
        </Link>
        .
      </p>

      <div className="mt-8">
        <TaxExplorer data={data} />
      </div>

      <div className="mt-10 max-w-2xl text-xs text-(--fg-soft) space-y-2">
        <p>
          <strong>About this data.</strong> Compiled {data.updated} from Tax
          Foundation, PwC Worldwide Tax Summaries, and OECD Revenue Statistics;
          each country row links its sources and notes. &ldquo;Top income tax&rdquo;
          is the top statutory rate on employment income including typical
          sub-central taxes; real effective rates depend on thresholds, deductions,
          and social contributions not shown here. Found an error? See our{" "}
          <Link href="/about/" className="underline">
            corrections policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
