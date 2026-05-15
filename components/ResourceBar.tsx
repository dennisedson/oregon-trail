import { Gauge, HeartPulse, Wrench } from "lucide-react";
import type { TrailResources } from "@/lib/game-state";

export function ResourceBar({ resources }: { resources: TrailResources }) {
  const items = [
    {
      label: "Budget",
      value: resources.budget,
      icon: Gauge,
      tone: resources.budget < 25 ? "text-trail-danger" : "text-trail-darkGreen"
    },
    {
      label: "Morale",
      value: resources.morale,
      icon: HeartPulse,
      tone: resources.morale < 30 ? "text-trail-warning" : "text-trail-darkGreen"
    },
    {
      label: "Tech Debt",
      value: resources.techDebt,
      icon: Wrench,
      tone: resources.techDebt > 75 ? "text-trail-danger" : "text-trail-darkGreen"
    }
  ];

  return (
    <section className="pixel-border grid gap-4 bg-trail-panel p-4 text-xl sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="flex min-w-0 items-center gap-3">
          <item.icon aria-hidden="true" className="h-7 w-7 shrink-0 text-trail-ink" />
          <div className="min-w-0">
            <p className="text-2xl font-bold uppercase leading-none">{item.label}:</p>
            <p className={`text-2xl leading-none ${item.tone}`}>{item.value}/100</p>
          </div>
        </div>
      ))}
    </section>
  );
}
