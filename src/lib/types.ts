/**
 * QubitWatch — shared domain types.
 *
 * These mirror the research artefacts supplied with the project:
 *  - the cleaned IBM readout-error dataset schema (15 columns)
 *  - the 17-feature model input schema from the model handover
 *
 * Nothing in this file performs inference. The types exist so the
 * frontend and a future prediction API agree on one contract.
 */

export const BACKENDS = [
  "ibm_fez",
  "ibm_marrakesh",
  "ibm_kingston",
  "ibm_torino",
] as const;

export type BackendId = (typeof BACKENDS)[number];

export const MODEL_IDS = ["lightgbm", "random_forest", "xgboost"] as const;
export type ModelId = (typeof MODEL_IDS)[number];

/** A single row of the supplied calibration dataset. */
export interface ObservationRow {
  id: string;
  backend: BackendId;
  qubit_a: number;
  readout_error: number;
  calibrated_time: string; // ISO-8601 UTC
  observed_time: string; // ISO-8601 UTC
  calibration_age_seconds: number;
  snapshot_update_time: string | null;
  property: "readout_error";
  property_family: "readout_error";
  scope: "qubit";
  is_new_measurement: boolean;
  is_failure_ceiling: boolean;
  chipwide_recal_event_id: string | null;
}

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

/** Time-series point for charts. */
export interface SeriesPoint {
  t: number; // epoch ms
  observed_time: string;
  readout_error: number;
  calibration_age_seconds: number;
  time_gap_hours: number | null;
  recal_event_id: string | null;
}

/** Actual vs predicted record (next-observation framing). */
export interface PredictionRecord {
  t: number; // time of the *target* observation
  issued_at: string; // observation used to issue the prediction
  target_time: string;
  target_gap_hours: number;
  actual: number | null; // null when the next observation has not arrived
  predicted: number;
  residual: number | null;
  model: ModelId;
  backend: BackendId;
  qubit_a: number;
}

export type DriftEventKind = "confirmed_recalibration" | "detected_anomaly";

export interface DriftEvent {
  id: string;
  kind: DriftEventKind;
  backend: BackendId;
  qubit_a: number | null; // null = chip-wide
  t: number;
  time: string;
  magnitude: number; // |Δ readout error| or z-score depending on kind
  note: string;
}

export interface EvaluationMetrics {
  mae: number;
  rmse: number;
  r2: number;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ObservationQuery {
  backend?: BackendId | "all";
  qubit?: number | null;
  search?: string;
  from?: string | null;
  to?: string | null;
  minError?: number | null;
  maxError?: number | null;
  recalOnly?: boolean;
  sortBy?: keyof Pick<
    ObservationRow,
    | "observed_time"
    | "readout_error"
    | "calibration_age_seconds"
    | "qubit_a"
    | "backend"
  >;
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}
