import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "./config";
import { createLogger } from "../logger";
import type { Shelter, Governorate } from "../types";

const log = createLogger("firebase:shelters");

const SHELTERS_COLLECTION = "shelters";
const SHELTERS_META_DOC = "shelters_cache/meta";

// How often to refresh from ArcGIS (24 hours)
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const ARCGIS_URL =
  process.env.NEXT_PUBLIC_SHELTERS_API_URL ||
  "https://services3.arcgis.com/tuNLpt6Wfhd22qmO/arcgis/rest/services/SchoolForEmergencyPlan_Map/FeatureServer/0/query";

const GOV_MAP: Record<string, Governorate> = {
  Beirut: "beirut",
  "Mount Lebanon": "mount_lebanon",
  North: "north",
  South: "south",
  Bekaa: "bekaa",
  "Baalbek-Hermel": "baalbek_hermel",
  Akkar: "akkar",
  Nabatiye: "nabatieh",
  Nabatieh: "nabatieh",
};

function mapGovernorate(raw: string): Governorate {
  return GOV_MAP[raw] || "beirut";
}

/**
 * Fetch shelters from ArcGIS API
 */
async function fetchFromArcGIS(): Promise<Shelter[]> {
  const params = new URLSearchParams({
    where: "مركز_ايواء = 'Yes'",
    outFields:
      "OBJECTID,School_Name___Arabic,School_Name,Cadastral,Caza,Governorate,Latitude,longitude,رقم_الهاتف,Total_Nb_Class",
    f: "json",
    resultRecordCount: "2000",
  });

  const res = await fetch(`${ARCGIS_URL}?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch shelters from source");

  const data = await res.json();
  const features: Array<{ attributes: Record<string, unknown> }> =
    data.features || [];

  return features.map((f) => {
    const a = f.attributes;
    return {
      id: a.OBJECTID as number,
      nameAr: (a.School_Name___Arabic as string) || "",
      nameEn: (a.School_Name as string) || "",
      area: (a.Cadastral as string) || "",
      district: (a.Caza as string) || "",
      governorate: mapGovernorate((a.Governorate as string) || ""),
      lat: (a.Latitude as number) || 0,
      lng: (a.longitude as number) || 0,
      phone: ((a["رقم_الهاتف"] as string) || "").trim() || undefined,
      classrooms: (a.Total_Nb_Class as number) || undefined,
    };
  });
}

/**
 * Store shelters into Firestore in batches
 */
async function cacheSheltersToFirestore(shelters: Shelter[]): Promise<void> {
  // Firestore batches max 500 ops — split into chunks
  const BATCH_SIZE = 400;
  for (let i = 0; i < shelters.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const chunk = shelters.slice(i, i + BATCH_SIZE);
    for (const s of chunk) {
      const ref = doc(db, SHELTERS_COLLECTION, String(s.id));
      batch.set(ref, s);
    }
    await batch.commit();
  }

  // Update meta doc with fetch timestamp
  await setDoc(doc(db, SHELTERS_META_DOC), {
    lastFetched: Date.now(),
    count: shelters.length,
  });
}

/**
 * Read shelters from Firestore cache
 */
async function readSheltersFromCache(): Promise<Shelter[]> {
  const snapshot = await getDocs(collection(db, SHELTERS_COLLECTION));
  return snapshot.docs.map((d) => d.data() as Shelter);
}

/**
 * Check if cache is still valid (less than 24h old)
 */
async function isCacheValid(): Promise<boolean> {
  try {
    const metaSnap = await getDoc(doc(db, SHELTERS_META_DOC));
    if (!metaSnap.exists()) return false;
    const { lastFetched } = metaSnap.data() as { lastFetched: number };
    return Date.now() - lastFetched < CACHE_TTL_MS;
  } catch {
    return false;
  }
}

/**
 * Get shelters — reads from Firestore cache, refreshes from ArcGIS daily.
 * On the first request of the day, fetches from ArcGIS and stores in Firestore.
 * All subsequent requests read from Firestore.
 */
export async function getShelters(): Promise<Shelter[]> {
  // Check if cache is fresh
  const cacheValid = await isCacheValid();

  if (cacheValid) {
    const cached = await readSheltersFromCache();
    if (cached.length > 0) return cached;
  }

  // Cache is stale or empty — refresh from ArcGIS
  const arcgisStart = Date.now();
  try {
    const fresh = await fetchFromArcGIS();
    log.info("ArcGIS fetch completed", { operation: "getShelters", count: fresh.length, duration: Date.now() - arcgisStart });

    // Safety: only cache if we got real data (API might return empty on error)
    if (fresh.length > 0) {
      cacheSheltersToFirestore(fresh).catch((err) =>
        log.warn("failed to cache shelters to firestore", err, { operation: "getShelters", count: fresh.length })
      );
    }

    // If API returned empty, fall back to stale cache
    if (fresh.length === 0) {
      const stale = await readSheltersFromCache();
      if (stale.length > 0) return stale;
    }

    return fresh;
  } catch (err) {
    // If ArcGIS fails, try stale cache as fallback — never lose existing data
    log.error("ArcGIS fetch failed, using cached data", err, { operation: "getShelters" });
    const stale = await readSheltersFromCache();
    if (stale.length > 0) return stale;
    throw err;
  }
}

export function getShelterCountsByGovernorate(
  shelters: Shelter[]
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const s of shelters) {
    counts[s.governorate] = (counts[s.governorate] || 0) + 1;
  }
  return counts;
}
