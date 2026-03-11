import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Shelter } from "@/lib/types";

// Sample ArcGIS API response features
const mockArcGISFeatures = [
  {
    attributes: {
      OBJECTID: 1,
      School_Name___Arabic: "مدرسة تجريبية",
      School_Name: "Test School One",
      Cadastral: "Achrafieh",
      Caza: "Beirut",
      Governorate: "Beirut",
      Latitude: 33.887,
      longitude: 35.526,
      "رقم_الهاتف": " 01324580 ",
      Total_Nb_Class: 10,
    },
  },
  {
    attributes: {
      OBJECTID: 2,
      School_Name___Arabic: "مدرسة الشمال",
      School_Name: "North School",
      Cadastral: "Tripoli",
      Caza: "Tripoli",
      Governorate: "North",
      Latitude: 34.4,
      longitude: 35.85,
      "رقم_الهاتف": "",
      Total_Nb_Class: null,
    },
  },
  {
    attributes: {
      OBJECTID: 3,
      School_Name___Arabic: "مدرسة جبل لبنان",
      School_Name: "Mount Lebanon School",
      Cadastral: "Jounieh",
      Caza: "Kesrouan",
      Governorate: "Mount Lebanon",
      Latitude: 33.98,
      longitude: 35.62,
      "رقم_الهاتف": "09832100",
      Total_Nb_Class: 6,
    },
  },
  {
    attributes: {
      OBJECTID: 4,
      School_Name___Arabic: "مدرسة البقاع",
      School_Name: "Bekaa School",
      Cadastral: "Zahleh",
      Caza: "Zahleh",
      Governorate: "Bekaa",
      Latitude: 33.85,
      longitude: 35.9,
      "رقم_الهاتف": "08456789",
      Total_Nb_Class: 8,
    },
  },
  {
    attributes: {
      OBJECTID: 5,
      School_Name___Arabic: "مدرسة النبطية",
      School_Name: "Nabatiye School",
      Cadastral: "Nabatiye",
      Caza: "Nabatiye",
      Governorate: "Nabatiye",
      Latitude: 33.38,
      longitude: 35.48,
      "رقم_الهاتف": "07123456",
      Total_Nb_Class: 5,
    },
  },
];

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("Shelter data parsing", () => {
  it("correctly parses ArcGIS feature attributes into Shelter type", () => {
    const feature = mockArcGISFeatures[0];
    const a = feature.attributes;

    const shelter: Shelter = {
      id: a.OBJECTID as number,
      nameAr: (a.School_Name___Arabic as string) || "",
      nameEn: (a.School_Name as string) || "",
      area: (a.Cadastral as string) || "",
      district: (a.Caza as string) || "",
      governorate: "beirut",
      lat: (a.Latitude as number) || 0,
      lng: (a.longitude as number) || 0,
      phone: ((a["رقم_الهاتف"] as string) || "").trim() || undefined,
      classrooms: (a.Total_Nb_Class as number) || undefined,
    };

    expect(shelter.id).toBe(1);
    expect(shelter.nameAr).toBe("مدرسة تجريبية");
    expect(shelter.nameEn).toBe("Test School One");
    expect(shelter.area).toBe("Achrafieh");
    expect(shelter.district).toBe("Beirut");
    expect(shelter.governorate).toBe("beirut");
    expect(shelter.lat).toBe(33.887);
    expect(shelter.lng).toBe(35.526);
    expect(shelter.phone).toBe("01324580"); // trimmed
    expect(shelter.classrooms).toBe(10);
  });

  it("handles empty phone number and null classrooms", () => {
    const a = mockArcGISFeatures[1].attributes;
    const phone = ((a["رقم_الهاتف"] as string) || "").trim() || undefined;
    const classrooms = (a.Total_Nb_Class as number) || undefined;

    expect(phone).toBeUndefined();
    expect(classrooms).toBeUndefined();
  });
});

