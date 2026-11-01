/**
 * QubitWatch — deterministic DEMO DATA generator.
 *
 * Everything produced here is synthetic. It exists so that chart layouts,
 * tables and interaction states can be demonstrated without a backend.
 * Values are seeded and reproducible, shaped to resemble the statistical
 * profile documented in the research notebooks (median error ≈ 0.012,
 * ~4 h observation cadence, chip-wide recalibration events), but they are
 * NOT IBM measurements and NOT outputs of the trained models.
 */

import { BACKENDS, type BackendId, type DriftEvent, type ModelId, type ObservationRow, type PredictionRecord, type SeriesPoint } from "../types";

/* ------------------------------------------------------------------ */
/* Seeded PRNG                                                         */
/* ------------------------------------------------------------------ */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function gaussian(rng: () => number) {
  const u = Math.max(rng(), 1e-12);
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/* ------------------------------------------------------------------ */
/* Demo configuration                                                  */
/* ------------------------------------------------------------------ */

export const DEMO_WINDOW_START = Date.UTC(2026, 9, 1, 0, 0, 0); // 2026-10-01
export const DEMO_POINTS = 150;

/** Subset of qubit indices rendered in the demo for each backend. */
export const DEMO_QUBITS: Record<BackendId, number[]> = {
  ibm_fez: [0, 1, 2, 5, 11, 17, 23, 34, 46, 58, 72, 83, 99, 114, 131, 149],
  ibm_marrakesh: [0, 3, 9, 14, 27, 37, 45, 58, 64, 76, 82, 94, 103, 113, 130, 150],
  ibm_kingston: [0, 4, 12, 16, 29, 41, 55, 63, 82, 96, 108, 112, 121, 133, 146, 152],
  ibm_torino: [0, 1, 7, 13, 19, 26, 32, 44, 53, 61, 70, 88, 97, 104, 116, 128],
};

const BACKEND_BASE: Record<BackendId, { median: number; spread: number; cadence: number }> = {
  ibm_fez: { median: 0.0122, spread: 0.55, cadence: 3.9 },
  ibm_marrakesh: { median: 0.012, spread: 0.7, cadence: 4.1 },
  ibm_kingston: { median: 0.0093, spread: 0.5, cadence: 4.6 },
  ibm_torino: { median: 0.0295, spread: 0.4, cadence: 7.5 },
};

/* ------------------------------------------------------------------ */
/* Chip-wide recalibration events (confirmed, per backend)             */
/* ------------------------------------------------------------------ */

export interface RecalEvent {
  id: string;
  backend: BackendId;
  t: number;
  shift: number; // multiplicative baseline shift applied after the event
}

const recalCache = new Map<BackendId, RecalEvent[]>();

export function demoRecalEvents(backend: BackendId): RecalEvent[] {
  const cached = recalCache.get(backend);
  if (cached) return cached;
  const rng = mulberry32(hashString(`recal:${backend}`));
  const count = 4 + Math.floor(rng() * 3);
  const events: RecalEvent[] = [];
  let t = DEMO_WINDOW_START + (2 + rng() * 3) * 86_400_000;
  for (let i = 0; i < count; i++) {
    const d = new Date(t);
    const stamp = d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
    events.push({
      id: `${backend}__chipwide__${stamp}`,
      backend,
      t,
      shift: 0.75 + rng() * 0.5,
    });
    t += (3 + rng() * 5) * 86_400_000;
  }
  recalCache.set(backend, events);
  return events;
}

/* ------------------------------------------------------------------ */
/* Series                                                              */
/* ------------------------------------------------------------------ */

const seriesCache = new Map<string, SeriesPoint[]>();

export function demoSeries(backend: BackendId, qubit: number): SeriesPoint[] {
  const key = `${backend}:${qubit}`;
  const cached = seriesCache.get(key);
  if (cached) return cached;

  const rng = mulberry32(hashString(`series:${key}`));
  const base = BACKEND_BASE[backend];
  const recals = demoRecalEvents(backend);

  // Per-qubit baseline drawn log-normally around the backend median.
  let baseline = base.median * Math.exp(gaussian(rng) * base.spread);
  // A handful of demo qubits sit in the high-error regime, like the real tail.
  if (rng() < 0.08) baseline = 0.25 + rng() * 0.25;

  const sigma = Math.max(0.0006, baseline * 0.12);
  const phi = 0.82; // AR(1) persistence
  let eps = 0;
  let t = DEMO_WINDOW_START + rng() * 3_600_000;
  const anomalyAt = 40 + Math.floor(rng() * 90);
  const points: SeriesPoint[] = [];
  let recalIndex = 0;
  let prevT: number | null = null;

  for (let i = 0; i < DEMO_POINTS; i++) {
    // Cadence: lognormal around the backend's cadence, occasional long gaps.
    let gapH = base.cadence * Math.exp(gaussian(rng) * 0.28);
    if (rng() < 0.03) gapH *= 3 + rng() * 4;
    t += gapH * 3_600_000;

    // Apply any recalibration event crossed since the last observation.
    let recalId: string | null = null;
    while (recalIndex < recals.length && recals[recalIndex].t <= t) {
      baseline *= recals[recalIndex].shift;
      recalId = recals[recalIndex].id;
      recalIndex++;
    }

    // Slow drift between recalibrations.
    baseline *= 1 + 0.0025 * gaussian(rng) + 0.0012;

    eps = phi * eps + sigma * gaussian(rng);
    let value = baseline + eps;
    if (i === anomalyAt) value += baseline * (1.2 + rng());
    if (i === anomalyAt + 1) value += baseline * 0.4;
    value = Math.min(0.7, Math.max(0.0005, value));

    const calAge = recalId ? 300 + rng() * 2_000 : 900 + Math.abs(gaussian(rng)) * 6_000;
    points.push({
      t,
      observed_time: new Date(t).toISOString(),
      readout_error: round6(value),
      calibration_age_seconds: Math.round(calAge),
      time_gap_hours: prevT === null ? null : round3((t - prevT) / 3_600_000),
      recal_event_id: recalId,
    });
    prevT = t;
  }

  seriesCache.set(key, points);
  return points;
}

/* ------------------------------------------------------------------ */
/* Predictions (DEMO — not model output)                               */
/* ------------------------------------------------------------------ */

const MODEL_BIAS: Record<ModelId, { smooth: number; noise: number }> = {
  lightgbm: { smooth: 0.35, noise: 0.08 },
  random_forest: { smooth: 0.45, noise: 0.07 },
  xgboost: { smooth: 0.3, noise: 0.09 },
};

const predCache = new Map<string, PredictionRecord[]>();

/**
 * Produces an illustrative actual-vs-predicted sequence. The "prediction"
 * is a seeded blend of the current value and a rolling mean with noise.
 * It is a placeholder for the real pipeline output.
 */
export function demoPredictions(backend: BackendId, qubit: number, model: ModelId): PredictionRecord[] {
  const key = `${backend}:${qubit}:${model}`;
  const cached = predCache.get(key);
  if (cached) return cached;

  const rng = mulberry32(hashString(`pred:${key}`));
  const series = demoSeries(backend, qubit);
  const { smooth, noise } = MODEL_BIAS[model];
  const out: PredictionRecord[] = [];

  for (let i = 10; i < series.length; i++) {
    const cur = series[i];
    const window = series.slice(i - 4, i + 1).map((p) => p.readout_error);
    const mean5 = window.reduce((a, b) => a + b, 0) / window.length;
    const next = series[i + 1] ?? null;
    const sd = Math.sqrt(window.reduce((a, b) => a + (b - mean5) ** 2, 0) / (window.length - 1));
    const predicted = round6(
      Math.max(0.0005, (1 - smooth) * cur.readout_error + smooth * mean5 + gaussian(rng) * sd * noise * 2),
    );
    const targetT = next ? next.t : cur.t + 4 * 3_600_000;
    out.push({
      t: targetT,
      issued_at: cur.observed_time,
      target_time: next ? next.observed_time : new Date(targetT).toISOString(),
      target_gap_hours: round3((targetT - cur.t) / 3_600_000),
      actual: next ? next.readout_error : null,
      predicted,
      residual: next ? round6(next.readout_error - predicted) : null,
      model,
      backend,
      qubit_a: qubit,
    });
  }
  predCache.set(key, out);
  return out;
}

/* ------------------------------------------------------------------ */
/* Drift events                                                        */
/* ------------------------------------------------------------------ */

export function demoDriftEvents(backend: BackendId, qubit: number | null): DriftEvent[] {
  const events: DriftEvent[] = [];
  for (const r of demoRecalEvents(backend)) {
    events.push({
      id: r.id,
      kind: "confirmed_recalibration",
      backend,
      qubit_a: null,
      t: r.t,
      time: new Date(r.t).toISOString(),
      magnitude: Math.abs(1 - r.shift),
      note: "Chip-wide recalibration tagged in source data (chipwide_recal_event_id).",
    });
  }
  const qubits = qubit === null ? DEMO_QUBITS[backend] : [qubit];
  for (const q of qubits) {
    const s = demoSeries(backend, q);
    for (let i = 10; i < s.length; i++) {
      if (s[i].recal_event_id) continue;
      const win = s.slice(i - 10, i).map((p) => p.readout_error);
      const mean = win.reduce((a, b) => a + b, 0) / win.length;
      const sd = Math.sqrt(win.reduce((a, b) => a + (b - mean) ** 2, 0) / (win.length - 1)) || 1e-6;
      const z = (s[i].readout_error - mean) / sd;
      if (Math.abs(z) > 3.2) {
        events.push({
          id: `${backend}:${q}:${s[i].t}`,
          kind: "detected_anomaly",
          backend,
          qubit_a: q,
          t: s[i].t,
          time: s[i].observed_time,
          magnitude: round3(Math.abs(z)),
          note: `Rolling z-score ${z.toFixed(1)}σ against the previous 10 observations (statistical screen, unconfirmed).`,
        });
      }
    }
  }
  return events.sort((a, b) => a.t - b.t);
}

/* ------------------------------------------------------------------ */
/* Dataset explorer rows                                               */
/* ------------------------------------------------------------------ */

let rowsCache: ObservationRow[] | null = null;

export function demoObservationRows(): ObservationRow[] {
  if (rowsCache) return rowsCache;
  const rows: ObservationRow[] = [];
  for (const backend of BACKENDS) {
    for (const q of DEMO_QUBITS[backend]) {
      const s = demoSeries(backend, q);
      s.forEach((p, i) => {
        const calibrated = new Date(p.t - p.calibration_age_seconds * 1000);
        rows.push({
          id: `${backend}-${q}-${i}`,
          backend,
          qubit_a: q,
          readout_error: p.readout_error,
          calibrated_time: calibrated.toISOString(),
          observed_time: p.observed_time,
          calibration_age_seconds: p.calibration_age_seconds,
          snapshot_update_time: i % 7 === 3 ? null : new Date(p.t - 60_000 * (1 + (i % 9))).toISOString(),
          property: "readout_error",
          property_family: "readout_error",
          scope: "qubit",
          is_new_measurement: true,
          is_failure_ceiling: false,
          chipwide_recal_event_id: p.recal_event_id,
        });
      });
    }
  }
  rowsCache = rows;
  return rows;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export function round6(n: number) {
  return Math.round(n * 1e6) / 1e6;
}
export function round3(n: number) {
  return Math.round(n * 1e3) / 1e3;
}

export function rollingStd(values: number[], window: number): (number | null)[] {
  return values.map((_, i) => {
    if (i + 1 < window) return null;
    const w = values.slice(i + 1 - window, i + 1);
    const m = w.reduce((a, b) => a + b, 0) / w.length;
    return Math.sqrt(w.reduce((a, b) => a + (b - m) ** 2, 0) / (w.length - 1));
  });
}

export function rollingMean(values: number[], window: number): (number | null)[] {
  return values.map((_, i) => {
    if (i + 1 < window) return null;
    const w = values.slice(i + 1 - window, i + 1);
    return w.reduce((a, b) => a + b, 0) / w.length;
  });
}
