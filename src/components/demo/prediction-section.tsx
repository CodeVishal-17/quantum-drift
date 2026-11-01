"use client";

import * as React from "react";
import { ArrowRight, Loader2, Play } from "lucide-react";

import { Metric } from "@/components/shared/metric";
import { Panel, PanelBody, PanelFooter, PanelHeader } from "@/components/shared/panel";
import { DemoBadge, RecordedBadge, SourceBadge } from "@/components/shared/provenance";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, type PredictResponse } from "@/lib/api";
import { assembleFeatures } from "@/lib/features";
import { recordedSeries } from "@/lib/recorded";
import { EXPERIMENT_HANDOVER, EXPERIMENT_XGB, MODELS, PREDICTION_FRAMING } from "@/lib/research";
import { MODEL_FEATURES, MODEL_IDS, type BackendId, type ModelId } from "@/lib/types";
import { cn, fdate, fmt } from "@/lib/utils";

import { SectionTitle } from "./section-title";

type RunState = { status: "idle" } | { status: "loading" } | { status: "done"; result: PredictResponse } | { status: "error"; message: string };

export function PredictionSection({
  backend,
  model,
  onModelChange,
}: {
  backend: BackendId;
  model: ModelId;
  onModelChange: (m: ModelId) => void;
}) {
  const card = MODELS[model];
  const experiment = card.experiment === "handover" ? EXPERIMENT_HANDOVER : EXPERIMENT_XGB;

  const series = React.useMemo(() => recordedSeries(backend), [backend]);
  const latest = series.points[series.points.length - 1];
  const assembly = React.useMemo(() => assembleFeatures(backend, series.qubit, series.points), [backend, series]);

  // The run result belongs to one (backend, model) pair; clear it when either changes.
  const [run, setRun] = React.useState<RunState>({ status: "idle" });
  const [runKey, setRunKey] = React.useState(`${backend}/${model}`);
  const currentKey = `${backend}/${model}`;
  if (runKey !== currentKey) {
    setRunKey(currentKey);
    setRun({ status: "idle" });
  }
  const runId = React.useRef(0);

  const runPrediction = async () => {
    if (!assembly.ok) return;
    const id = ++runId.current;
    setRun({ status: "loading" });
    try {
      const result = await api.predict({ model, features: assembly.features, issued_at: assembly.issuedAt });
      if (runId.current === id) setRun({ status: "done", result });
    } catch (e) {
      if (runId.current === id) setRun({ status: "error", message: e instanceof Error ? e.message : "Prediction request failed." });
    }
  };

  const result = run.status === "done" ? run.result : null;
  const isPlaceholder = result?.provenance === "persistence_baseline";

  return (
    <section id="prediction" className="flex flex-col gap-4">
      <SectionTitle
        index="02"
        title="Prediction Demo"
        description="Assemble the model's input features from the recorded series above and request the next-record readout-error estimate from the prediction service."
      />

      <Panel>
        <PanelHeader
          title="Next recorded observation"
          description={`${PREDICTION_FRAMING.headline} ${PREDICTION_FRAMING.body.split(". ")[1]}`}
          actions={
            <Select value={model} onValueChange={(v) => onModelChange(v as ModelId)}>
              <SelectTrigger size="sm" className="w-[190px]" aria-label="Model">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODEL_IDS.map((id) => (
                  <SelectItem key={id} value={id}>
                    {MODELS[id].name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        />

        <PanelBody className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {/* Left: inputs and the action */}
          <div className="flex flex-col gap-5">
            <Metric
              label="Latest recorded readout error"
              value={fmt.err(latest.readout_error, 5)}
              size="md"
              hint={`${backend} · qubit ${series.qubit} · ${fdate.dayTime(latest.observed_time)} UTC`}
              badge={<RecordedBadge />}
            />

            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs">
              <div>
                <dt className="eyebrow">Model</dt>
                <dd className="mt-1 text-text">{card.name}</dd>
              </div>
              <div>
                <dt className="eyebrow">Experiment</dt>
                <dd className="mt-1 text-text">{experiment.title}</dd>
              </div>
              <div>
                <dt className="eyebrow">Inputs</dt>
                <dd className="mt-1 text-text">{card.featureCount} features from records at or before the latest observation</dd>
              </div>
              <div>
                <dt className="eyebrow">Executed by</dt>
                <dd className="mt-1 text-text">{api.mode === "http" ? "Prediction service (HTTP)" : "Not connected — demo placeholder"}</dd>
              </div>
            </dl>

            <div className="flex flex-col gap-2">
              <Button size="lg" onClick={runPrediction} disabled={!assembly.ok || run.status === "loading"} className="w-full sm:w-auto">
                {run.status === "loading" ? <Loader2 className="animate-spin" /> : <Play />}
                {run.status === "loading" ? "Requesting prediction…" : result ? "Run Prediction again" : "Run Prediction"}
              </Button>
              {!assembly.ok && <p className="text-xs text-amber">{assembly.reason}</p>}
            </div>
          </div>

          {/* Right: the result */}
          <div className={cn("surface flex flex-col justify-between gap-6 bg-navy-800/40 p-5", isPlaceholder && "border-amber/30")}>
            {run.status === "idle" && (
              <div className="flex flex-1 flex-col items-start justify-center gap-2 py-6 text-sm text-text-3">
                <p className="text-text-2">No prediction requested yet.</p>
                <p className="max-w-sm text-xs leading-relaxed">
                  Press <span className="text-text">Run Prediction</span> to send the assembled feature vector for {backend} · qubit {series.qubit} to the{" "}
                  {card.name} endpoint.
                </p>
              </div>
            )}

            {run.status === "loading" && (
              <div className="flex flex-1 items-center justify-center py-6 text-sm text-text-3">
                <Loader2 className="mr-2 size-4 animate-spin" /> Waiting for the prediction service…
              </div>
            )}

            {run.status === "error" && (
              <div className="flex flex-1 flex-col justify-center gap-1 py-6 text-sm">
                <p className="text-rose">Prediction request failed.</p>
                <p className="text-xs text-text-3">{run.message}</p>
              </div>
            )}

            {result && (
              <>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <Metric
                    label="Predicted next recorded readout error"
                    value={fmt.err(result.predicted_next_error, 5)}
                    size="xl"
                    accent={isPlaceholder ? "amber" : "cyan"}
                  />
                  {isPlaceholder ? <DemoBadge label="DEMO DATA" /> : <Badge variant="default">Model output</Badge>}
                </div>

                <dl className="grid gap-x-6 gap-y-3 text-xs sm:grid-cols-2">
                  <div>
                    <dt className="eyebrow">Model</dt>
                    <dd className="mt-1 text-text">{isPlaceholder ? `${card.name} — requested, not executed` : card.name}</dd>
                  </div>
                  <div>
                    <dt className="eyebrow">Issued at</dt>
                    <dd className="mt-1 text-text">{fdate.full(result.issued_at)}</dd>
                  </div>
                  <div>
                    <dt className="eyebrow">Target</dt>
                    <dd className="mt-1 text-text">The next calibration record for this series, whenever it is written (median gap ≈ 3.95 h)</dd>
                  </div>
                  <div>
                    <dt className="eyebrow">Change vs latest record</dt>
                    <dd className="tabular mt-1 flex items-center gap-1.5 font-mono text-text">
                      {fmt.err(latest.readout_error, 5)} <ArrowRight className="size-3 text-text-4" /> {fmt.err(result.predicted_next_error, 5)}
                      <span className="text-text-3">({fmt.signed(result.predicted_next_error - latest.readout_error, 5)})</span>
                    </dd>
                  </div>
                </dl>

                {isPlaceholder && (
                  <p className="border-t border-line pt-3 text-xs leading-relaxed text-amber/90">
                    No prediction service is connected, so this value is the <span className="font-medium">persistence baseline</span> (next = current) — the
                    reference baseline reported in both experiments. It is <span className="font-medium">not</span> an output of {card.name}. Point{" "}
                    <span className="font-mono">NEXT_PUBLIC_QUBITWATCH_API_URL</span> at a service hosting the exported pipeline to see the model estimate.
                  </p>
                )}
              </>
            )}
          </div>
        </PanelBody>

        <details className="group border-t border-line">
          <summary className="cursor-pointer list-none px-5 py-2.5 text-xs text-text-3 hover:text-text-2">
            <span className="group-open:hidden">Show the {MODEL_FEATURES.length}-feature input vector assembled from the recorded series</span>
            <span className="hidden group-open:inline">Hide input vector</span>
          </summary>
          {assembly.ok ? (
            <ul className="grid gap-x-8 border-t border-line px-5 py-3 font-mono text-[11.5px] sm:grid-cols-2">
              {MODEL_FEATURES.map((k) => {
                const v = assembly.features[k];
                return (
                  <li key={k} className="flex items-center justify-between gap-4 py-1">
                    <span className="text-text-3">{k}</span>
                    <span className="tabular text-text">
                      {typeof v !== "number" ? String(v) : k === "qubit_a" || k === "calibration_age_seconds" ? fmt.int(v) : k === "time_gap_hours" ? v.toFixed(3) : v.toFixed(6)}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="border-t border-line px-5 py-3 text-xs text-text-3">{assembly.reason}</p>
          )}
        </details>

        <PanelFooter>
          <span className="text-xs text-text-3">
            Actual-versus-predicted plot omitted: the experiments exported aggregate metrics only, not per-observation predictions. Every model input is
            computed from recorded observations at or before the issue time.
          </span>
          <SourceBadge source="handover" detail="FEATURE_ENGINEERING.md · MODEL_HANDOVER.md" />
        </PanelFooter>
      </Panel>
    </section>
  );
}
