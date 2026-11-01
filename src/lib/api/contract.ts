/**
 * Frontend ↔ prediction-service contract.
 *
 * The browser never runs a model. It assembles the documented feature vector
 * from recorded observations and asks a service for the next-record estimate.
 * Until that service exists the demo adapter answers with a clearly labelled
 * placeholder derived from the research's persistence baseline.
 */

import type { ModelFeatureVector, ModelId } from "../types";

export interface PredictRequest {
  model: ModelId;
  features: ModelFeatureVector;
  /** observed_time of the record the features were computed at. */
  issued_at: string;
}

export interface PredictResponse {
  model: ModelId;
  issued_at: string;
  predicted_next_error: number;
  /**
   * "model"                — output of the trained pipeline (live service).
   * "persistence_baseline" — placeholder: next = current, the documented
   *                          baseline from the research. DEMO DATA, not a
   *                          model prediction.
   */
  provenance: "model" | "persistence_baseline";
}

export interface QubitWatchApi {
  mode: "demo" | "http";
  predict(req: PredictRequest): Promise<PredictResponse>;
}
