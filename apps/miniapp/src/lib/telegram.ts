'use client';

export interface Coords {
  lat: number;
  lng: number;
  accuracy?: number;
}

export interface SafeAreaInsets {
  top: number;
  bottom: number;
}

// The Telegram WebApp surface we touch. Kept loose on purpose — the runtime
// shape varies across client versions.
type TelegramWebApp = any;

function tg(): TelegramWebApp | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as any).Telegram?.WebApp;
}

export function initTelegram(): void {
  const w = tg();
  if (!w) return;
  try {
    w.ready();
    w.expand();
    // Apply any device safe-area insets Telegram reports to our CSS vars.
    applySafeAreaVars();
    w.onEvent?.('safeAreaChanged', applySafeAreaVars);
    w.onEvent?.('viewportChanged', applySafeAreaVars);
  } catch {
    /* older clients */
  }
}

export function getInitData(): string {
  return tg()?.initData ?? '';
}

export function getFirstName(): string {
  return tg()?.initDataUnsafe?.user?.first_name ?? '';
}

export function getSafeAreaInsets(): SafeAreaInsets {
  const w = tg();
  const a = w?.safeAreaInset ?? {};
  const c = w?.contentSafeAreaInset ?? {};
  return {
    top: (a.top ?? 0) + (c.top ?? 0),
    bottom: (a.bottom ?? 0) + (c.bottom ?? 0),
  };
}

function applySafeAreaVars(): void {
  if (typeof document === 'undefined') return;
  const { top, bottom } = getSafeAreaInsets();
  const root = document.documentElement;
  if (top) root.style.setProperty('--safe-top', `${top}px`);
  if (bottom) root.style.setProperty('--safe-bottom', `${bottom}px`);
}

/** Haptic feedback. Silently no-ops off-platform. */
export function haptic(
  kind: 'light' | 'medium' | 'heavy' | 'select' | 'success' | 'warning' | 'error' = 'light',
): void {
  const h = tg()?.HapticFeedback;
  if (!h) return;
  try {
    if (kind === 'select') h.selectionChanged();
    else if (kind === 'success' || kind === 'warning' || kind === 'error')
      h.notificationOccurred(kind);
    else h.impactOccurred(kind);
  } catch {
    /* ignore */
  }
}

/** Open an external link (e.g. Google/Apple Maps) using Telegram when available. */
export function openLink(url: string): void {
  const w = tg();
  if (w?.openLink) w.openLink(url);
  else if (typeof window !== 'undefined') window.open(url, '_blank');
}

/* ── Location system ──────────────────────────────────────────────────────────
 *
 * Acquisition order:
 *   1. Telegram LocationManager (Bot API 8.0) — best on mobile clients
 *   2. Browser navigator.geolocation — covers Telegram Desktop and the known
 *      Android LocationManager quirk
 *   3. Fail with a typed LocationError so the UI can react correctly
 */

export type LocationErrorKind =
  | 'denied' // user said no. Retrying is pointless; send them to settings.
  | 'unavailable' // no GPS/geolocation on this device or context (e.g. plain http)
  | 'timeout' // hardware did not fix in time. Retrying is reasonable.
  | 'unknown';

export class LocationError extends Error {
  readonly kind: LocationErrorKind;
  /** True when we can deep-link the user to Telegram's location settings. */
  readonly canOpenSettings: boolean;

  constructor(kind: LocationErrorKind, message: string, canOpenSettings = false) {
    super(message);
    this.name = 'LocationError';
    this.kind = kind;
    this.canOpenSettings = canOpenSettings;
  }
}

export type PermissionState = 'granted' | 'denied' | 'unrequested' | 'unsupported';

function lm(): any | undefined {
  return tg()?.LocationManager;
}

/** Resolve a callback-style API, but never hang. */
function withTimeout<T>(
  executor: (resolve: (v: T) => void) => void,
  ms: number,
  onTimeout: () => T,
): Promise<T> {
  return new Promise((resolve) => {
    let settled = false;
    const done = (v: T) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(v);
    };
    const timer = setTimeout(() => done(onTimeout()), ms);
    try {
      executor(done);
    } catch {
      done(onTimeout());
    }
  });
}

