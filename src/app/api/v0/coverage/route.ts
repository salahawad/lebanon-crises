import { NextResponse } from 'next/server';
import { getActors, getCapacityCards } from '@/lib/data/platform-api';
import { ZONES } from '@/lib/data/zones';
import { createLogger } from '@/lib/logger';
import type { Sector } from '@/lib/types/platform';

const log = createLogger('api:coverage');

const ALL_SECTORS: Sector[] = [
  'food', 'medical', 'shelter', 'psychosocial', 'legal',
  'logistics', 'wash', 'education', 'protection',
];

export async function GET() {
  const start = Date.now();
  try {
  const [actors, capacityCards] = await Promise.all([getActors(), getCapacityCards()]);

  const coverage = ZONES.map((zone) => {
    const zoneActors = actors.filter(
      (a) =>
        a.operationalZones.includes(zone.id) &&
        a.verificationStatus !== 'suspended'
    );

    const sectorCoverage = ALL_SECTORS.map((sector) => ({
      sector,
      orgCount: zoneActors.filter((a) => a.sectors.includes(sector)).length,
    }));

    const zoneCapacityCards = capacityCards.filter((c) => c.zone === zone.id);

    return {
      zoneId: zone.id,
      zoneName: zone.nameEn,
      zoneNameAr: zone.nameAr,
      region: zone.region,
      totalOrgs: zoneActors.length,
      sectorCoverage,
      capacityCardCount: zoneCapacityCards.length,
    };
  });

  log.info('coverage computed', { duration: Date.now() - start, zoneCount: coverage.length });

  return NextResponse.json(
    {
      data: coverage,
      meta: {
        totalZones: ZONES.length,
        totalOrgs: actors.filter((a) => a.verificationStatus !== 'suspended').length,
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
    log.error('failed to compute coverage', err, { duration: Date.now() - start });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
