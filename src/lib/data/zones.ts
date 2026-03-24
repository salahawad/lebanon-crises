// Geographic zone reference data for Lebanon
// Neighborhood/district level in urban areas, town level elsewhere

import type { Zone, Region } from '@/lib/types/platform';

export const ZONES: Zone[] = [
  // Beirut & suburbs
  { id: 'bourj_hammoud', nameEn: 'Bourj Hammoud', nameAr: 'برج حمود', region: 'beirut_suburbs', lat: 33.894, lng: 35.548 },
  { id: 'dekwaneh', nameEn: 'Dekwaneh', nameAr: 'الدكوانة', region: 'beirut_suburbs', lat: 33.876, lng: 35.543 },
  { id: 'sin_el_fil', nameEn: 'Sin El Fil', nameAr: 'سن الفيل', region: 'beirut_suburbs', lat: 33.877, lng: 35.527 },
  { id: 'sabra', nameEn: 'Sabra', nameAr: 'صبرا', region: 'beirut_suburbs', lat: 33.858, lng: 35.491 },
  { id: 'mar_elias', nameEn: 'Mar Elias', nameAr: 'مار الياس', region: 'beirut_suburbs', lat: 33.874, lng: 35.494 },
  { id: 'haret_hreik', nameEn: 'Haret Hreik', nameAr: 'حارة حريك', region: 'beirut_suburbs', lat: 33.848, lng: 35.509 },
  { id: 'hamra', nameEn: 'Hamra', nameAr: 'الحمرا', region: 'beirut_suburbs', lat: 33.897, lng: 35.482 },
  { id: 'achrafieh', nameEn: 'Achrafieh', nameAr: 'الأشرفية', region: 'beirut_suburbs', lat: 33.891, lng: 35.514 },
  { id: 'cola', nameEn: 'Cola', nameAr: 'الكولا', region: 'beirut_suburbs', lat: 33.872, lng: 35.493 },
  { id: 'tarik_jdide', nameEn: 'Tarik Jdide', nameAr: 'طريق الجديدة', region: 'beirut_suburbs', lat: 33.877, lng: 35.498 },
  { id: 'dahieh', nameEn: 'Dahieh', nameAr: 'الضاحية', region: 'beirut_suburbs', lat: 33.838, lng: 35.517 },
  { id: 'jnah', nameEn: 'Jnah', nameAr: 'الجناح', region: 'beirut_suburbs', lat: 33.856, lng: 35.481 },

  // South Lebanon
  { id: 'saida', nameEn: 'Saida', nameAr: 'صيدا', region: 'south_lebanon', lat: 33.558, lng: 35.375 },
  { id: 'sour', nameEn: 'Sour (Tyre)', nameAr: 'صور', region: 'south_lebanon', lat: 33.273, lng: 35.196 },
  { id: 'nabatieh', nameEn: 'Nabatieh', nameAr: 'النبطية', region: 'south_lebanon', lat: 33.378, lng: 35.484 },
  { id: 'marjayoun', nameEn: 'Marjayoun', nameAr: 'مرجعيون', region: 'south_lebanon', lat: 33.361, lng: 35.591 },
  { id: 'bint_jbeil', nameEn: 'Bint Jbeil', nameAr: 'بنت جبيل', region: 'south_lebanon', lat: 33.121, lng: 35.433 },
  { id: 'khiam', nameEn: 'Khiam', nameAr: 'الخيام', region: 'south_lebanon', lat: 33.354, lng: 35.647 },

  // Bekaa Valley
  { id: 'zahle', nameEn: 'Zahle', nameAr: 'زحلة', region: 'bekaa_valley', lat: 33.845, lng: 35.904 },
  { id: 'baalbek', nameEn: 'Baalbek', nameAr: 'بعلبك', region: 'bekaa_valley', lat: 34.007, lng: 36.211 },
  { id: 'hermel', nameEn: 'Hermel', nameAr: 'الهرمل', region: 'bekaa_valley', lat: 34.394, lng: 36.385 },
  { id: 'chtaura', nameEn: 'Chtaura', nameAr: 'شتورا', region: 'bekaa_valley', lat: 33.819, lng: 35.864 },
  { id: 'bar_elias', nameEn: 'Bar Elias', nameAr: 'بر الياس', region: 'bekaa_valley', lat: 33.779, lng: 35.876 },
  { id: 'anjar', nameEn: 'Anjar', nameAr: 'عنجر', region: 'bekaa_valley', lat: 33.729, lng: 35.932 },

  // North Lebanon
  { id: 'tripoli', nameEn: 'Tripoli', nameAr: 'طرابلس', region: 'north_lebanon', lat: 34.436, lng: 35.850 },
  { id: 'bcharre', nameEn: 'Bcharre', nameAr: 'بشري', region: 'north_lebanon', lat: 34.251, lng: 36.012 },
  { id: 'zgharta', nameEn: 'Zgharta', nameAr: 'زغرتا', region: 'north_lebanon', lat: 34.400, lng: 35.895 },
  { id: 'batroun', nameEn: 'Batroun', nameAr: 'البترون', region: 'north_lebanon', lat: 34.256, lng: 35.658 },
  { id: 'akkar_town', nameEn: 'Akkar', nameAr: 'عكار', region: 'north_lebanon', lat: 34.533, lng: 36.078 },
  { id: 'halba', nameEn: 'Halba', nameAr: 'حلبا', region: 'north_lebanon', lat: 34.545, lng: 36.079 },
  { id: 'mina', nameEn: 'Mina', nameAr: 'الميناء', region: 'north_lebanon', lat: 34.450, lng: 35.824 },
];

