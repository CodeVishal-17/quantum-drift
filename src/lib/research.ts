/**
 * QubitWatch — documented research facts.
 *
 * Every value in this file was transcribed from the supplied research
 * artefacts. Nothing here is estimated or generated.
 *
 *   [H]  Quantum_Model_Handover.zip → MODEL_HANDOVER.md / FEATURE_ENGINEERING.md
 *   [T]  Models_training.ipynb       (handover experiment, 17 features)
 *   [X]  ML_UANTUM_PBL_REG_XGB.ipynb (separate XGBoost experiment, 10 features)
 *   [D]  quantum_readout_error_cleaned.csv (column scan)
 *
 * Results from [T] and [X] come from different dataset versions, feature
 * sets and split strategies. They are kept in separate structures and must
 * never be displayed on the same leaderboard.
 */

import type { BackendId, EvaluationMetrics, ModelId } from "./types";

export type SourceTag = "handover" | "training-notebook" | "xgb-notebook" | "dataset";

export const SOURCE_LABEL: Record<SourceTag, string> = {
  handover: "Model handover package",
  "training-notebook": "Models_training.ipynb",
  "xgb-notebook": "ML_UANTUM_PBL_REG_XGB.ipynb",
  dataset: "quantum_readout_error_cleaned.csv",
};

/* ------------------------------------------------------------------ */
/* Dataset                                                             */
/* ------------------------------------------------------------------ */

export interface BackendMeta {
  id: BackendId;
  label: string;
  rows: number;
  qubits: number;
  meanError: number;
  medianError: number;
  stdError: number;
  maxError: number;
  highErrorShare: number; // % of rows with readout_error > 0.30
  /** Short qualitative descriptor derived from the supplied statistics. */
  profile: string;
}

export const BACKEND_META: Record<BackendId, BackendMeta> = {
  ibm_fez: {
    id: "ibm_fez",
    label: "Fez",
    rows: 207_170,
    qubits: 156,
    meanError: 0.02829,
    medianError: 0.012207,
    stdError: 0.055415,
    maxError: 0.553589,
    highErrorShare: 1.305,
    profile: "Largest series set; 149 duplicate-timestamp pairs excluded from modelling.",
  },
  ibm_marrakesh: {
    id: "ibm_marrakesh",
    label: "Marrakesh",
    rows: 206_110,
    qubits: 156,
    meanError: 0.032169,
    medianError: 0.011963,
    stdError: 0.070291,
    maxError: 0.653564,
    highErrorShare: 2.395,
    profile: "Highest maximum error and heaviest high-error tail.",
  },
  ibm_kingston: {
    id: "ibm_kingston",
    label: "Kingston",
    rows: 149_467,
    qubits: 156,
    meanError: 0.023527,
    medianError: 0.009277,
    stdError: 0.0594,
    maxError: 0.571167,
    highErrorShare: 1.387,
    profile: "Lowest median readout error across the fleet.",
  },
  ibm_torino: {
    id: "ibm_torino",
    label: "Torino",
    rows: 31_451,
    qubits: 133,
    meanError: 0.044797,
    medianError: 0.029541,
    stdError: 0.053162,
    maxError: 0.53479,
    highErrorShare: 0.804,
    profile: "Shortest history; highest median error, lightest tail.",
  },
};

export const DATASET = {
  file: "quantum_readout_error_cleaned.csv",
  totalRows: 594_198,
  modellingRows: 593_900, // after excluding 298 ambiguous duplicate-timestamp rows
  usableFeatureRows: 587_890, // after lag / rolling warm-up and target requirement
  excludedWarmup: 6_010,
  series: 601,
  backends: 4,
  monitoredQubits: 156 + 156 + 156 + 133, // 601
  observationStart: "2026-01-31T17:00:00Z",
  observationEnd: "2026-10-31T16:36:11Z",
  recalTaggedRows: 11_669,
  property: "readout_error",
  columns: [
    "backend",
    "qubit_a",
    "readout_error",
    "calibrated_time",
    "observed_time",
    "calibration_age_seconds",
    "calibration_age_seconds_recomputed",
    "snapshot_update_time",
    "property",
    "property_family",
    "unit",
    "scope",
    "is_new_measurement",
    "is_failure_ceiling",
    "chipwide_recal_event_id",
  ],
  readoutError: {
    mean: 0.029312,
    median: 0.011719,
    min: 0.000488,
    max: 0.653564,
    p75: 0.023926,
    p90: 0.056396,
    p95: 0.10083,
    p99: 0.420289,
  },
  timeGapHours: {
    mean: 5.479,
    median: 3.953,
    p25: 2.893,
    p75: 5.741,
    max: 318.485,
    zeroGapRows: 149,
    over24h: 10_916,
    over168h: 130,
  },
  seriesLength: { min: 225, median: 1308, max: 1346, mean: 988.7 },
  /** Backend–qubit series whose readout error exceeded 0.30 on 100% of rows. */
  saturatedSeries: [
    { backend: "ibm_marrakesh" as BackendId, qubit: 130, meanError: 0.490837, obs: 1330 },
    { backend: "ibm_kingston" as BackendId, qubit: 146, meanError: 0.498329, obs: 967 },
    { backend: "ibm_torino" as BackendId, qubit: 53, meanError: 0.457037, obs: 235 },
  ],
  source: ["dataset", "training-notebook"] as SourceTag[],
} as const;

