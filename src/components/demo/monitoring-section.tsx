"use client";

import * as React from "react";

import { CHART, ChartLegend } from "@/components/charts/chart-theme";
import { SeriesChart } from "@/components/charts/series-chart";
import { Metric } from "@/components/shared/metric";
import { Panel, PanelBody, PanelFooter, PanelHeader } from "@/components/shared/panel";
import { RecordedBadge } from "@/components/shared/provenance";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { recordedSeries, RECORDED_SOURCE } from "@/lib/recorded";
import { BACKEND_META } from "@/lib/research";
import { BACKENDS, type BackendId } from "@/lib/types";
import { fdate, fmt } from "@/lib/utils";

import { SectionTitle } from "./section-title";

export function MonitoringSection({ backend, onBackendChange }: { backend: BackendId; onBackendChange: (b: BackendId) => void }) {
  const series = React.useMemo(() => recordedSeries(backend), [backend]);
  const points = series.points;
  const latest = points[points.length - 1];
  const previous = points[points.length - 2];
  const first = points[0];
  const delta = previous ? latest.readout_error - previous.readout_error : null;

  return (
    <section id="monitoring" className="flex flex-col gap-4">
      <SectionTitle index="01" title="Hardware Monitoring" description="Recorded readout-error observations for one backend–qubit series, read from the dataset export." />

      <Panel>
        <PanelHeader
          title={
            <span className="flex flex-wrap items-center gap-x-2">
              Readout error history
              <span className="font-mono text-xs text-text-3">
                {backend} · qubit {series.qubit}
              </span>
            </span>
          }
          actions={
            <>
              <Select value={backend} onValueChange={(v) => onBackendChange(v as BackendId)}>
                <SelectTrigger size="sm" className="w-[170px]" aria-label="Backend">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BACKENDS.map((b) => (
                    <SelectItem key={b} value={b}>
                      <span className="font-mono text-xs">{b}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <RecordedBadge />
            </>
          }
        />

        <PanelBody className="grid gap-6 border-b border-line sm:grid-cols-3">
          <Metric
            label="Latest recorded readout error"
            value={fmt.err(latest.readout_error, 5)}
            size="lg"
            accent="cyan"
            hint={delta === null ? undefined : `${fmt.signed(delta, 5)} vs previous record`}
          />
          <Metric
            label="Latest observation"
            value={<span className="text-xl sm:text-2xl">{fdate.dayTime(latest.observed_time)}</span>}
            size="md"
            hint={`${fdate.full(latest.observed_time)} · gap since previous ${fmt.hours(latest.time_gap_hours)}`}
          />
          <Metric
            label="Series in dataset"
            value={<span className="text-xl sm:text-2xl">{fmt.int(series.totalRows)}</span>}
            size="md"
            hint={`observations for this qubit · ${BACKEND_META[backend].qubits} qubits on ${BACKEND_META[backend].label}`}
          />
        </PanelBody>

        <PanelBody>
          <SeriesChart data={points} height={280} />
        </PanelBody>

        <PanelFooter>
          <ChartLegend
            items={[
              { label: "Recorded readout error", color: CHART.cyan },
              { label: "Trailing 10-record mean", color: CHART.violetBright },
              { label: "Chip-wide recalibration", color: CHART.amber, dashed: true },
            ]}
          />
          <span className="text-xs text-text-3">
            Last {points.length} records · {fdate.short(first.observed_time)} – {fdate.short(latest.observed_time)} {new Date(latest.t).getUTCFullYear()}
          </span>
        </PanelFooter>
      </Panel>

      <p className="text-xs leading-relaxed text-text-4">
        {RECORDED_SOURCE.note} Source: <span className="font-mono">{RECORDED_SOURCE.file}</span>, qubit {series.qubit} on each backend, duplicate
        timestamps excluded. Timestamps are shown in UTC.
      </p>
    </section>
  );
}
