import { useCallback, useEffect, useRef, useState } from "react";

export const useTickets = (loader, deps = [], options = {}) => {
  const pollMs = Number(options.pollMs ?? 10000);
  const enabled = options.enabled !== false;
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(() => (typeof document === "undefined" ? true : document.visibilityState === "visible"));
  const requestIdRef = useRef(0);
  const hasLoadedRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    if (!hasLoadedRef.current) setLoading(true);
    setError("");
    try {
      const data = await loader();
      if (requestId !== requestIdRef.current) return;
      setTickets(Array.isArray(data) ? data : []);
      hasLoadedRef.current = true;
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err?.response?.data?.message || "Failed to load tickets.");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [enabled, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const syncVisibility = () => setIsVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", syncVisibility);
    return () => document.removeEventListener("visibilitychange", syncVisibility);
  }, []);

  useEffect(() => {
    if (!enabled || !isVisible) return undefined;
    refresh();
    if (!Number.isFinite(pollMs) || pollMs <= 0) return undefined;
    const timer = window.setInterval(refresh, pollMs);
    return () => window.clearInterval(timer);
  }, [enabled, isVisible, pollMs, refresh]);

  useEffect(() => () => {
    requestIdRef.current += 1;
  }, []);

  return { tickets, setTickets, loading, error, refresh };
};
