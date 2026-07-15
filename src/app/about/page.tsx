import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "What ProperEconomics is, how it's made, where it stands, and how to get things corrected.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 prose">
      <h1 className="font-display text-3xl sm:text-4xl font-semibold not-prose">
        About ProperEconomics
      </h1>

      <h2>The mission</h2>
      <p>
        Every big idea in economics, explained so your neighbor gets it — with toys
        you can play with. This site distills the thinkers who shaped how we
        understand markets, from the mercantilists to the behavioral economists, into
        plain-English profiles, an interactive timeline, and hands-on simulations.
        It&apos;s free, has no accounts, no paywalls, and no tracking.
      </p>

      <h2>Where we stand</h2>
      <p>
        This site has a point of view, and we&apos;d rather state it than smuggle it:
        it&apos;s grounded in mainstream economics. Markets coordinate through prices,
        and much of the site — especially the{" "}
        <Link href="/learn/price-signals/">price-signals interactive</Link> — is built
        to show <em>why</em> price signals matter, including where centrally planned
        economies historically broke down.
      </p>
      <p>
        That perspective comes with fairness rules we hold ourselves to on every
        page: exposition before critique, always. Marx gets as fair and accurate a
        summary of what he actually argued as Friedman does. Critiques cite who makes
        them. Contested empirical claims are labeled contested. If you think a
        profile fails that standard, we want to hear about it.
      </p>

      <h2>Methodology &amp; sources</h2>
      <p>
        Profiles are checked against standard references — the Stanford Encyclopedia
        of Philosophy, Encyclopaedia Britannica, and the economists&apos; own works,
        which we link in full text wherever they&apos;re in the public domain (Project
        Gutenberg, the Online Library of Liberty, the Marxists Internet Archive).
        Every profile lists its sources under &ldquo;Their own words&rdquo; and
        &ldquo;Go further.&rdquo; Portraits are public-domain or openly licensed
        images from Wikimedia Commons, credited on each page.
      </p>
      <p>
        The simulations are deliberately simplified teaching models, not forecasts —
        each one says so, and each one has a text alternative describing what it
        demonstrates. Future tax data will be sourced from the OECD and the Tax
        Foundation with a &ldquo;data as of&rdquo; year shown in the interface.
      </p>

      <h2>Corrections</h2>
      <p>
        Found an error — a date, a quote, a mischaracterized argument? Email{" "}
        <a href="mailto:corrections@propereconomics.com">
          corrections@propereconomics.com
        </a>
        . Substantive corrections are made promptly; we&apos;d rather be right than
        first.
      </p>

      <h2>Who&apos;s behind this</h2>
      <p>
        ProperEconomics is an independent project by Sam Dawson. It runs on a static
        site with no backend, which is also why it can promise: no cookies that need
        a consent banner, no analytics that follow you around, nothing to sign up
        for.
      </p>
    </div>
  );
}
