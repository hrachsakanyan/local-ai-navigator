'use client';

import { useState } from 'react';
import { Star, Heart, ArrowUpRight } from 'lucide-react';
import type { MockPlace } from '@/lib/mockPlaces';
import { categoryById } from '@/lib/categories';
import { formatDistance, walkingEta, priceString } from '@/lib/format';
import { haptic, openLink } from '@/lib/telegram';

interface Props {
  place: MockPlace;
}

/** Google Maps deep link. Coordinates are unambiguous, and this opens the
 *  native app on iOS/Android, the web map on desktop. */
function mapsUrl(place: MockPlace): string {
  return `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`;
}

export function PlaceCard({ place }: Props) {
  const [saved, setSaved] = useState(false);
  const [imgOk, setImgOk] = useState(true);
  const cat = categoryById(place.category);
  const Icon = cat?.icon;
  const color = `var(${cat?.colorVar ?? '--accent'})`;
  const price = priceString(place.priceLevel);

  return (
    <article className="card">
      {/* Media block — the place photo, with a tinted plate (icon over a
          gradient) shown underneath if the image is slow or fails to load. */}
      <div
        style={{
          position: 'relative',
          aspectRatio: '16 / 10',
          overflow: 'hidden',
          background: `linear-gradient(150deg, ${color} -10%, rgba(14,14,18,0.94) 95%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Tinted-plate fallback: always rendered; the photo sits on top of it. */}
        {Icon && <Icon size={44} color="rgba(255,255,255,0.72)" strokeWidth={1.1} />}

        {imgOk && place.image && (
          <img
            src={place.image}
            alt={place.name}
            loading="lazy"
            onError={() => setImgOk(false)}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}

        {/* Top scrim keeps the status pill and save button legible on photos. */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.34) 0%, transparent 34%)',
          }}
        />

        <span
          className="pill glass"
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            color: place.openNow ? 'var(--success)' : 'var(--danger)',
          }}
        >
          {place.openNow ? 'Open now' : 'Closed'}
        </span>

        <button
          aria-label={saved ? `Remove ${place.name} from saved` : `Save ${place.name}`}
          aria-pressed={saved}
          onClick={() => {
            haptic('select');
            setSaved((s) => !s);
          }}
          className="icon-btn"
          style={{ position: 'absolute', top: 6, right: 6 }}
        >
          <Heart
            size={22}
            strokeWidth={2}
            color="#fff"
            fill={saved ? '#ff385c' : 'rgba(0,0,0,0.28)'}
            style={{ transition: 'fill 0.18s ease' }}
          />
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '13px 14px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h3
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: 16,
              fontWeight: 650,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {place.name}
          </h3>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            <Star size={13} color="var(--text)" fill="var(--text)" />
            {place.rating.toFixed(1)}
            <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({place.reviews})</span>
          </span>
        </div>

        <p
          style={{
            margin: '4px 0 0',
            fontSize: 14,
            color: 'var(--muted)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {place.address}
        </p>

        <p style={{ margin: '3px 0 0', fontSize: 14, color: 'var(--muted)' }}>
          {formatDistance(place.distanceM)} away · {walkingEta(place.distanceM)} walk
          {price && ` · ${price}`}
        </p>

        <button
          className="btn-quiet"
          style={{ marginTop: 13 }}
          onClick={() => {
            haptic('medium');
            openLink(mapsUrl(place));
          }}
        >
          Open in Google Maps
          <ArrowUpRight size={16} strokeWidth={2.4} />
        </button>
      </div>
    </article>
  );
}
