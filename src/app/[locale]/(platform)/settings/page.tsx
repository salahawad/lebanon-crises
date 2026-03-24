"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Settings,
  Shield,
  Bell,
  WifiOff,
  Download,
  MapPin,
  Eye,
  Users,
  Lock,
  Check,
  RefreshCw,
} from "lucide-react";
import type { VisibilityLevel, NotificationChannel, Region } from "@/lib/types/platform";
import { REGIONS } from "@/lib/data/zones";

interface FieldVisibility {
  label: string;
  field: string;
  level: VisibilityLevel;
}

const VISIBILITY_OPTIONS: { value: VisibilityLevel; label: string; icon: React.ElementType }[] = [
  { value: "public", label: "Public", icon: Eye },
  { value: "verified_peers", label: "Verified Peers", icon: Users },
  { value: "private", label: "Private", icon: Lock },
];

const NOTIFICATION_OPTIONS: { value: NotificationChannel; label: string }[] = [
  { value: "push", label: "Push" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "sms", label: "SMS" },
  { value: "all", label: "All" },
];

const INITIAL_FIELDS: FieldVisibility[] = [
  { label: "Organization Name", field: "name", level: "public" },
  { label: "Contact Phone", field: "contactPhone", level: "verified_peers" },
  { label: "Contact Email", field: "contactEmail", level: "verified_peers" },
  { label: "WhatsApp Number", field: "contactWhatsapp", level: "private" },
  { label: "Office Address", field: "officeAddress", level: "verified_peers" },
  { label: "Operational Zones", field: "operationalZones", level: "public" },
  { label: "Sectors", field: "sectors", level: "public" },
  { label: "Capacity Data", field: "capacity", level: "verified_peers" },
];

export default function SettingsPage() {
  const [fields, setFields] = useState<FieldVisibility[]>(INITIAL_FIELDS);
  const [notification, setNotification] = useState<NotificationChannel>("push");
  const [offlineEnabled, setOfflineEnabled] = useState(true);
  const [selectedRegions, setSelectedRegions] = useState<Region[]>([
    "beirut_suburbs",
    "south_lebanon",
  ]);
  const [saved, setSaved] = useState(false);
  const t = useTranslations();

  function updateFieldLevel(field: string, level: VisibilityLevel) {
    setFields((prev) =>
      prev.map((f) => (f.field === field ? { ...f, level } : f))
    );
  }

  function toggleRegion(regionId: Region) {
    setSelectedRegions((prev) =>
      prev.includes(regionId)
        ? prev.filter((r) => r !== regionId)
        : [...prev, regionId]
    );
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  // Simulated last sync time (static placeholder)
  const lastSyncedStr = "12 min ago";

  return (
    <div>
      {/* Coming soon notice */}
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <span aria-hidden="true">&#x1F6A7;</span>
        <span>{t("disclaimer.notReady")}</span>
      </div>

      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#1e3a5f] flex items-center justify-center">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Privacy & Settings</h1>
          <p className="text-sm text-slate-500">Control your data visibility and preferences</p>
        </div>
      </div>

      {/* Section 1: Profile Visibility */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-[#1e3a5f]" />
          <h2 className="text-base font-bold text-slate-900">Profile Visibility</h2>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Control who can see each field of your profile. Changes apply immediately.
        </p>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {fields.map((field) => (
            <div key={field.field} className="px-4 py-3.5">
              <p className="text-sm font-medium text-slate-800 mb-2">
                {field.label}
              </p>
              <div className="flex gap-1.5">
                {VISIBILITY_OPTIONS.map((opt) => {
                  const isActive = field.level === opt.value;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => updateFieldLevel(field.field, opt.value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? opt.value === "public"
                            ? "bg-[#22c55e]/10 text-[#22c55e] ring-1 ring-[#22c55e]/30"
                            : opt.value === "verified_peers"
                            ? "bg-[#e8913a]/10 text-[#e8913a] ring-1 ring-[#e8913a]/30"
                            : "bg-[#ef4444]/10 text-[#ef4444] ring-1 ring-[#ef4444]/30"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: Notification Preferences */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-5 h-5 text-[#1e3a5f]" />
          <h2 className="text-base font-bold text-slate-900">Notification Preferences</h2>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs text-slate-500 mb-3">
            Choose how you want to receive alerts and updates.
          </p>
          <div className="space-y-2">
            {NOTIFICATION_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                  notification === opt.value
                    ? "border-[#1e3a5f] bg-[#1e3a5f]/5"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="notification"
                  value={opt.value}
                  checked={notification === opt.value}
                  onChange={() => setNotification(opt.value)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    notification === opt.value
                      ? "border-[#1e3a5f]"
                      : "border-slate-300"
                  }`}
                >
                  {notification === opt.value && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#1e3a5f]" />
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    notification === opt.value
                      ? "text-[#1e3a5f]"
                      : "text-slate-700"
                  }`}
                >
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Offline Mode */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <WifiOff className="w-5 h-5 text-[#1e3a5f]" />
          <h2 className="text-base font-bold text-slate-900">Offline Mode</h2>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-slate-800">Enable Offline Mode</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Cache critical data for offline access
              </p>
            </div>
            {/* Toggle switch */}
            <button
              onClick={() => setOfflineEnabled(!offlineEnabled)}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                offlineEnabled ? "bg-[#22c55e]" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                  offlineEnabled ? "start-[22px]" : "start-0.5"
                }`}
              />
            </button>
          </div>

          {offlineEnabled && (
            <>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Last synced: {lastSyncedStr}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-[#22c55e]/5 rounded-xl w-fit">
                <Check className="w-4 h-4 text-[#22c55e]" />
                <span className="text-xs font-medium text-[#22c55e]">
                  Full offline — All critical data cached locally
                </span>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Section 4: Multi-Region Selector */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-5 h-5 text-[#1e3a5f]" />
          <h2 className="text-base font-bold text-slate-900">Regions</h2>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs text-slate-500 mb-3">
            Select regions to display data from. You can monitor multiple regions.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {REGIONS.map((region) => {
              const isSelected = selectedRegions.includes(region.id);
              return (
                <button
                  key={region.id}
                  onClick={() => toggleRegion(region.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors ${
                    isSelected
                      ? "border-[#1e3a5f] bg-[#1e3a5f]/5"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? "border-[#1e3a5f] bg-[#1e3a5f]"
                        : "border-slate-300"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        isSelected ? "text-[#1e3a5f]" : "text-slate-700"
                      }`}
                    >
                      {region.nameEn}
                    </p>
                    <p className="text-xs text-slate-400" dir="rtl">
                      {region.nameAr}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 5: Data Export */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Download className="w-5 h-5 text-[#1e3a5f]" />
          <h2 className="text-base font-bold text-slate-900">Data Export</h2>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs text-slate-500 mb-4">
            Download a copy of all your data including profile, capacity cards, and activity history.
          </p>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e3a5f] text-white font-medium text-sm hover:bg-[#2a4d7a] transition-colors"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                Preparing Download...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download My Data
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}
