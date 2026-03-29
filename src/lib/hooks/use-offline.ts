"use client";

import { useState, useEffect, useCallback } from "react";

interface OfflineState {
  /** Whether the browser is currently offline */
  isOffline: boolean;
  /** Whether the service worker is registered and active */
  swReady: boolean;
  /** Cached item counts by category */
  cacheStatus: { static: number; data: number; images: number } | null;
  /** Request a fresh cache status from the SW */
  refreshCacheStatus: () => void;
}

export function useOffline(): OfflineState {
  const [isOffline, setIsOffline] = useState(false);
  const [swReady, setSwReady] = useState(false);
  const [cacheStatus, setCacheStatus] = useState<OfflineState["cacheStatus"]>(null);

  // Listen to online/offline events
  useEffect(() => {
    setIsOffline(!navigator.onLine);

    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);

    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);

    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  // Check SW registration status
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.ready.then(() => setSwReady(true));

    // Listen for cache status messages from SW
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "CACHE_STATUS") {
        setCacheStatus({
          static: event.data.static,
          data: event.data.data,
          images: event.data.images,
        });
      }
    };

    navigator.serviceWorker.addEventListener("message", handleMessage);
    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  }, []);

  const refreshCacheStatus = useCallback(() => {
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage("GET_CACHE_STATUS");
    }
  }, []);

  return { isOffline, swReady, cacheStatus, refreshCacheStatus };
}
