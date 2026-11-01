import type { QubitWatchApi } from "./contract";

/**
 * Demo adapter used when no prediction service is configured.
 *
 * It does NOT fabricate a model output. It returns the persistence baseline
 * (next observation = current observation), which is the reference baseline
 * reported in both experiments, and flags it as such so the UI labels it
 * DEMO DATA.
 */
export const mockAdapter: QubitWatchApi = {
  mode: "demo",
  async predict(req) {
    await new Promise((r) => setTimeout(r, 450));
    return {
      model: req.model,
      issued_at: req.issued_at,
      predicted_next_error: req.features.current_error,
      provenance: "persistence_baseline",
    };
  },
};
