"use client";

import * as React from "react";
import type { TeamRow } from "./LeaderboardTable";

// The Plot component type returned by the factory
type PlotComponent = React.ComponentType<import("react-plotly.js").PlotParams>;

export default function EpaSrScatter({
  rows,
  title,
}: {
  rows: TeamRow[];
  title?: string;
}) {
  const [Plot, setPlot] = React.useState<PlotComponent | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const [{ default: createPlotlyComponent }, plotlyMod] = await Promise.all([
        import("react-plotly.js/factory"),
        import("plotly.js-basic-dist"),
      ]);
      if (!mounted) return;
      const Plotly = (plotlyMod as { default?: unknown }).default ?? plotlyMod;
      const Comp = createPlotlyComponent(Plotly);
      setPlot(() => Comp as PlotComponent);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (!Plot) {
    return (
      <div className="h-[420px] grid place-items-center text-sm text-neutral-500">
        Loading chart…
      </div>
    );
  }

  const data = [
    {
      type: "scatter",
      mode: "markers+text",
      x: rows.map((r) => r.success_rate),
      y: rows.map((r) => r.epa),
      text: rows.map((r) => r.posteam),
      textposition: "top center",
      marker: { size: 10 },
    },
  ] as unknown as import("plotly.js").Data[];

  const layout: import("plotly.js").Layout = {
    title: { text: title ?? "EPA vs Success Rate" },
    xaxis: { title: { text: "Success Rate" }, tickformat: ",.0%", hoverformat: ".1%" },
    yaxis: { title: { text: "EPA / play" }, tickformat: ".3f" },
    margin: { t: 40, r: 20, b: 50, l: 60 },
    showlegend: false,
  };

  return (
    <Plot
      data={data}
      layout={layout}
      useResizeHandler
      style={{ width: "100%", height: "420px" }}
      config={{ displayModeBar: false }}
    />
  );
}

