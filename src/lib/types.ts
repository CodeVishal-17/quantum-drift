/**
 * QubitWatch — shared domain types.
 *
 * Mirrors the research artefacts supplied with the project: the cleaned IBM
 * readout-error dataset and the 17-feature model input schema from the model
 * handover. Nothing here performs inference.
 */

export const BACKENDS = ["ibm_fez", "ibm_marrakesh", "ibm_kingston", "ibm_torino"] as const;
export type BackendId = (typeof BACKENDS)[number];

export const MODEL_IDS = ["lightgbm", "random_forest", "xgboost"] as const;
export type ModelId = (typeof MODEL_IDS)[number];

/** The exact 17 model inputs documented in MODEL_HANDOVER.md. */
export interface ModelFeatureVector {
  current_error: number;
  lag_1: number;
  lag_2: number;
  lag_3: number;
  lag_5: number;
  rolling_mean_3: number;
  rolling_std_3: number;
  rolling_mean_5: number;
  rolling_std_5: number;
  rolling_mean_10: number;
  rolling_std_10: number;
  time_gap_hours: number;
  error_change: number;
  error_change_rate: number;
  calibration_age_seconds: number;
  backend: BackendId;
  qubit_a: number;
}

export const MODEL_FEATURES: (keyof ModelFeatureVector)[] = [
  "current_error",
  "lag_1",
  "lag_2",
  "lag_3",
  "lag_5",
  "rolling_mean_3",
  "rolling_std_3",
  "rolling_mean_5",
  "rolling_std_5",
  "rolling_mean_10",
  "rolling_std_10",
  "time_gap_hours",
  "error_change",
  "error_change_rate",
  "calibration_age_seconds",
  "backend",
  "qubit_a",
];

/** One recorded calibration observation, as used by the charts. */
export interface SeriesPoint {
  t: number; // epoch ms
  observed_time: string;
  readout_error: number;
  calibration_age_seconds: number;
  time_gap_hours: number | null;
  recal_event_id: string | null;
}

export interface EvaluationMetrics {
  mae: number;
  rmse: number;
  r2: number;
}
