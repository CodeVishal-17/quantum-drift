/**
 * HTTP adapter — thin fetch wrapper for a future Python inference service
 * that loads the handover pipelines. Activated by NEXT_PUBLIC_QUBITWATCH_API_URL.
 */

import type { PredictResponse, QubitWatchApi } from "./contract";

export function createHttpAdapter(base: string): QubitWatchApi {
  return {
    mode: "http",
    async predict(req) {
      const res = await fetch(new URL("/api/v1/predict", base).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(req),
      });
      if (!res.ok) throw new Error(`Prediction service responded ${res.status}`);
      return (await res.json()) as PredictResponse;
    },
  };
}
