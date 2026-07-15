/** One country's verified tax figures. Every number must trace to a source URL. */
export type CountryTax = {
  name: string;
  iso: string; // ISO 3166-1 alpha-2
  region: "Europe" | "Americas" | "Asia-Pacific" | "Middle East & Africa";
  oecd: boolean;
  /** Top statutory personal income tax rate on employment income, combined
   *  central + typical sub-central, percent. */
  topIncomeRate: number | null;
  topIncomeNote?: string;
  /** Combined statutory corporate income tax rate, percent. */
  corporateRate: number | null;
  corporateNote?: string;
  /** Standard VAT/GST rate, percent. null = no national VAT (see note). */
  vatRate: number | null;
  vatNote?: string;
  /** Total tax revenue as % of GDP. */
  taxToGdp: number | null;
  taxToGdpYear: number | null;
  taxToGdpNote?: string;
  /** Year the rate figures describe. */
  asOf: number;
  sources: { label: string; url: string }[];
};

export type TaxData = {
  updated: string; // ISO date the dataset was compiled
  countries: CountryTax[];
};
