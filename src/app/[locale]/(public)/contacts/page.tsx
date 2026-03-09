"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/shared/page-header";
import { Select } from "@/components/ui/select";
import { getContacts } from "@/lib/firebase/contacts";
import type { AreaContact, Governorate } from "@/lib/types";

const GOVERNORATES: Governorate[] = [
  "beirut",
  "mount_lebanon",
  "north",
  "south",
  "bekaa",
  "baalbek_hermel",
  "akkar",
  "nabatieh",
];

export default function ContactsPage() {
  const t = useTranslations();
  const [contacts, setContacts] = useState<AreaContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [governorate, setGovernorate] = useState<string>("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await getContacts(
          governorate ? (governorate as Governorate) : undefined
        );
        setContacts(data);
      } catch {
        setError(t("errors.generic"));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [governorate, t]);

  // Group contacts by governorate
  const grouped = contacts.reduce<Record<string, AreaContact[]>>(
    (acc, contact) => {
      const key = contact.governorate;
      if (!acc[key]) acc[key] = [];
      acc[key].push(contact);
      return acc;
    },
    {}
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader title={t("contacts.title")} />

      <main className="max-w-lg mx-auto px-4 py-6">
        <p className="text-sm text-slate-600 mb-6 text-start">
          {t("contacts.subtitle")}
        </p>

        {/* Filter by governorate */}
        <div className="mb-6">
          <Select
            label={t("contacts.filterByArea")}
            id="governorate-filter"
            placeholder={t("browse.allAreas")}
            value={governorate}
            onChange={(e) => setGovernorate(e.target.value)}
            options={GOVERNORATES.map((g) => ({
              value: g,
              label: t(`request.governorates.${g}`),
            }))}
          />
        </div>

        {loading && (
          <div className="text-center py-12 text-slate-500">
            {t("common.loading")}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}

        {!loading && !error && contacts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 text-sm">
              {t("contacts.noContacts")}
            </p>
          </div>
        )}

        {!loading &&
          Object.entries(grouped).map(([gov, people]) => (
            <div key={gov} className="mb-6">
              <h2 className="text-base font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2 text-start">
                {t(`request.governorates.${gov}`)}
              </h2>
              <div className="space-y-3">
                {people.map((person) => (
                  <div
                    key={person.id}
                    className="bg-white rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900 text-sm text-start">
                          {person.fullName}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5 text-start">
                          {person.area}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <a
                        href={`tel:${person.phone}`}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-light transition-colors tap-target"
                      >
                        <span aria-hidden="true">📞</span>
                        {t("contacts.call")}
                      </a>
                      <a
                        href={`https://wa.me/${person.phone.replace(/[^0-9+]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors tap-target"
                      >
                        <span aria-hidden="true">💬</span>
                        {t("contacts.whatsapp")}
                      </a>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 text-center" dir="ltr">
                      {person.phone}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </main>
    </div>
  );
}