export const REGIONS: { id: Region; nameEn: string; nameAr: string }[] = [
  { id: 'beirut_suburbs', nameEn: 'Beirut & Suburbs', nameAr: 'بيروت والضواحي' },
  { id: 'south_lebanon', nameEn: 'South Lebanon', nameAr: 'جنوب لبنان' },
  { id: 'bekaa_valley', nameEn: 'Bekaa Valley', nameAr: 'سهل البقاع' },
  { id: 'north_lebanon', nameEn: 'North Lebanon', nameAr: 'شمال لبنان' },
];

export const SECTORS_META: { id: string; nameEn: string; nameAr: string; color: string }[] = [
  { id: 'food', nameEn: 'Food', nameAr: 'غذاء', color: '#22c55e' },
  { id: 'medical', nameEn: 'Medical', nameAr: 'طبي', color: '#ef4444' },
  { id: 'shelter', nameEn: 'Shelter', nameAr: 'مأوى', color: '#3b82f6' },
  { id: 'psychosocial', nameEn: 'Psychosocial', nameAr: 'دعم نفسي', color: '#a855f7' },
  { id: 'legal', nameEn: 'Legal', nameAr: 'قانوني', color: '#6366f1' },
  { id: 'logistics', nameEn: 'Logistics', nameAr: 'لوجستيات', color: '#f97316' },
  { id: 'wash', nameEn: 'WASH', nameAr: 'مياه وصرف صحي', color: '#06b6d4' },
  { id: 'education', nameEn: 'Education', nameAr: 'تعليم', color: '#eab308' },
  { id: 'protection', nameEn: 'Protection', nameAr: 'حماية', color: '#ec4899' },
];

export function getZoneById(id: string): Zone | undefined {
  return ZONES.find(z => z.id === id);
}

export function getZonesByRegion(region: Region): Zone[] {
  return ZONES.filter(z => z.region === region);
}

export function getZoneName(id: string, locale: string): string {
  const zone = getZoneById(id);
  if (!zone) return id;
  return locale === 'ar' ? zone.nameAr : zone.nameEn;
}

export function getSectorName(id: string, locale: string): string {
  const s = SECTORS_META.find(s => s.id === id);
  if (!s) return id;
  return locale === 'ar' ? s.nameAr : s.nameEn;
}

export function getSectorColor(id: string): string {
  return SECTORS_META.find(s => s.id === id)?.color ?? '#94a3b8';
}