/** Measurement channels — only readout error exists in the supplied dataset. */
export const MEASUREMENTS = [
  {
    id: "readout_error",
    label: "Readout error",
    unit: "probability",
    available: true,
    description: "Probability of misclassifying the qubit state at measurement.",
  },
  {
    id: "t1",
    label: "T1 relaxation",
    unit: "µs",
    available: false,
    description: "Energy relaxation time. Not present in the supplied dataset.",
  },
  {
    id: "t2",
    label: "T2 dephasing",
    unit: "µs",
    available: false,
    description: "Phase coherence time. Not present in the supplied dataset.",
  },
  {
    id: "gate_error",
    label: "Gate error",
    unit: "probability",
    available: false,
    description: "Single/two-qubit gate infidelity. Not present in the supplied dataset.",
  },
] as const;

export type MeasurementId = (typeof MEASUREMENTS)[number]["id"];

/* ------------------------------------------------------------------ */
/* Feature schema (handover experiment)                                */
/* ------------------------------------------------------------------ */

export interface FeatureSpec {
  name: string;
  group: "state" | "lag" | "rolling" | "temporal" | "change" | "calibration" | "categorical";
  definition: string;
  /** Pearson r with target_next_error where the notebook reported it. */
  correlation?: number | "negligible";
}

export const FEATURE_SPECS: FeatureSpec[] = [
  { name: "current_error", group: "state", definition: "Readout error at prediction time", correlation: 0.86 },
  { name: "lag_1", group: "lag", definition: "Previous observation in the same series", correlation: 0.86 },
  { name: "lag_2", group: "lag", definition: "Two observations earlier", correlation: 0.86 },
  { name: "lag_3", group: "lag", definition: "Three observations earlier" },
  { name: "lag_5", group: "lag", definition: "Five observations earlier" },
  { name: "rolling_mean_3", group: "rolling", definition: "Mean of current + previous 2" },
  { name: "rolling_std_3", group: "rolling", definition: "Sample std of that 3-window" },
  { name: "rolling_mean_5", group: "rolling", definition: "Mean of current + previous 4" },
  { name: "rolling_std_5", group: "rolling", definition: "Sample std of that 5-window" },
  { name: "rolling_mean_10", group: "rolling", definition: "Mean of current + previous 9" },
  { name: "rolling_std_10", group: "rolling", definition: "Sample std of that 10-window" },
  { name: "time_gap_hours", group: "temporal", definition: "Hours since previous observation" },
  { name: "error_change", group: "change", definition: "current_error − lag_1" },
  { name: "error_change_rate", group: "change", definition: "error_change ÷ time_gap_hours" },
  {
    name: "calibration_age_seconds",
    group: "calibration",
    definition: "Age of the calibration record at observation",
    correlation: "negligible",
  },
  { name: "backend", group: "categorical", definition: "Processor identifier (one-hot in pipeline)" },
  { name: "qubit_a", group: "categorical", definition: "Qubit index (one-hot in pipeline)" },
];

/* ------------------------------------------------------------------ */
/* Experiment A — handover run (Models_training.ipynb)                 */
/* ------------------------------------------------------------------ */

export interface LeaderboardRow extends EvaluationMetrics {
  model: string;
  status: "Tuned" | "Original" | "Baseline";
  modelId?: ModelId;
  observations?: number;
  predictionSeconds?: number;
}

