import { NextResponse } from 'next/server';
import { getActors } from '@/lib/data/platform-api';
import { ZONES } from '@/lib/data/zones';
import { createLogger } from '@/lib/logger';
import type { Sector } from '@/lib/types/platform';

const log = createLogger('api:gaps');

const ALL_SECTORS: Sector[] = [
  'food', 'medical', 'shelter', 'psychosocial', 'legal',
  'logistics', 'wash', 'education', 'protection',
];

export async function GET() {
  const start = Date.now();
  try {
  const actors = await getActors();
  const gaps: {
    zoneId: string;
    zoneName: string;
    zoneNameAr: string;
    region: string;
    missingSectors: Sector[];
    totalOrgs: number;
  }[] = [];

  for (const zone of ZONES) {
    const zoneActors = actors.filter(
      (a) =>
        a.operationalZones.includes(zone.id) &&
        a.verificationStatus !== 'suspended'
    );

    const coveredSectors = new Set(zoneActors.flatMap((a) => a.sectors));
    const missingSectors = ALL_SECTORS.filter((s) => !coveredSectors.has(s));

    if (missingSectors.length > 0) {
      gaps.push({
        zoneId: zone.id,
        zoneName: zone.nameEn,
        zoneNameAr: zone.nameAr,
        region: zone.region,
        missingSectors,
        totalOrgs: zoneActors.length,
      });
    }
  }

  // Sort by most gaps first
  gaps.sort((a, b) => b.missingSectors.length - a.missingSectors.length);

  log.info('gaps computed', { duration: Date.now() - start, gapCount: gaps.length });

  return NextResponse.json(
    {
      data: gaps,
      meta: {
        totalZonesWithGaps: gaps.length,
        totalZones: ZONES.length,
        generatedAt: new Date().toISOString(),
      },
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=1800',
      },
    }
  );
  } catch (err) {
    log.error('failed to compute gaps', err, { duration: Date.now() - start });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
