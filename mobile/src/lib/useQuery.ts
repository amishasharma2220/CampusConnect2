import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";

type State<T> = { data: T | undefined; error: string | null; loading: boolean; refreshing: boolean };

/**
 * Small data-fetching hook: loads on mount, re-fetches quietly when the
 * screen regains focus (so registrations show up after going back), and
 * exposes pull-to-refresh state.
 */
export function useQuery<T>(fetcher: () => Promise<T>, deps: unknown[] = [], { refetchOnFocus = true } = {}) {
  const [state, setState] = useState<State<T>>({ data: undefined, error: null, loading: true, refreshing: false });
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const mounted = useRef(true);
  const firstFocus = useRef(true);

  const run = useCallback(async (mode: "load" | "refresh" | "silent") => {
    setState((s) => ({
      ...s,
      loading: mode === "load" && s.data === undefined,
      refreshing: mode === "refresh",
      error: mode === "silent" ? s.error : null,
    }));
    try {
      const data = await fetcherRef.current();
      if (mounted.current) setState({ data, error: null, loading: false, refreshing: false });
    } catch (e) {
      if (!mounted.current) return;
      setState((s) => ({
        ...s,
        loading: false,
        refreshing: false,
        // A failed background refresh keeps showing the data we already have.
        error: mode === "silent" && s.data !== undefined ? s.error : (e as Error).message,
      }));
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    run("load");
    return () => {
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      if (refetchOnFocus) run("silent");
    }, [run, refetchOnFocus]),
  );

  return {
    ...state,
    reload: () => run("load"),
    refresh: () => run("refresh"),
  };
}