export const EXPERIMENT_HANDOVER = {
  id: "handover",
  title: "Handover experiment",
  notebook: "Models_training.ipynb",
  source: "training-notebook" as SourceTag,
  datasetRows: 593_900,
  featureRows: 587_890,
  featureCount: 17,
  split: {
    strategy: "Per-series chronological 70 / 15 / 15 (no shuffling)",
    train: 411_204,
    validation: 88_208,
    test: 88_478,
  },
  validation: [
    { model: "Tuned Random Forest", status: "Tuned", modelId: "random_forest", mae: 0.008712, rmse: 0.026254, r2: 0.811788 },
    { model: "Linear Regression", status: "Original", mae: 0.008743, rmse: 0.026294, r2: 0.811217 },
    { model: "Original Random Forest", status: "Original", mae: 0.008733, rmse: 0.026322, r2: 0.810805 },
    { model: "LSTM", status: "Original", mae: 0.00871, rmse: 0.026404, r2: 0.809632 },
    { model: "Tuned LightGBM", status: "Tuned", modelId: "lightgbm", mae: 0.008976, rmse: 0.027528, r2: 0.793083 },
    { model: "Original LightGBM", status: "Original", mae: 0.009064, rmse: 0.028134, r2: 0.783867 },
    { model: "Persistence baseline", status: "Baseline", mae: 0.013202, rmse: 0.043243, r2: 0.654033 },
  ] as LeaderboardRow[],
  test: [
    { model: "Tuned LightGBM", status: "Tuned", modelId: "lightgbm", observations: 88_478, mae: 0.012619, rmse: 0.038324, r2: 0.72827, predictionSeconds: 0.738 },
    { model: "Tuned Random Forest", status: "Tuned", modelId: "random_forest", observations: 88_478, mae: 0.01258, rmse: 0.038338, r2: 0.728073, predictionSeconds: 0.357 },
    { model: "Original Random Forest", status: "Original", observations: 88_478, mae: 0.012742, rmse: 0.038668, r2: 0.723371, predictionSeconds: 0.671 },
    { model: "Original LightGBM", status: "Original", observations: 88_478, mae: 0.012556, rmse: 0.038733, r2: 0.722432, predictionSeconds: 1.676 },
    { model: "Linear Regression", status: "Original", observations: 88_478, mae: 0.01316, rmse: 0.040126, r2: 0.702106, predictionSeconds: 0.549 },
    { model: "Persistence baseline", status: "Baseline", observations: 88_478, mae: 0.013202, rmse: 0.043243, r2: 0.654033, predictionSeconds: 0 },
    { model: "LSTM (corrected)", status: "Original", observations: 88_478, mae: 0.014412, rmse: 0.044462, r2: 0.634253, predictionSeconds: 1.31 },
  ] as LeaderboardRow[],
  /** Linear-regression validation MAE per backend (the only per-backend table in this run). */
  perBackendValidation: [
    { backend: "ibm_fez" as BackendId, observations: 30_813, mae: 0.005362, rmse: 0.017389, r2: 0.776106 },
    { backend: "ibm_kingston" as BackendId, observations: 22_187, mae: 0.006113, rmse: 0.018396, r2: 0.894301 },
    { backend: "ibm_marrakesh" as BackendId, observations: 30_701, mae: 0.014509, rmse: 0.037761, r2: 0.774521 },
    { backend: "ibm_torino" as BackendId, observations: 4_507, mae: 0.005542, rmse: 0.009211, r2: 0.96588 },
  ],
  perBackendModel: "Linear Regression (validation split)",
  tuning: {
    lightgbm: [
      { config: 1, n_estimators: 300, learning_rate: 0.03, num_leaves: 15, max_depth: -1, reg_lambda: 1.0, mae: 0.008976, rmse: 0.027528, r2: 0.793083, seconds: 19.66 },
      { config: 8, n_estimators: 700, learning_rate: 0.03, num_leaves: 15, max_depth: 8, reg_lambda: 1.0, mae: 0.008963, rmse: 0.027868, r2: 0.787938, seconds: 21.23 },
      { config: 7, n_estimators: 500, learning_rate: 0.02, num_leaves: 31, max_depth: 12, reg_lambda: 3.0, mae: 0.009001, rmse: 0.027907, r2: 0.787343, seconds: 16.96 },
      { config: 6, n_estimators: 300, learning_rate: 0.08, num_leaves: 31, max_depth: 8, reg_lambda: 0.5, mae: 0.008962, rmse: 0.027992, r2: 0.786041, seconds: 11.16 },
      { config: 4, n_estimators: 500, learning_rate: 0.05, num_leaves: 15, max_depth: 8, reg_lambda: 2.0, mae: 0.009001, rmse: 0.028008, r2: 0.785799, seconds: 13.94 },
      { config: 2, n_estimators: 500, learning_rate: 0.05, num_leaves: 31, max_depth: -1, reg_lambda: 1.0, mae: 0.009064, rmse: 0.028134, r2: 0.783867, seconds: 15.06 },
      { config: 3, n_estimators: 700, learning_rate: 0.03, num_leaves: 31, max_depth: -1, reg_lambda: 2.0, mae: 0.009072, rmse: 0.028257, r2: 0.781971, seconds: 22.62 },
      { config: 5, n_estimators: 700, learning_rate: 0.05, num_leaves: 63, max_depth: -1, reg_lambda: 2.0, mae: 0.009136, rmse: 0.028442, r2: 0.779111, seconds: 24.4 },
    ],
    randomForest: [
      { config: 1, n_estimators: 20, max_depth: 8, min_samples_leaf: 10, max_features: 0.5, mae: 0.008712, rmse: 0.026254, r2: 0.811788, seconds: 66.9 },
      { config: 4, n_estimators: 20, max_depth: null, min_samples_leaf: 20, max_features: 0.5, mae: 0.008762, rmse: 0.026311, r2: 0.810975, seconds: 648.54 },
      { config: 2, n_estimators: 20, max_depth: 12, min_samples_leaf: 10, max_features: 0.5, mae: 0.00874, rmse: 0.026347, r2: 0.810448, seconds: 130.4 },
      { config: 3, n_estimators: 20, max_depth: 16, min_samples_leaf: 20, max_features: 0.75, mae: 0.008749, rmse: 0.0264, r2: 0.809689, seconds: 330.24 },
    ],
  },
  correlationNotes: [
    "current_error, lag_1 and lag_2 correlate with the next error at r ≈ 0.86.",
    "Rolling means act as smoothed baselines and correlate strongly with the target.",
    "calibration_age_seconds shows negligible linear correlation with the next error.",
  ],
};

