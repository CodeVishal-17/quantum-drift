import type { QubitWatchApi } from "./contract";
import { createHttpAdapter } from "./http-adapter";
import { mockAdapter } from "./mock-adapter";

const base = process.env.NEXT_PUBLIC_QUBITWATCH_API_URL;

/** The single API entry point used by every component. */
export const api: QubitWatchApi = base ? createHttpAdapter(base) : mockAdapter;

export type { BackendSummary, PredictResponse, QubitWatchApi } from "./contract";
