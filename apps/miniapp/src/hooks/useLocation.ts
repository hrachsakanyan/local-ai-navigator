'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getUserLocation,
  getLocationPermission,
  openLocationSettings,
  watchLocation,
  LocationError,
  type Coords,
  type PermissionState,
  type WatchHandle,
} from '@/lib/telegram';

export type LocationStatus = 'idle' | 'locating' | 'ready' | 'error';

export interface LocationState {
  status: LocationStatus;
  coords: Coords | null;
  /** Epoch ms of the last successful fix — lets the UI show staleness. */
  updatedAt: number | null;
  error: LocationError | null;
  permission: PermissionState | null;
}

interface Options {
  /** Keep tracking after the first fix. Off by default: tracking costs battery. */
  watch?: boolean;
}

/**
 * Single source of truth for the user's position.
 *
 * Owns the permission probe, the one-shot request, the retry path, and the
 * lifetime of any active watch. Components read state; they never call the
 * geolocation APIs directly.
 */
export function useLocation({ watch = false }: Options = {}) {
  const [state, setState] = useState<LocationState>({
    status: 'idle',
    coords: null,
    updatedAt: null,
    error: null,
    permission: null,
  });

  const watchRef = useRef<WatchHandle | null>(null);
  const mounted = useRef(true);

  // Probe permission on mount so the welcome copy can adapt before we ask.
  useEffect(() => {
    mounted.current = true;
    getLocationPermission()
      .then((permission) => {
        if (mounted.current) setState((s) => ({ ...s, permission }));
      })
      .catch(() => {});

    return () => {
      mounted.current = false;
      watchRef.current?.stop();
      watchRef.current = null;
    };
  }, []);

  const request = useCallback(async () => {
    setState((s) => ({ ...s, status: 'locating', error: null }));
    try {
      const coords = await getUserLocation();
      if (!mounted.current) return;
      setState((s) => ({
        ...s,
        status: 'ready',
        coords,
        updatedAt: Date.now(),
        error: null,
        permission: 'granted',
      }));
    } catch (e) {
      if (!mounted.current) return;
      const error =
        e instanceof LocationError
          ? e
          : new LocationError('unknown', 'Something went wrong finding your location.');
      setState((s) => ({
        ...s,
        status: 'error',
        error,
        permission: error.kind === 'denied' ? 'denied' : s.permission,
      }));
    }
  }, []);

  // Start/stop the watch as `watch` and readiness change.
  useEffect(() => {
    if (!watch || state.status !== 'ready') return;
    if (watchRef.current) return;

    watchRef.current = watchLocation(
      (coords) => {
        if (mounted.current) setState((s) => ({ ...s, coords, updatedAt: Date.now() }));
      },
      // A failed update should not blank out a position we already have.
      (error) => {
        if (mounted.current) setState((s) => ({ ...s, error }));
      },
    );

    return () => {
      watchRef.current?.stop();
      watchRef.current = null;
    };
  }, [watch, state.status]);

  return {
    ...state,
    /** True when the fix is older than 60s — useful for a "stale" hint. */
    isStale: state.updatedAt != null && Date.now() - state.updatedAt > 60_000,
    request,
    retry: request,
    openSettings: openLocationSettings,
  };
}