/* ------------------------------------------------------------------ */
/* Experiment B — XGBoost run (ML_UANTUM_PBL_REG_XGB.ipynb)            */
/* ------------------------------------------------------------------ */

export const EXPERIMENT_XGB = {
  id: "xgb",
  title: "XGBoost experiment",
  notebook: "ML_UANTUM_PBL_REG_XGB.ipynb",
  source: "xgb-notebook" as SourceTag,
  datasetRows: 254_041, // rows with parseable timestamps in that run
  featureRows: 250_435,
  featureCount: 10,
  encodedColumns: 168,
  features: [
    "backend",
    "qubit_a",
    "calibration_age_seconds",
    "lag_1",
    "lag_2",
    "lag_3",
    "lag_5",
    "rolling_mean_5",
    "rolling_std_5",
    "error_change (lag_1 − lag_2)",
  ],
  split: {
    strategy: "Global chronological cut on target_time 70 / 15 / 15",
    train: 165_993,
    validation: 38_714,
    test: 45_728,
    trainEnds: "2026-04-18T22:48:22Z",
    validationEnds: "2026-05-03T17:21:23Z",
  },
  validation: [
    { model: "Tuned XGBoost", status: "Tuned", modelId: "xgboost", mae: 0.007765, rmse: 0.02239, r2: 0.873216 },
    { model: "XGBoost", status: "Original", mae: 0.007848, rmse: 0.022775, r2: 0.868815 },
    { model: "Linear Regression", status: "Original", mae: 0.007866, rmse: 0.022524, r2: 0.871687 },
    { model: "Persistence baseline", status: "Baseline", mae: 0.009594, rmse: 0.029322, r2: 0.782543 },
  ] as LeaderboardRow[],
  /** Final model refit on train+validation, evaluated once on the held-out test window. */
  finalTest: { model: "Tuned XGBoost", mae: 0.00853, rmse: 0.024727, r2: 0.842104, observations: 45_728 },
  perBackendTest: [
    { backend: "ibm_fez" as BackendId, mae: 0.00668, rmse: 0.020744, r2: 0.844567 },
    { backend: "ibm_kingston" as BackendId, mae: 0.005899, rmse: 0.015969, r2: 0.938763 },
    { backend: "ibm_marrakesh" as BackendId, mae: 0.012647, rmse: 0.033188, r2: 0.764321 },
  ],
  perBackendNote: "ibm_torino had no rows in this run's test window.",
  searchSpace: {
    n_estimators: [200, 300, 500],
    max_depth: [3, 5, 7],
    learning_rate: [0.01, 0.05, 0.1],
    subsample: [0.7, 0.8, 1.0],
    colsample_bytree: [0.7, 0.8, 1.0],
    iterations: 6,
    cv: "3 expanding time folds",
  },
};

