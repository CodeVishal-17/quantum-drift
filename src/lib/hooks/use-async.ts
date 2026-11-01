"use client";

import { useEffect, useRef, useState } from "react";

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Minimal async loader keyed on `deps`. Ignores stale responses when the
 * inputs change before a previous request resolves.
 */
export function useAsync<T>(fn: () => Promise<T>, deps: readonly unknown[]): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null });
  const seq = useRef(0);

  useEffect(() => {
    const id = ++seq.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    fn().then(
      (data) => {
        if (seq.current === id) setState({ data, loading: false, error: null });
      },
      (error: unknown) => {
        if (seq.current === id)
          setState({ data: null, loading: false, error: error instanceof Error ? error : new Error(String(error)) });
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
