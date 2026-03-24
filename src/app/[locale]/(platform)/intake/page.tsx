"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const locale = pathname.split("/")[1] || "en";

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
      errs.organizationName = "Organization name is required / اسم المنظمة مطلوب";
    }
    if (!form.type) {
      errs.type = "Select an organization type / اختر نوع المنظمة";
    }
    if (form.sectors.length === 0) {
      errs.sectors = "Select at least one sector / اختر قطاعاً واحداً على الأقل";
    }
    if (form.operationalZones.length === 0) {
      errs.operationalZones = "Select at least one zone / اختر منطقة واحدة على الأقل";
    }
    if (!form.contactName.trim()) {
      errs.contactName = "Contact name is required / اسم جهة الاتصال مطلوب";
    }
    if (!form.contactPhone.trim()) {
      errs.contactPhone = "Phone number is required / رقم الهاتف مطلوب";
    }
    if (!form.language) {
      errs.language = "Select a language / اختر لغة";
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
          <CheckCircle2 className="w-12 h-12 text-[#22c55e]" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Submission Received!
        </h2>
        <p className="text-lg text-slate-600 mb-1">تم استلام الطلب!</p>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-3 mt-4 mb-6">
          <p className="text-sm font-semibold text-amber-800">
            Status: Pending Review
          </p>
          <p className="text-xs text-amber-600 mt-0.5">
            الحالة: قيد المراجعة
          </p>
        </div>
        <p className="text-sm text-slate-500 max-w-sm">
          Your organization will appear in the directory once verified by peer
          organizations.
        </p>
        <p className="text-sm text-slate-400 mt-1 max-w-sm">
          ستظهر منظمتك في الدليل بعد التحقق من قبل المنظمات الأخرى.
        </p>
        <Link
          href={`/${locale}/platform`}
          className="mt-6 inline-flex items-center gap-2 bg-[#1e3a5f] text-white rounded-2xl px-6 py-3 font-semibold hover:bg-[#2d5a8e] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard / العودة للوحة التحكم
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Register Your Organization
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          سجّل منظمتك — Join the coordination network
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Organization Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Organization Name <span className="text-slate-400">/ اسم المنظمة</span>
            <span className="text-[#ef4444] ms-1">*</span>
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
              placeholder="e.g. Saida Relief Network / شبكة إغاثة صيدا"
              className={`w-full ps-10 pe-4 py-3 rounded-xl border bg-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 ${
                errors.organizationName
                  ? "border-[#ef4444]"
                  : "border-slate-200"
              }`}
            />
          </div>
          {errors.organizationName && (
            <p className="text-xs text-[#ef4444] mt-1">
              {errors.organizationName}
            </p>
          )}
        </div>

        {/* Organization Type */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Type <span className="text-slate-400">/ النوع</span>
            <span className="text-[#ef4444] ms-1">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {ACTOR_TYPES.map((t) => (
              <label
                key={t.id}
                className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${
                  form.type === t.id
                    ? "border-[#1e3a5f] bg-[#1e3a5f]/5"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={t.id}
                  checked={form.type === t.id}
                  onChange={() => setForm((prev) => ({ ...prev, type: t.id }))}
                  className="accent-[#1e3a5f]"
                />
                <div>
                  <span className="text-sm font-medium text-slate-700">
                    {t.label}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {t.labelAr}
                  </span>
                </div>
              </label>
            ))}
          </div>
          {errors.type && (
            <p className="text-xs text-[#ef4444] mt-1">{errors.type}</p>
          )}
        </div>

        {/* Sectors */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Primary Sectors{" "}
            <span className="text-slate-400">/ القطاعات الأساسية</span>
            <span className="text-[#ef4444] ms-1">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SECTORS_META.map((sector) => {
              const checked = form.sectors.includes(sector.id as Sector);
              return (
                <label
                  key={sector.id}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                    checked
                      ? "border-[#1e3a5f] bg-[#1e3a5f]/5"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSector(sector.id as Sector)}
                    className="accent-[#1e3a5f] rounded"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: sector.color }}
                      />
                      <span className="text-xs font-medium text-slate-700 truncate">
                        {sector.nameEn}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {sector.nameAr}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
          {errors.sectors && (
            <p className="text-xs text-[#ef4444] mt-1">{errors.sectors}</p>
          )}
        </div>

        {/* Operational Zones */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Operational Zones{" "}
            <span className="text-slate-400">/ مناطق العمل</span>
            <span className="text-[#ef4444] ms-1">*</span>
          </label>

          {/* Selected zones */}
          {form.operationalZones.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.operationalZones.map((zoneId) => {
                const zone = ZONES.find((z) => z.id === zoneId);
                return (
                  <span
                    key={zoneId}
                    className="inline-flex items-center gap-1 bg-[#1e3a5f]/10 text-[#1e3a5f] rounded-full px-2.5 py-1 text-xs font-medium"
                  >
                    {zone?.nameEn || zoneId}
                    <button
                      type="button"
                      onClick={() => removeZone(zoneId)}
                      className="hover:text-[#ef4444] transition-colors"
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
              placeholder="Search zones... / ابحث عن المناطق..."
              className={`w-full ps-10 pe-4 py-3 rounded-xl border bg-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 ${
                errors.operationalZones
                  ? "border-[#ef4444]"
                  : "border-slate-200"
              }`}
            />
            {zoneDropdownOpen && (
              <div className="absolute z-10 top-full inset-x-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
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
                        selected ? "bg-[#1e3a5f]/5" : ""
                      }`}
                    >
                      <span>
                        {zone.nameEn}{" "}
                        <span className="text-slate-400 text-xs">
                          {zone.nameAr}
                        </span>
                      </span>
                      {selected && (
                        <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
                      )}
                    </button>
                  );
                })}
                {filteredZones.length === 0 && (
                  <p className="px-4 py-3 text-sm text-slate-400">
                    No zones found / لم يتم العثور على مناطق
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
            <p className="text-xs text-[#ef4444] mt-1">
              {errors.operationalZones}
            </p>
          )}
        </div>

        {/* Contact Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Contact Name{" "}
            <span className="text-slate-400">/ اسم جهة الاتصال</span>
            <span className="text-[#ef4444] ms-1">*</span>
          </label>
          <div className="relative">
            <User className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={form.contactName}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, contactName: e.target.value }))
              }
              placeholder="Full name / الاسم الكامل"
              className={`w-full ps-10 pe-4 py-3 rounded-xl border bg-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 ${
                errors.contactName ? "border-[#ef4444]" : "border-slate-200"
              }`}
            />
          </div>
          {errors.contactName && (
            <p className="text-xs text-[#ef4444] mt-1">{errors.contactName}</p>
          )}
        </div>

        {/* Contact Phone */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Phone Number <span className="text-slate-400">/ رقم الهاتف</span>
            <span className="text-[#ef4444] ms-1">*</span>
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
              className={`w-full ps-10 pe-4 py-3 rounded-xl border bg-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 ${
                errors.contactPhone ? "border-[#ef4444]" : "border-slate-200"
              }`}
            />
          </div>
          {errors.contactPhone && (
            <p className="text-xs text-[#ef4444] mt-1">
              {errors.contactPhone}
            </p>
          )}
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Preferred Language{" "}
            <span className="text-slate-400">/ اللغة المفضلة</span>
            <span className="text-[#ef4444] ms-1">*</span>
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
              className={`w-full ps-10 pe-4 py-3 rounded-xl border bg-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 appearance-none ${
                errors.language ? "border-[#ef4444]" : "border-slate-200"
              } ${!form.language ? "text-slate-400" : "text-slate-700"}`}
            >
              <option value="">Select language / اختر اللغة</option>
              {LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
          {errors.language && (
            <p className="text-xs text-[#ef4444] mt-1">{errors.language}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#e8913a] text-white rounded-2xl py-3.5 px-4 font-bold text-base shadow-lg hover:bg-[#f0a85c] disabled:opacity-60 transition-colors tap-target flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting... / جار الإرسال...
            </>
          ) : (
            "Submit Registration / تقديم التسجيل"
          )}
        </button>

        <p className="text-center text-[10px] text-slate-400">
          All submissions are reviewed before publication.
          <br />
          يتم مراجعة جميع الطلبات قبل النشر.
        </p>
      </form>
    </div>
  );
}