/* ------------------------------------------------------------------ */
/* Model registry                                                      */
/* ------------------------------------------------------------------ */

export interface ModelCard {
  id: ModelId;
  name: string;
  family: string;
  role: string;
  artifact: string;
  experiment: "handover" | "xgb";
  pipeline: string;
  hyperparameters: Record<string, string | number>;
  /** Validation metrics from the model's own experiment. */
  validation: EvaluationMetrics;
  /** Test metrics from the model's own experiment. */
  test: EvaluationMetrics & { observations: number };
  featureCount: number;
  notes: string[];
  accent: "cyan" | "violet" | "amber";
}

export const MODELS: Record<ModelId, ModelCard> = {
  lightgbm: {
    id: "lightgbm",
    name: "Tuned LightGBM",
    family: "Gradient-boosted trees",
    role: "Primary integration model (team selection)",
    artifact: "tuned_lightgbm_model.joblib",
    experiment: "handover",
    pipeline: "sklearn Pipeline → ColumnTransformer(passthrough numeric, OneHotEncoder backend/qubit_a) → LGBMRegressor",
    hyperparameters: {
      n_estimators: 300,
      learning_rate: 0.03,
      num_leaves: 15,
      reg_lambda: 1.0,
      subsample: 0.8,
      colsample_bytree: 0.8,
      random_state: 42,
      n_jobs: 2,
    },
    validation: { mae: 0.008976, rmse: 0.027528, r2: 0.793083 },
    test: { mae: 0.012619, rmse: 0.038324, r2: 0.72827, observations: 88_478 },
    featureCount: 17,
    notes: [
      "Selected as the primary model for integration; this is a deployment decision, not a validation win.",
      "Fastest tuned configuration in the LightGBM search (≈20 s training).",
    ],
    accent: "cyan",
  },
  random_forest: {
    id: "random_forest",
    name: "Tuned Random Forest",
    family: "Bagged decision trees",
    role: "Alternative model (best validation RMSE / R²)",
    artifact: "tuned_random_forest_model.joblib · final_quantum_model.joblib",
    experiment: "handover",
    pipeline: "sklearn Pipeline → ColumnTransformer(passthrough numeric, OneHotEncoder backend/qubit_a) → RandomForestRegressor",
    hyperparameters: {
      n_estimators: 20,
      max_depth: 8,
      max_features: 0.5,
      min_samples_leaf: 10,
      random_state: 42,
      n_jobs: 2,
    },
    validation: { mae: 0.008712, rmse: 0.026254, r2: 0.811788 },
    test: { mae: 0.01258, rmse: 0.038338, r2: 0.728073, observations: 88_478 },
    featureCount: 17,
    notes: [
      "Lowest RMSE and highest R² on the handover validation leaderboard.",
      "Exported a second time as final_quantum_model.joblib (identical pipeline).",
    ],
    accent: "violet",
  },
  xgboost: {
    id: "xgboost",
    name: "Tuned XGBoost",
    family: "Gradient-boosted trees",
    role: "Separate experiment — not part of the handover package",
    artifact: "xgboost_model.pkl",
    experiment: "xgb",
    pipeline: "pd.get_dummies(backend, qubit_a) → 168 columns → XGBRegressor(reg:squarederror)",
    hyperparameters: {
      n_estimators: 500,
      max_depth: 7,
      learning_rate: 0.01,
      subsample: 0.7,
      colsample_bytree: 0.7,
      random_state: 42,
    },
    validation: { mae: 0.007765, rmse: 0.02239, r2: 0.873216 },
    test: { mae: 0.00853, rmse: 0.024727, r2: 0.842104, observations: 45_728 },
    featureCount: 10,
    notes: [
      "Trained on a 254,041-row dataset version with a global time cut; not comparable with handover metrics.",
      "Uses lag_1 − lag_2 as error_change and excludes current_error from the input vector.",
    ],
    accent: "amber",
  },
};

export const PREDICTION_FRAMING = {
  headline: "Predictions target the next recorded observation.",
  body:
    "Each prediction estimates the readout error that will appear in the next calibration record for a backend–qubit series. " +
    "The interval until that record varies (median ≈ 3.95 h, up to 318 h), so this is not a fixed-horizon forecast.",
  cautions: [
    "Model outputs are regression values and are not clipped to [0, 1].",
    "Features must be computed only from observations at or before prediction time.",
    "target_next_error and target_gap_hours are never passed to the model.",
  ],
};
