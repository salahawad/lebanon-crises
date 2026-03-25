"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Building2,
  Phone,
  User,
  Globe,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { ZONES, SECTORS_META } from "@/lib/data/zones";
import type { ActorType, Sector } from "@/lib/types/platform";

const ACTOR_TYPES: { id: ActorType; label: string; labelAr: string }[] = [
  { id: "ngo", label: "NGO", labelAr: "منظمة غير حكومية" },
  { id: "municipality", label: "Municipality", labelAr: "بلدية" },
  { id: "grassroots", label: "Grassroots", labelAr: "مبادرة مجتمعية" },
  { id: "shelter_org", label: "Shelter", labelAr: "مأوى" },
];

const LANGUAGES = [
  { id: "ar" as const, label: "Arabic / العربية" },
  { id: "en" as const, label: "English / الإنجليزية" },
  { id: "fr" as const, label: "French / الفرنسية" },
];

interface FormData {
  organizationName: string;
  type: ActorType | "";
  sectors: Sector[];
  operationalZones: string[];
  contactName: string;
  contactPhone: string;
  language: "ar" | "en" | "fr" | "";
}

interface FormErrors {
  organizationName?: string;
  type?: string;
  sectors?: string;
  operationalZones?: string;
  contactName?: string;
  contactPhone?: string;
  language?: string;
}

