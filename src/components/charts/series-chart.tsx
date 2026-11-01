"use client";

import * as React from "react";
import { CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { SeriesPoint } from "@/lib/types";
import { fdate, fmt } from "@/lib/utils";
import { AXIS_PROPS, CHART, makeTooltip, timeTick } from "./chart-theme";

type Row = SeriesPoint & { mean10: number | null };

/** Trailing 10-record mean — the same quantity as the model feature rolling_mean_10. */
function rollingMean10(values: number[]): (number | null)[] {
  return values.map((_, i) => {
    if (i < 9) return null;
    let s = 0;
    for (let j = i - 9; j <= i; j++) s += values[j];
    return s / 10;
  });
}

const SeriesTooltip = makeTooltip<Row>((p) => ({
  title: `${fdate.dayTime(p.t)} UTC`,
  rows: [
    { label: "Readout error", value: fmt.err(p.readout_error, 5), color: CHART.cyan },
    { label: "Rolling mean (10)", value: fmt.err(p.mean10, 5), color: CHART.violetBright },
    { label: "Calibration age", value: fmt.seconds(p.calibration_age_seconds) },
    { label: "Gap since previous", value: fmt.hours(p.time_gap_hours) },
  ],
  footer: p.recal_event_id ? `Recalibration · ${p.recal_event_id}` : "recorded observation",
}));

/** Simple line chart of recorded readout-error observations for one backend–qubit series. */
export function SeriesChart({ data, height = 280, showRecal = true }: { data: SeriesPoint[]; height?: number; showRecal?: boolean }) {
  const rows = React.useMemo<Row[]>(() => {
    const m = rollingMean10(data.map((d) => d.readout_error));
    return data.map((d, i) => ({ ...d, mean10: m[i] }));
  }, [data]);

  const recal = rows.filter((r) => r.recal_event_id);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={rows} margin={{ top: 12, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} stroke={CHART.grid} />
        <XAxis dataKey="t" type="number" scale="time" domain={["dataMin", "dataMax"]} tickFormatter={timeTick} minTickGap={48} {...AXIS_PROPS} />
        <YAxis domain={[0, "auto"]} tickFormatter={(v: number) => (v < 0.01 ? v.toFixed(4) : v.toFixed(3))} width={56} {...AXIS_PROPS} />
        <Tooltip content={<SeriesTooltip />} cursor={{ stroke: "rgb(34 211 238 / 0.35)", strokeDasharray: "3 3" }} />
        {showRecal && recal.map((r) => <ReferenceLine key={r.t} x={r.t} stroke={CHART.amber} strokeOpacity={0.7} strokeDasharray="3 3" />)}
        <Line type="monotone" dataKey="mean10" stroke={CHART.violetBright} strokeWidth={1.2} dot={false} connectNulls isAnimationActive={false} />
        <Line
          type="linear"
          dataKey="readout_error"
          stroke={CHART.cyan}
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 3.5, fill: CHART.cyanBright, stroke: "#060a14", strokeWidth: 2 }}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
