/**
 * HTTP adapter — thin fetch wrapper for the future inference service.
 * Activated by setting NEXT_PUBLIC_QUBITWATCH_API_URL. Not used in this phase.
 */

import type { ModelFeatureVector, ModelId } from "../types";
import type { QubitWatchApi } from "./contract";

async function getJson<T>(base: string, path: string, params?: Record<string, unknown>): Promise<T> {
  const url = new URL(path, base);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    }
  }
  const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`QubitWatch API ${res.status}: ${url.pathname}`);
  return (await res.json()) as T;
}

export function createHttpAdapter(base: string): QubitWatchApi {
  return {
    mode: "live",
    listBackends: () => getJson(base, "/api/v1/backends"),
    getSeries: (p) => getJson(base, "/api/v1/series", p),
    getPredictions: (p) => getJson(base, "/api/v1/predictions", p),
    getDriftEvents: (p) => getJson(base, "/api/v1/drift-events", p),
    queryObservations: (q) => getJson(base, "/api/v1/observations", q as Record<string, unknown>),
    getObservation: (id) => getJson(base, `/api/v1/observations/${encodeURIComponent(id)}`),
    async predict(features: ModelFeatureVector, model: ModelId) {
      const res = await fetch(new URL("/api/v1/predict", base).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ features, model }),
      });
      if (!res.ok) throw new Error(`QubitWatch API ${res.status}: /api/v1/predict`);
      return res.json();
    },
  };
}
