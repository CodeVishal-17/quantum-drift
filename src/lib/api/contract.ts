/**
 * QubitWatch — API contract.
 *
 * The frontend talks to a single `QubitWatchApi` interface. Today the only
 * implementation is `mockAdapter` (seeded DEMO DATA). A later phase swaps in
 * `httpAdapter`, which calls the documented endpoints below against the
 * Python inference service. No component imports an adapter directly.
 *
 *   GET  /api/v1/backends                               → BackendSummary[]
 *   GET  /api/v1/series?backend&qubit&from&to           → SeriesPoint[]
 *   GET  /api/v1/predictions?backend&qubit&model        → PredictionRecord[]
 *   GET  /api/v1/drift-events?backend&qubit             → DriftEvent[]
 *   GET  /api/v1/observations?<ObservationQuery>        → Paginated<ObservationRow>
 *   GET  /api/v1/observations/:id                       → ObservationRow
 *   POST /api/v1/predict  { features: ModelFeatureVector, model: ModelId }
 *                                                       → { predicted_next_error: number }
 */

import type {
  BackendId,
  DriftEvent,
  ModelFeatureVector,
  ModelId,
  ObservationQuery,
  ObservationRow,
  Paginated,
  PredictionRecord,
  SeriesPoint,
} from "../types";

export interface BackendSummary {
  id: BackendId;
  qubitsMonitored: number;
  demoQubits: number[];
  latest: SeriesPoint | null;
  recalEvents: number;
}

export interface PredictResponse {
  predicted_next_error: number;
  model: ModelId;
  issued_at: string;
  /** "demo" until a real inference service is connected. */
  provenance: "demo" | "model";
}

export interface QubitWatchApi {
  readonly mode: "demo" | "live";
  listBackends(): Promise<BackendSummary[]>;
  getSeries(params: { backend: BackendId; qubit: number; from?: number; to?: number }): Promise<SeriesPoint[]>;
  getPredictions(params: { backend: BackendId; qubit: number; model: ModelId }): Promise<PredictionRecord[]>;
  getDriftEvents(params: { backend: BackendId; qubit?: number | null }): Promise<DriftEvent[]>;
  queryObservations(query: ObservationQuery): Promise<Paginated<ObservationRow>>;
  getObservation(id: string): Promise<ObservationRow | null>;
  predict(features: ModelFeatureVector, model: ModelId): Promise<PredictResponse>;
}
