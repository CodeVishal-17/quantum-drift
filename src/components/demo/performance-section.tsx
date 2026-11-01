"use client";

import * as React from "react";
import { Check } from "lucide-react";

import { Panel, PanelFooter, PanelHeader } from "@/components/shared/panel";
import { SourceBadge } from "@/components/shared/provenance";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { EXPERIMENT_HANDOVER, EXPERIMENT_XGB, MODELS, type LeaderboardRow } from "@/lib/research";
import { MODEL_IDS, type ModelId } from "@/lib/types";
import { cn, fmt } from "@/lib/utils";

import { SectionTitle } from "./section-title";

export type ExperimentId = "handover" | "xgb";
type Split = "validation" | "test";

export function PerformanceSection({
  model,
  onModelChange,
  experiment,
  onExperimentChange,
}: {
  model: ModelId;
  onModelChange: (m: ModelId) => void;
  experiment: ExperimentId;
  onExperimentChange: (e: ExperimentId) => void;
}) {
  const [split, setSplit] = React.useState<Split>("test");
  const card = MODELS[model];

  const exp = experiment === "handover" ? EXPERIMENT_HANDOVER : EXPERIMENT_XGB;
  const rows: LeaderboardRow[] =
    experiment === "handover"
      ? EXPERIMENT_HANDOVER[split]
      : split === "validation"
        ? EXPERIMENT_XGB.validation
        : [
            {
              model: EXPERIMENT_XGB.finalTest.model,
              status: "Tuned",
              modelId: "xgboost",
              observations: EXPERIMENT_XGB.finalTest.observations,
              mae: EXPERIMENT_XGB.finalTest.mae,
              rmse: EXPERIMENT_XGB.finalTest.rmse,
              r2: EXPERIMENT_XGB.finalTest.r2,
            },
          ];
  const highlighted = card.experiment === experiment ? card.name : undefined;

  return (
    <section id="performance" className="flex flex-col gap-4">
      <SectionTitle
        index="03"
        title="Model Performance"
        description="Error metrics transcribed from the experiment notebooks. The handover run (LightGBM, Random Forest) and the XGBoost run used different dataset versions, feature sets and splits, so their numbers are never placed in one leaderboard."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-text-3">Metrics shown on the cards: {split === "test" ? "held-out test split" : "validation split"} of each model&rsquo;s own experiment.</p>
        <ToggleGroup type="single" value={split} onValueChange={(v) => v && setSplit(v as Split)} aria-label="Evaluation split">
          <ToggleGroupItem value="validation">Validation</ToggleGroupItem>
          <ToggleGroupItem value="test">Test</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* One card per model; each card is labelled with its experiment. */}
      <div className="grid gap-4 md:grid-cols-3">
        {MODEL_IDS.map((id) => {
          const m = MODELS[id];
          const metrics = m[split];
          const active = id === model;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onModelChange(id)}
              aria-pressed={active}
              className={cn(
                "surface relative flex flex-col gap-4 p-5 text-left transition-colors hover:bg-navy-800/60 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
                active && "border-cyan/40 bg-navy-800/50",
              )}
            >
              <div className="flex items-start justify-between gap-3 pr-6">
                <div>
                  <div className="text-sm font-medium text-text">{m.name}</div>
                  <div className="mt-0.5 text-xs text-text-3">{m.family}</div>
                </div>
                <Badge variant="outline">{m.experiment === "handover" ? "Handover run" : "XGBoost run"}</Badge>
              </div>
              <dl className="grid grid-cols-3 gap-2 border-t border-line pt-4 font-mono text-xs">
                <div>
                  <dt className="eyebrow">MAE</dt>
                  <dd className="tabular mt-1 text-text">{fmt.metric(metrics.mae)}</dd>
                </div>
                <div>
                  <dt className="eyebrow">RMSE</dt>
                  <dd className="tabular mt-1 text-text">{fmt.metric(metrics.rmse)}</dd>
                </div>
                <div>
                  <dt className="eyebrow">R²</dt>
                  <dd className="tabular mt-1 text-text">{fmt.metric(metrics.r2, 4)}</dd>
                </div>
              </dl>
              <div className="flex items-center justify-between gap-3 text-[11px] text-text-4">
                <span className="shrink-0">
                  {split} · {split === "test" ? `${fmt.int(m.test.observations)} obs` : `${m.featureCount} features`}
                </span>
                <span className="min-w-0 truncate font-mono">{m.artifact.split(" ")[0]}</span>
              </div>
              {active && (
                <span className="absolute top-4 right-4 flex size-5 items-center justify-center rounded-full bg-cyan/15 text-cyan">
                  <Check className="size-3" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Full leaderboard, one experiment at a time */}
      <Panel>
        <PanelHeader
          title={
            <span className="flex flex-wrap items-center gap-x-2">
              {exp.title}
              <span className="font-mono text-xs text-text-3">{exp.notebook}</span>
            </span>
          }
          description={`${exp.split.strategy}. Train ${fmt.int(exp.split.train)} · validation ${fmt.int(exp.split.validation)} · test ${fmt.int(exp.split.test)} observations · ${exp.featureCount} features.`}
          actions={
            <>
              <Tabs value={experiment} onValueChange={(v) => onExperimentChange(v as ExperimentId)}>
                <TabsList>
                  <TabsTrigger value="handover">Handover run</TabsTrigger>
                  <TabsTrigger value="xgb">XGBoost run</TabsTrigger>
                </TabsList>
              </Tabs>
              <SourceBadge source={exp.source} />
            </>
          }
        />
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Model</TableHead>
              <TableHead className="text-right">MAE</TableHead>
              <TableHead className="text-right">RMSE</TableHead>
              <TableHead className="text-right">R²</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.model} data-state={r.model === highlighted ? "selected" : undefined}>
                <TableCell className={cn("font-medium", r.model === highlighted ? "text-cyan" : "text-text")}>{r.model}</TableCell>
                <TableCell className="tabular text-right font-mono text-text-2">{fmt.metric(r.mae)}</TableCell>
                <TableCell className="tabular text-right font-mono text-text-2">{fmt.metric(r.rmse)}</TableCell>
                <TableCell className="tabular text-right font-mono text-text">{fmt.metric(r.r2)}</TableCell>
                <TableCell>
                  <Badge variant={r.status === "Tuned" ? "default" : r.status === "Baseline" ? "muted" : "outline"}>{r.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <PanelFooter>
          <span className="text-xs text-text-3">
            {experiment === "handover"
              ? split === "test"
                ? "Tuned LightGBM had the lowest test RMSE and highest test R²; Original LightGBM had the lowest test MAE. Every tree model beat the persistence baseline."
                : "Tuned Random Forest led validation RMSE and R². Tuned LightGBM was selected for integration as a deployment decision, not a validation win."
              : split === "test"
                ? "Only the tuned model was scored on the test window, after refitting on train + validation. ibm_torino had no rows in this window."
                : "254,041-row dataset version, 10 features, global chronological cut — not comparable with the handover run."}
          </span>
        </PanelFooter>
      </Panel>
    </section>
  );
}
