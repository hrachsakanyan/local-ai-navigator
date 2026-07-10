'use client';

import { MapPin, Compass, Star, Navigation, Loader2, Settings } from 'lucide-react';
import type { LocationError, PermissionState } from '@/lib/telegram';

interface Props {
  userName: string;
  busy: boolean;
  error: LocationError | null;
  permission: PermissionState | null;
  onEnable: () => void;
  onOpenSettings: () => void;
}

/** Each failure mode needs its own words and its own next step. */
function errorCopy(error: LocationError): { title: string; hint: string } {
  switch (error.kind) {
    case 'denied':
      return {
        title: 'Location permission is off',
        hint: 'Turn it on in settings, then try again.',
      };
    case 'timeout':
      return {
        title: 'That took too long',
        hint: 'Move somewhere with a clearer view of the sky and try again.',
      };
    case 'unavailable':
      return {
        title: 'Location is unavailable here',
        hint: 'This device or app context cannot provide a position.',
      };
    default:
      return { title: 'Something went wrong', hint: 'Please try again.' };
  }
}

const VALUES = [
  { icon: Compass, title: 'Nearby, ranked', body: 'The closest places first, always.' },
  { icon: Star, title: 'Worth your time', body: 'Ratings and hours at a glance.' },
  { icon: Navigation, title: 'One tap away', body: 'Open any place in Google Maps.' },
];

export function WelcomeScreen({
  userName,
  busy,
  error,
  permission,
  onEnable,
  onOpenSettings,
}: Props) {
  const copy = error ? errorCopy(error) : null;
  const showSettings = Boolean(error?.canOpenSettings && error.kind === 'denied');
  const blocked = permission === 'unsupported';
  return (
    <main
      style={{
        position: 'relative',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        padding: 'calc(32px + var(--safe-top)) 26px calc(26px + var(--safe-bottom))',
        overflow: 'hidden',
      }}
    >
      {/* Ambient depth */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(95% 55% at 50% -5%, rgba(10,132,255,0.20) 0%, transparent 62%), radial-gradient(70% 45% at 85% 25%, rgba(109,92,255,0.14) 0%, transparent 58%)',
        }}
      />

      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="fade-up" style={{ marginTop: 26 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(140deg, var(--ai-a), var(--ai-b))',
              boxShadow: '0 14px 34px -10px rgba(10,132,255,0.7)',
            }}
          >
            <MapPin size={28} color="#fff" strokeWidth={2.2} />
          </div>

          <h1 style={{ fontSize: 36, lineHeight: 1.06, marginTop: 26, fontWeight: 720 }}>
            {userName ? `Hi ${userName}.` : 'Hello.'}
            <br />
            <span style={{ color: 'var(--text-2)' }}>Find what&rsquo;s around you.</span>
          </h1>
          <p style={{ fontSize: 16, color: 'var(--muted)', marginTop: 14, lineHeight: 1.5, maxWidth: 300 }}>
            Restaurants, cafés, banks and pharmacies — closest first.
          </p>
        </div>

        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column' }}>
          {VALUES.map((v, i) => {
            const Icon = v.icon;
            return (
              <div
                key={v.title}
                className="fade-up"
                style={{ '--d': `${0.1 + i * 0.07}s` } as React.CSSProperties}
              >
                {i > 0 && <div className="separator" style={{ margin: '2px 0' }} />}
                <div style={{ display: 'flex', gap: 15, alignItems: 'center', padding: '14px 0' }}>
                  <Icon size={21} strokeWidth={1.9} color="var(--accent)" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 15.5, fontWeight: 620 }}>{v.title}</div>
                    <div style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 2 }}>{v.body}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ flex: 1, minHeight: 24 }} />

        {/* Primary action sits in the thumb zone */}
        <div>
          {copy && (
            <div role="alert" style={{ textAlign: 'center', marginBottom: 14 }}>
              <p style={{ color: 'var(--danger)', fontSize: 14, fontWeight: 600, margin: 0 }}>
                {copy.title}
              </p>
              <p style={{ color: 'var(--muted)', fontSize: 13, margin: '4px 0 0', lineHeight: 1.45 }}>
                {copy.hint}
              </p>
            </div>
          )}

          {showSettings && (
            <button
              className="btn-quiet"
              onClick={onOpenSettings}
              style={{ marginBottom: 10, minHeight: 48 }}
            >
              <Settings size={17} strokeWidth={2.2} /> Open location settings
            </button>
          )}

          <button
            className="btn-primary"
            onClick={onEnable}
            disabled={busy || blocked}
            style={{ width: '100%' }}
          >
            {busy ? (
              <>
                <Loader2 size={18} className="spin" /> Locating…
              </>
            ) : blocked ? (
              <>Location not supported</>
            ) : (
              <>{error ? 'Try again' : 'Use my location'}</>
            )}
          </button>
          <p style={{ fontSize: 12.5, color: 'var(--muted)', textAlign: 'center', marginTop: 14, lineHeight: 1.5 }}>
            Your location is used only to find places near you.
            <br />
            It never leaves your device.
          </p>
        </div>
      </div>
    </main>
  );
}
