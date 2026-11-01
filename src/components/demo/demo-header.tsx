import { LogoMark } from "@/components/brand/logo";
import { SourceBadge } from "@/components/shared/provenance";
import { Badge } from "@/components/ui/badge";
import { DATASET, PREDICTION_FRAMING } from "@/lib/research";
import { fdate, fmt } from "@/lib/utils";

const FACTS = [
  { label: "Recorded observations", value: fmt.int(DATASET.totalRows) },
  { label: "IBM backends", value: String(DATASET.backends) },
  { label: "Backend–qubit series", value: String(DATASET.series) },
  { label: "Observation window", value: `${fdate.monthYear(DATASET.observationStart)} – ${fdate.monthYear(DATASET.observationEnd)}` },
  { label: "Predicted quantity", value: "next recorded readout_error" },
];

export function DemoHeader() {
  return (
    <header className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <LogoMark size={34} />
          <div>
            <div className="text-xl font-semibold tracking-tight text-text">
              Qubit<span className="text-cyan">Watch</span>
            </div>
            <div className="text-sm text-text-3">Predictive Intelligence for Quantum Hardware</div>
          </div>
        </div>
        <Badge variant="outline" className="mt-1">
          Research Demo
        </Badge>
      </div>

      <div className="max-w-3xl">
        <p className="eyebrow mb-2">Research</p>
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-text sm:text-[1.75rem] sm:leading-tight">
          Machine Learning for Predicting Temporal Noise Drift in Quantum Computing Systems
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-text-2">
          Readout error on IBM Quantum backends drifts between calibrations. Using only the history of recorded calibration observations for a
          backend–qubit series, gradient-boosted and bagged tree models estimate the readout error that will appear in the <em>next</em> calibration
          record. {PREDICTION_FRAMING.body.split(". ")[1]}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <dl className="surface grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 lg:divide-x lg:divide-line">
          {FACTS.map((f) => (
            <div key={f.label} className="px-4 py-3">
              <dt className="eyebrow">{f.label}</dt>
              <dd className="tabular mt-1 font-mono text-sm text-text">{f.value}</dd>
            </div>
          ))}
        </dl>
        <div className="flex items-center gap-2 text-xs text-text-4">
          <SourceBadge source="dataset" detail={DATASET.file} />
          Dataset facts transcribed from the cleaned export and the training notebook.
        </div>
      </div>
    </header>
  );
}
