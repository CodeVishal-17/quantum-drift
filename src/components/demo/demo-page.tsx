"use client";

import * as React from "react";

import { ProvenanceLegend } from "@/components/shared/provenance";
import { MODELS } from "@/lib/research";
import type { BackendId, ModelId } from "@/lib/types";

import { DemoHeader } from "./demo-header";
import { MonitoringSection } from "./monitoring-section";
import { PerformanceSection, type ExperimentId } from "./performance-section";
import { PredictionSection } from "./prediction-section";

/**
 * QubitWatch — single-page research demonstration.
 *
 * All state lives here so the three sections stay in step: the backend chosen
 * in Hardware Monitoring feeds the Prediction Demo, and the model chosen there
 * is highlighted in Model Performance.
 */
export function DemoPage() {
  const [backend, setBackend] = React.useState<BackendId>("ibm_fez");
  const [model, setModel] = React.useState<ModelId>("lightgbm");
  const [experiment, setExperiment] = React.useState<ExperimentId>("handover");

  const selectModel = (id: ModelId) => {
    setModel(id);
    setExperiment(MODELS[id].experiment);
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-4 pt-8 pb-16 sm:px-6 sm:pt-10">
      <DemoHeader />
      <MonitoringSection backend={backend} onBackendChange={setBackend} />
      <PredictionSection backend={backend} model={model} onModelChange={selectModel} />
      <PerformanceSection model={model} onModelChange={selectModel} experiment={experiment} onExperimentChange={setExperiment} />

      <footer className="flex flex-col gap-3 border-t border-line pt-5 text-xs text-text-4">
        <ProvenanceLegend />
        <p>
          Frontend-only research demonstration. No live connection to IBM Quantum hardware, no inference in the browser. Recorded values come from the
          supplied dataset export; metrics come from the two experiment notebooks and the model handover package.
        </p>
      </footer>
    </div>
  );
}
