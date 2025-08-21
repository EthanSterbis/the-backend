"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import type { TeamRow } from "./LeaderboardTable";

// Render Plotly only in the browser
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function EpaSrScatter({
  rows,
  title,
}: {
  rows: TeamRow[];
  title?: string;
}) {
  // Lazy-load plotly.js on the client to avoid "self is not defined"
  const [plotly, setPlotly] = React.useState<any>(null);

  React.useEffect(() => {
    let mounted = true;
    import("plotly.js-basic-dist").then((m) => {
      if (mounted) setPlotly(m.default ?? m);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!plotly) {
    return (
      <div className="h-[420px] grid place-items-center text-sm text-neutral-500">
        Loading chart…
      </div>
    );
  }

  const data = [
    {
      x: rows.map((r) => r.success_rate),
      y: rows.map((r) => r.epa),
      text: rows.map((r) => r.posteam),
      type: "scatter",
      mode: "markers+text",
      textposition: "top center",
      marker: { size: 10 },
    },
  ];

  const layout: any = {
    title: title ?? "EPA vs Success Rate",
    xaxis: { title: "Success Rate", tickformat: ",.0%", hoverformat: ".1%" },
    yaxis: { title: "EPA / play", tickformat: ".3f" },
    margin: { t: 40, r: 20, b: 50, l: 60 },
    showlegend: false,
  };

  return (
    <Plot
      plotly={plotly}
      data={data as any}
      layout={layout}
      useResizeHandler
      style={{ width: "100%", height: "420px" }}
      config={{ displayModeBar: false }}
    />
  );
}
