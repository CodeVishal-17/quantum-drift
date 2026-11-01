/**
 * Client-side feature assembly for display purposes only.
 *
 * Mirrors FEATURE_ENGINEERING.md so the interface can show exactly what a
 * prediction request would contain. No model is executed here; the output
 * is the payload shape for POST /api/v1/predict.
 */

import type { BackendId, ModelFeatureVector, SeriesPoint } from "./types";

function sampleStd(values: number[]) {
  const n = values.length;
  if (n < 2) return null;
  const m = values.reduce((a, b) => a + b, 0) / n;
  return Math.sqrt(values.reduce((a, b) => a + (b - m) ** 2, 0) / (n - 1));
}

function mean(values: number[]) {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export type FeatureAssembly =
  | { ok: true; features: ModelFeatureVector; issuedAt: string }
  | { ok: false; reason: string };

/** Builds the 17-feature vector from a chronologically ordered series. */
export function assembleFeatures(backend: BackendId, qubit: number, series: SeriesPoint[]): FeatureAssembly {
  const n = series.length;
  if (n < 10) return { ok: false, reason: "At least 10 observations are required for rolling_mean_10 / rolling_std_10." };
  const cur = series[n - 1];
  const v = series.map((p) => p.readout_error);
  const at = (k: number) => v[n - 1 - k];
  const win = (w: number) => v.slice(n - w, n);

  if (cur.time_gap_hours === null || cur.time_gap_hours === 0) {
    return { ok: false, reason: "error_change_rate is undefined for a zero or missing time gap; apply the data-quality policy." };
  }

  const error_change = at(0) - at(1);
  const features: ModelFeatureVector = {
    current_error: at(0),
    lag_1: at(1),
    lag_2: at(2),
    lag_3: at(3),
    lag_5: at(5),
    rolling_mean_3: mean(win(3)),
    rolling_std_3: sampleStd(win(3))!,
    rolling_mean_5: mean(win(5)),
    rolling_std_5: sampleStd(win(5))!,
    rolling_mean_10: mean(win(10)),
    rolling_std_10: sampleStd(win(10))!,
    time_gap_hours: cur.time_gap_hours,
    error_change,
    error_change_rate: error_change / cur.time_gap_hours,
    calibration_age_seconds: cur.calibration_age_seconds,
    backend,
    qubit_a: qubit,
  };
  return { ok: true, features, issuedAt: cur.observed_time };
}
