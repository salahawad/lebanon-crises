import { NextResponse } from 'next/server';
import { getActors } from '@/lib/data/platform-api';
import { ZONES } from '@/lib/data/zones';
import { createLogger } from '@/lib/logger';

const log = createLogger('api:orgs');

export async function GET() {
  const start = Date.now();
  try {
  const actors = await getActors();

  // Return public org list — NO contact details exposed
  const orgs = actors.filter(
    (a) => a.verificationStatus !== 'suspended'
  ).map((actor) => ({
    id: actor.id,
    name: actor.name,
    nameAr: actor.nameAr || null,
    type: actor.type,
    sectors: actor.sectors,
    operationalZones: actor.operationalZones.map((zoneId) => {
      const zone = ZONES.find((z) => z.id === zoneId);
      return {
        id: zoneId,
        nameEn: zone?.nameEn || zoneId,
        nameAr: zone?.nameAr || zoneId,
      };
    }),
    verificationStatus: actor.verificationStatus,
    vouchCount: actor.vouchCount,
    region: actor.region,
    lastUpdated: new Date(actor.lastUpdated).toISOString(),
  }));

  log.info('orgs listed', { duration: Date.now() - start, orgCount: orgs.length });

  return NextResponse.json(
    {
      data: orgs,
      meta: {
        totalOrgs: orgs.length,
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
    log.error('failed to list orgs', err, { duration: Date.now() - start });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
