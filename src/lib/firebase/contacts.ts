import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from './config';
import { createLogger } from '../logger';
import type { AreaContact, Governorate } from '../types';

const log = createLogger('firebase:contacts');

const CONTACTS_COLLECTION = 'contacts';

// Get all contacts, optionally filtered by governorate
export async function getContacts(
  governorate?: Governorate
): Promise<AreaContact[]> {
  try {
    let q;

    if (governorate) {
      q = query(
        collection(db, CONTACTS_COLLECTION),
        where('available', '==', true),
        where('governorate', '==', governorate),
        orderBy('area')
      );
    } else {
      q = query(
        collection(db, CONTACTS_COLLECTION),
        where('available', '==', true),
        orderBy('governorate'),
        orderBy('area')
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      ...d.data(),
      id: d.id,
    })) as AreaContact[];
  } catch (error) {
    // If composite index isn't ready yet, fall back to a simple query
    log.warn('contacts query failed, using index fallback', error, { collection: 'contacts' });
    const q = query(collection(db, CONTACTS_COLLECTION));
    const snapshot = await getDocs(q);
    const all = snapshot.docs.map((d) => ({
      ...d.data(),
      id: d.id,
    })) as AreaContact[];

    return all
      .filter((c) => c.available !== false)
      .filter((c) => !governorate || c.governorate === governorate)
      .sort((a, b) => a.governorate.localeCompare(b.governorate) || a.area.localeCompare(b.area));
  }
}
