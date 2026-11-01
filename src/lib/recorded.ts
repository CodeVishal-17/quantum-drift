/**
 * Recorded readout-error observations.
 *
 * `recorded-readout-error.json` is a verbatim excerpt of the supplied dataset
 * export (quantum_readout_error_cleaned.csv): qubit 0 on each backend, the
 * last 150 observations. It was produced by an offline extraction script —
 * no value in it is generated, smoothed or otherwise synthesised.
 */

import raw from "@/data/recorded-readout-error.json";
import type { BackendId, SeriesPoint } from "./types";

interface RecordedPoint {
  observed_time: string;
  readout_error: number;
  calibration_age_seconds: number;
  time_gap_hours: number | null;
  recal_event_id: string | null;
}

interface RecordedSeries {
  backend: BackendId;
  qubit_a: number;
  total_rows_in_dataset: number;
  points: RecordedPoint[];
}

interface RecordedFile {
  source: {
    file: string;
    columns: string[];
    selection: string;
    extracted_at: string;
    note: string;
  };
  series: Record<string, RecordedSeries>;
}

const data = raw as RecordedFile;

export const RECORDED_SOURCE = data.source;

export function recordedSeries(backend: BackendId): { qubit: number; totalRows: number; points: SeriesPoint[] } {
  const s = data.series[backend];
  return {
    qubit: s.qubit_a,
    totalRows: s.total_rows_in_dataset,
    points: s.points.map((p) => ({ ...p, t: Date.parse(p.observed_time) })),
  };
}
