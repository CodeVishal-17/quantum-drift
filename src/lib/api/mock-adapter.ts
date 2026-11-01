/**
 * Mock adapter — serves seeded DEMO DATA with simulated latency.
 * Pagination, filtering and sorting happen here so the UI never holds the
 * full dataset; the same query shape is sent to the HTTP adapter later.
 */

import { BACKENDS, type ModelFeatureVector, type ModelId, type ObservationQuery, type ObservationRow, type Paginated } from "../types";
import {
  DEMO_QUBITS,
  demoDriftEvents,
  demoObservationRows,
  demoPredictions,
  demoRecalEvents,
  demoSeries,
} from "../demo/generator";
import type { QubitWatchApi } from "./contract";
import { BACKEND_META } from "../research";

const latency = (ms = 120) => new Promise<void>((r) => setTimeout(r, ms));

function applyQuery(rows: ObservationRow[], q: ObservationQuery): Paginated<ObservationRow> {
  let out = rows;
  if (q.backend && q.backend !== "all") out = out.filter((r) => r.backend === q.backend);
  if (q.qubit !== undefined && q.qubit !== null) out = out.filter((r) => r.qubit_a === q.qubit);
  if (q.recalOnly) out = out.filter((r) => r.chipwide_recal_event_id !== null);
  if (q.minError !== undefined && q.minError !== null) out = out.filter((r) => r.readout_error >= q.minError!);
  if (q.maxError !== undefined && q.maxError !== null) out = out.filter((r) => r.readout_error <= q.maxError!);
  if (q.from) {
    const f = Date.parse(q.from);
    if (!Number.isNaN(f)) out = out.filter((r) => Date.parse(r.observed_time) >= f);
  }
  if (q.to) {
    const t = Date.parse(q.to);
    if (!Number.isNaN(t)) out = out.filter((r) => Date.parse(r.observed_time) <= t);
  }
  if (q.search && q.search.trim()) {
    const s = q.search.trim().toLowerCase();
    out = out.filter(
      (r) =>
        r.backend.includes(s) ||
        String(r.qubit_a) === s ||
        r.observed_time.toLowerCase().includes(s) ||
        (r.chipwide_recal_event_id ?? "").toLowerCase().includes(s) ||
        r.readout_error.toString().startsWith(s),
    );
  }

  const sortBy = q.sortBy ?? "observed_time";
  const dir = q.sortDir === "asc" ? 1 : -1;
  out = [...out].sort((a, b) => {
    const av = a[sortBy];
    const bv = b[sortBy];
    if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
    return String(av).localeCompare(String(bv)) * dir;
  });

  const pageSize = Math.min(Math.max(q.pageSize ?? 25, 5), 200);
  const totalPages = Math.max(1, Math.ceil(out.length / pageSize));
  const page = Math.min(Math.max(q.page ?? 1, 1), totalPages);
  const start = (page - 1) * pageSize;
  return { items: out.slice(start, start + pageSize), page, pageSize, total: out.length, totalPages };
}

export const mockAdapter: QubitWatchApi = {
  mode: "demo",

  async listBackends() {
    await latency(80);
    return BACKENDS.map((id) => {
      const q = DEMO_QUBITS[id][0];
      const s = demoSeries(id, q);
      return {
        id,
        qubitsMonitored: BACKEND_META[id].qubits,
        demoQubits: DEMO_QUBITS[id],
        latest: s[s.length - 1] ?? null,
        recalEvents: demoRecalEvents(id).length,
      };
    });
  },

  async getSeries({ backend, qubit, from, to }) {
    await latency();
    let s = demoSeries(backend, qubit);
    if (from !== undefined) s = s.filter((p) => p.t >= from);
    if (to !== undefined) s = s.filter((p) => p.t <= to);
    return s;
  },

  async getPredictions({ backend, qubit, model }) {
    await latency(140);
    return demoPredictions(backend, qubit, model);
  },

  async getDriftEvents({ backend, qubit }) {
    await latency(100);
    return demoDriftEvents(backend, qubit ?? null);
  },

  async queryObservations(query) {
    await latency(160);
    return applyQuery(demoObservationRows(), query);
  },

  async getObservation(id) {
    await latency(60);
    return demoObservationRows().find((r) => r.id === id) ?? null;
  },

  async predict(features: ModelFeatureVector, model: ModelId) {
    await latency(200);
    // Illustrative placeholder: blends the current value with the 5-window mean.
    const value = 0.65 * features.current_error + 0.35 * features.rolling_mean_5;
    return {
      predicted_next_error: Math.round(value * 1e6) / 1e6,
      model,
      issued_at: new Date().toISOString(),
      provenance: "demo",
    };
  },
};