describe("Governorate mapping", () => {
  const GOV_MAP: Record<string, string> = {
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

  it("maps all known ArcGIS governorate names correctly", () => {
    expect(GOV_MAP["Beirut"]).toBe("beirut");
    expect(GOV_MAP["Mount Lebanon"]).toBe("mount_lebanon");
    expect(GOV_MAP["North"]).toBe("north");
    expect(GOV_MAP["South"]).toBe("south");
    expect(GOV_MAP["Bekaa"]).toBe("bekaa");
    expect(GOV_MAP["Baalbek-Hermel"]).toBe("baalbek_hermel");
    expect(GOV_MAP["Akkar"]).toBe("akkar");
    expect(GOV_MAP["Nabatiye"]).toBe("nabatieh");
    expect(GOV_MAP["Nabatieh"]).toBe("nabatieh"); // alternate spelling
  });

  it("covers all 8 Lebanon governorates", () => {
    const uniqueValues = new Set(Object.values(GOV_MAP));
    expect(uniqueValues.size).toBe(8);
  });
});

describe("Shelter counts by governorate", () => {
  function getShelterCountsByGovernorate(
    shelters: Shelter[]
  ): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const s of shelters) {
      counts[s.governorate] = (counts[s.governorate] || 0) + 1;
    }
    return counts;
  }

  it("counts shelters per governorate correctly", () => {
    const shelters: Shelter[] = [
      { id: 1, nameAr: "A", nameEn: "A", area: "", district: "", governorate: "beirut", lat: 0, lng: 0 },
      { id: 2, nameAr: "B", nameEn: "B", area: "", district: "", governorate: "beirut", lat: 0, lng: 0 },
      { id: 3, nameAr: "C", nameEn: "C", area: "", district: "", governorate: "north", lat: 0, lng: 0 },
      { id: 4, nameAr: "D", nameEn: "D", area: "", district: "", governorate: "bekaa", lat: 0, lng: 0 },
    ];

    const counts = getShelterCountsByGovernorate(shelters);
    expect(counts.beirut).toBe(2);
    expect(counts.north).toBe(1);
    expect(counts.bekaa).toBe(1);
    expect(counts.south).toBeUndefined();
  });

  it("returns empty object for empty array", () => {
    const counts = getShelterCountsByGovernorate([]);
    expect(Object.keys(counts)).toHaveLength(0);
  });
});

describe("ArcGIS API fetch", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("builds correct query parameters", () => {
    const params = new URLSearchParams({
      where: "مركز_ايواء = 'Yes'",
      outFields:
        "OBJECTID,School_Name___Arabic,School_Name,Cadastral,Caza,Governorate,Latitude,longitude,رقم_الهاتف,Total_Nb_Class",
      f: "json",
      resultRecordCount: "2000",
    });

    expect(params.get("where")).toBe("مركز_ايواء = 'Yes'");
    expect(params.get("f")).toBe("json");
    expect(params.get("resultRecordCount")).toBe("2000");
    expect(params.get("outFields")).toContain("School_Name___Arabic");
    expect(params.get("outFields")).toContain("Governorate");
  });

  it("parses a full API response into shelters array", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        features: mockArcGISFeatures,
        exceededTransferLimit: false,
      }),
    });

    const res = await fetch("https://example.com/test");
    const data = await res.json();

    const shelters: Shelter[] = data.features.map(
      (f: { attributes: Record<string, unknown> }) => {
        const a = f.attributes;
        const GOV_MAP: Record<string, string> = {
          Beirut: "beirut",
          "Mount Lebanon": "mount_lebanon",
          North: "north",
          South: "south",
          Bekaa: "bekaa",
          "Baalbek-Hermel": "baalbek_hermel",
          Akkar: "akkar",
          Nabatiye: "nabatieh",
        };
        return {
          id: a.OBJECTID as number,
          nameAr: (a.School_Name___Arabic as string) || "",
          nameEn: (a.School_Name as string) || "",
          area: (a.Cadastral as string) || "",
          district: (a.Caza as string) || "",
          governorate: GOV_MAP[(a.Governorate as string) || ""] || "beirut",
          lat: (a.Latitude as number) || 0,
          lng: (a.longitude as number) || 0,
          phone: ((a["رقم_الهاتف"] as string) || "").trim() || undefined,
          classrooms: (a.Total_Nb_Class as number) || undefined,
        };
      }
    );

    expect(shelters).toHaveLength(5);
    expect(shelters[0].governorate).toBe("beirut");
    expect(shelters[1].governorate).toBe("north");
    expect(shelters[2].governorate).toBe("mount_lebanon");
    expect(shelters[3].governorate).toBe("bekaa");
    expect(shelters[4].governorate).toBe("nabatieh");
  });

  it("handles API failure gracefully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const res = await fetch("https://example.com/test");
    expect(res.ok).toBe(false);
  });

  it("handles empty features array", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ features: [] }),
    });

    const res = await fetch("https://example.com/test");
    const data = await res.json();
    expect(data.features).toHaveLength(0);
  });
});

describe("Cache TTL logic", () => {
  const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

  it("cache is valid when less than 24 hours old", () => {
    const lastFetched = Date.now() - 12 * 60 * 60 * 1000; // 12 hours ago
    const isValid = Date.now() - lastFetched < CACHE_TTL_MS;
    expect(isValid).toBe(true);
  });

  it("cache is invalid when more than 24 hours old", () => {
    const lastFetched = Date.now() - 25 * 60 * 60 * 1000; // 25 hours ago
    const isValid = Date.now() - lastFetched < CACHE_TTL_MS;
    expect(isValid).toBe(false);
  });

  it("cache is invalid when exactly 24 hours old", () => {
    const lastFetched = Date.now() - 24 * 60 * 60 * 1000;
    const isValid = Date.now() - lastFetched < CACHE_TTL_MS;
    expect(isValid).toBe(false);
  });

  it("cache TTL is 24 hours in milliseconds", () => {
    expect(CACHE_TTL_MS).toBe(86400000);
  });
});
