import type { Metadata } from "next";
import Timeline, { type TimelineEconomist } from "@/components/Timeline";
import timelineData from "@/data/timeline.json";

export const metadata: Metadata = {
  title: "Timeline of economic thought",
  description:
    "Five centuries of economists, schools of thought, and world events on one interactive timeline — with the arguments drawn as arrows.",
};

export default function TimelinePage() {
  const economists = timelineData.economists as TimelineEconomist[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl sm:text-4xl font-semibold">
        The conversation, 1550–today
      </h1>
      <p className="mt-3 max-w-2xl text-(--fg-soft)">
        Economic ideas answer each other across centuries. Every bar is a life;
        click one to see who they learned from and who they argued with. More
        thinkers are added as their profiles are published.
      </p>
      <div className="mt-8">
        <Timeline economists={economists} />
      </div>
    </div>
  );
}