/** Initialise LocationManager once. Resolves false if unavailable or slow. */
function initLocationManager(): Promise<boolean> {
  const m = lm();
  if (!m) return Promise.resolve(false);
  if (m.isInited) return Promise.resolve(true);
  return withTimeout<boolean>((done) => m.init(() => done(true)), 3000, () => false);
}

/** What Telegram currently thinks about our location permission. */
export async function getLocationPermission(): Promise<PermissionState> {
  const m = lm();
  if (!m) return 'unsupported';
  const ready = await initLocationManager();
  if (!ready) return 'unsupported';
  if (!m.isLocationAvailable) return 'unsupported';
  if (m.isAccessGranted) return 'granted';
  if (m.isAccessRequested) return 'denied'; // asked before, not granted
  return 'unrequested';
}

/** Deep-link into Telegram's per-app location settings. */
export function openLocationSettings(): void {
  try {
    lm()?.openSettings?.();
  } catch {
    /* ignore */
  }
}

/** One-shot position. Throws LocationError. */
export async function getUserLocation(): Promise<Coords> {
  const viaTelegram = await tryLocationManager();
  if (viaTelegram) return viaTelegram;
  return tryBrowserGeolocation();
}

/** Returns null on any failure so we can fall through to the browser. */
async function tryLocationManager(): Promise<Coords | null> {
  const m = lm();
  if (!m) return null;
  const ready = await initLocationManager();
  if (!ready || !m.isLocationAvailable) return null;

  return withTimeout<Coords | null>(
    (done) =>
      m.getLocation((loc: any) => {
        if (loc && typeof loc.latitude === 'number') {
          done({ lat: loc.latitude, lng: loc.longitude, accuracy: loc.horizontal_accuracy });
        } else {
          done(null); // access denied or no fix
        }
      }),
    12000,
    () => null,
  );
}

function tryBrowserGeolocation(): Promise<Coords> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(deniedOrUnavailable());
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
      (err) => reject(mapGeolocationError(err)),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 },
    );
  });
}

function deniedOrUnavailable(): LocationError {
  return new LocationError(
    'unavailable',
    'This device or browser cannot provide a location.',
    Boolean(lm()),
  );
}

/** Translate a browser GeolocationPositionError into our typed error. */
export function mapGeolocationError(err: unknown): LocationError {
  const canSettings = Boolean(lm());
  const code = (err as any)?.code;
  // 1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT
  if (code === 1)
    return new LocationError('denied', 'Location permission was denied.', canSettings);
  if (code === 2)
    return new LocationError('unavailable', 'Your position could not be determined.', canSettings);
  if (code === 3) return new LocationError('timeout', 'Finding your location took too long.', canSettings);
  return new LocationError('unknown', 'Something went wrong finding your location.', canSettings);
}

export interface WatchHandle {
  stop: () => void;
}

/**
 * Continuously track position.
 *
 * Prefers navigator.geolocation.watchPosition (event-driven, battery-aware).
 * Telegram's LocationManager has no watch API, so when only it is available we
 * poll. Always call stop() — polling and watching both cost battery.
 */
export function watchLocation(
  onUpdate: (c: Coords) => void,
  onError?: (e: LocationError) => void,
  pollMs = 8000,
): WatchHandle {
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    const id = navigator.geolocation.watchPosition(
      (pos) =>
        onUpdate({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
      (err) => onError?.(mapGeolocationError(err)),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 },
    );
    return { stop: () => navigator.geolocation.clearWatch(id) };
  }

  if (lm()) {
    let stopped = false;
    const tick = async () => {
      if (stopped) return;
      const c = await tryLocationManager();
      if (stopped) return;
      if (c) onUpdate(c);
      else onError?.(new LocationError('unavailable', 'Lost the location signal.', true));
    };
    void tick();
    const timer = setInterval(tick, pollMs);
    return {
      stop: () => {
        stopped = true;
        clearInterval(timer);
      },
    };
  }

  onError?.(deniedOrUnavailable());
  return { stop: () => {} };
}