export default function IntakeFormPage() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("platform.intake");

  const [form, setForm] = useState<FormData>({
    organizationName: "",
    type: "",
    sectors: [],
    operationalZones: [],
    contactName: "",
    contactPhone: "",
    language: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [zoneSearch, setZoneSearch] = useState("");
  const [zoneDropdownOpen, setZoneDropdownOpen] = useState(false);

  const filteredZones = ZONES.filter(
    (z) =>
      z.nameEn.toLowerCase().includes(zoneSearch.toLowerCase()) ||
      z.nameAr.includes(zoneSearch)
  );

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!form.organizationName.trim()) {
      errs.organizationName = t("orgNameRequired");
    }
    if (!form.type) {
      errs.type = t("selectOrgType");
    }
    if (form.sectors.length === 0) {
      errs.sectors = t("selectOneSector");
    }
    if (form.operationalZones.length === 0) {
      errs.operationalZones = t("selectOneZone");
    }
    if (!form.contactName.trim()) {
      errs.contactName = t("contactNameRequired");
    }
    if (!form.contactPhone.trim()) {
      errs.contactPhone = t("phoneRequired");
    }
    if (!form.language) {
      errs.language = t("selectALanguage");
    }
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    // Simulate submission delay
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1500);
  }

  function toggleSector(sector: Sector) {
    setForm((prev) => ({
      ...prev,
      sectors: prev.sectors.includes(sector)
        ? prev.sectors.filter((s) => s !== sector)
        : [...prev.sectors, sector],
    }));
  }

  function toggleZone(zoneId: string) {
    setForm((prev) => ({
      ...prev,
      operationalZones: prev.operationalZones.includes(zoneId)
        ? prev.operationalZones.filter((z) => z !== zoneId)
        : [...prev.operationalZones, zoneId],
    }));
  }

  function removeZone(zoneId: string) {
    setForm((prev) => ({
      ...prev,
      operationalZones: prev.operationalZones.filter((z) => z !== zoneId),
    }));
  }

  // Success screen
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-green-50 rounded-full p-4 mb-4">
          <CheckCircle2 className="w-12 h-12 text-success" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          {t("submissionReceived")}
        </h2>
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-6 py-3 mt-4 mb-6">
          <p className="text-sm font-semibold text-amber-800">
            {t("statusPendingReview")}
          </p>
        </div>
        <p className="text-sm text-slate-500 max-w-sm">
          {t("orgWillAppear")}
        </p>
        <Link
          href={`/${locale}/platform`}
          className="mt-6 inline-flex items-center gap-2 bg-primary text-white rounded-lg px-6 py-3 font-semibold hover:bg-primary-dark transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("backToDashboard")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          {t("title")}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {t("subtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Organization Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            {t("orgName")}
            <span className="text-danger ms-1">*</span>
          </label>
          <div className="relative">
            <Building2 className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={form.organizationName}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  organizationName: e.target.value,
                }))
              }
              placeholder={t("orgNamePlaceholder")}
              className={`w-full ps-10 pe-4 py-3 rounded-xl border bg-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                errors.organizationName
                  ? "border-danger"
                  : "border-slate-200"
              }`}
            />
          </div>
          {errors.organizationName && (
            <p className="text-xs text-danger mt-1">
              {errors.organizationName}
            </p>
          )}
        </div>

        {/* Organization Type */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            {t("type")}
            <span className="text-danger ms-1">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {ACTOR_TYPES.map((actorType) => (
              <label
                key={actorType.id}
                className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${
                  form.type === actorType.id
                    ? "border-primary bg-primary/5"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={actorType.id}
                  checked={form.type === actorType.id}
                  onChange={() => setForm((prev) => ({ ...prev, type: actorType.id }))}
                  className="accent-primary"
                />
                <div>
                  <span className="text-sm font-medium text-slate-700">
                    {locale === "ar" ? actorType.labelAr : actorType.label}
                  </span>
                </div>
              </label>
            ))}
          </div>
          {errors.type && (
            <p className="text-xs text-danger mt-1">{errors.type}</p>
          )}
        </div>

        {/* Sectors */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            {t("primarySectors")}
            <span className="text-danger ms-1">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SECTORS_META.map((sector) => {
              const checked = form.sectors.includes(sector.id as Sector);
              return (
                <label
                  key={sector.id}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                    checked
                      ? "border-primary bg-primary/5"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSector(sector.id as Sector)}
                    className="accent-primary rounded"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: sector.color }}
                      />
                      <span className="text-xs font-medium text-slate-700 truncate">
                        {locale === "ar" ? sector.nameAr : sector.nameEn}
                      </span>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
          {errors.sectors && (
            <p className="text-xs text-danger mt-1">{errors.sectors}</p>
          )}
        </div>

        {/* Operational Zones */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            {t("operationalZones")}
            <span className="text-danger ms-1">*</span>
          </label>

          {/* Selected zones */}
          {form.operationalZones.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.operationalZones.map((zoneId) => {
                const zone = ZONES.find((z) => z.id === zoneId);
                return (
                  <span
                    key={zoneId}
                    className="inline-flex items-center gap-1 bg-primary/10 text-primary rounded-full px-2.5 py-1 text-xs font-medium"
                  >
                    {locale === "ar" ? (zone?.nameAr || zoneId) : (zone?.nameEn || zoneId)}
                    <button
                      type="button"
                      onClick={() => removeZone(zoneId)}
                      className="hover:text-danger transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {/* Searchable dropdown */}
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={zoneSearch}
              onChange={(e) => {
                setZoneSearch(e.target.value);
                setZoneDropdownOpen(true);
              }}
              onFocus={() => setZoneDropdownOpen(true)}
              placeholder={t("searchZones")}
              className={`w-full ps-10 pe-4 py-3 rounded-xl border bg-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                errors.operationalZones
                  ? "border-danger"
                  : "border-slate-200"
              }`}
            />
            {zoneDropdownOpen && (
              <div className="absolute z-10 top-full inset-x-0 mt-1 bg-white border border-slate-200 rounded-xl max-h-48 overflow-y-auto">
                {filteredZones.map((zone) => {
                  const selected = form.operationalZones.includes(zone.id);
                  return (
                    <button
                      key={zone.id}
                      type="button"
                      onClick={() => {
                        toggleZone(zone.id);
                        setZoneSearch("");
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors flex items-center justify-between ${
                        selected ? "bg-primary/5" : ""
                      }`}
                    >
                      <span>
                        {locale === "ar" ? zone.nameAr : zone.nameEn}
                      </span>
                      {selected && (
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      )}
                    </button>
                  );
                })}
                {filteredZones.length === 0 && (
                  <p className="px-4 py-3 text-sm text-slate-400">
                    {t("noZonesFound")}
                  </p>
                )}
              </div>
            )}
          </div>
          {/* Close dropdown when clicking outside */}
          {zoneDropdownOpen && (
            <div
              className="fixed inset-0 z-0"
              onClick={() => setZoneDropdownOpen(false)}
            />
          )}
          {errors.operationalZones && (
            <p className="text-xs text-danger mt-1">
              {errors.operationalZones}
            </p>
          )}
        </div>

        {/* Contact Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            {t("contactName")}
            <span className="text-danger ms-1">*</span>
          </label>
          <div className="relative">
            <User className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={form.contactName}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, contactName: e.target.value }))
              }
              placeholder={t("contactNamePlaceholder")}
              className={`w-full ps-10 pe-4 py-3 rounded-xl border bg-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                errors.contactName ? "border-danger" : "border-slate-200"
              }`}
            />
          </div>
          {errors.contactName && (
            <p className="text-xs text-danger mt-1">{errors.contactName}</p>
          )}
        </div>

        {/* Contact Phone */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            {t("phoneNumber")}
            <span className="text-danger ms-1">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="tel"
              value={form.contactPhone}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, contactPhone: e.target.value }))
              }
              placeholder="+961 XX XXX XXX"
              className={`w-full ps-10 pe-4 py-3 rounded-xl border bg-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                errors.contactPhone ? "border-danger" : "border-slate-200"
              }`}
            />
          </div>
          {errors.contactPhone && (
            <p className="text-xs text-danger mt-1">
              {errors.contactPhone}
            </p>
          )}
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            {t("preferredLanguage")}
            <span className="text-danger ms-1">*</span>
          </label>
          <div className="relative">
            <Globe className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={form.language}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  language: e.target.value as "ar" | "en" | "fr" | "",
                }))
              }
              className={`w-full ps-10 pe-4 py-3 rounded-xl border bg-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none ${
                errors.language ? "border-danger" : "border-slate-200"
              } ${!form.language ? "text-slate-400" : "text-slate-700"}`}
            >
              <option value="">{t("selectLanguage")}</option>
              {LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
          {errors.language && (
            <p className="text-xs text-danger mt-1">{errors.language}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-accent text-white rounded-lg py-3.5 px-4 font-bold text-base hover:bg-accent-light disabled:opacity-60 transition-colors tap-target flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t("submitting")}
            </>
          ) : (
            t("submitRegistration")
          )}
        </button>

        <p className="text-center text-[10px] text-slate-400">
          {t("allSubmissionsReviewed")}
        </p>
      </form>
    </div>
  );
}
