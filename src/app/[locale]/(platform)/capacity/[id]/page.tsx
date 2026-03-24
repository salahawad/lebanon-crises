"use client";

import { useState, useEffect, use } from "react";
import { Link } from "@/i18n/navigation";
import {
  ArrowLeft,
  Plus,
  Minus,
  Clock,
  Save,
  AlertTriangle,
  X,
  Info,
} from "lucide-react";
import {
  getCapacityCard,
  getCapacityChanges,
} from "@/lib/data/platform-api";
import { ZONES } from "@/lib/data/zones";
import type { CapacityCard, CapacityChange, StockLevel } from "@/lib/types/platform";

const STOCK_LEVELS: StockLevel[] = ["low", "some", "good"];

const STOCK_COLORS: Record<StockLevel, { active: string; label: string }> = {
  low: { active: "bg-[#ef4444] text-white", label: "Low" },
  some: { active: "bg-[#e8913a] text-white", label: "Some" },
  good: { active: "bg-[#22c55e] text-white", label: "Good" },
};

const AVAILABLE_NEEDS = [
  "antibiotics",
  "bandages",
  "baby_formula",
  "blankets",
  "hygiene_kits",
  "water",
  "rice",
  "lentils",
  "medication",
  "fuel",
  "generators",
  "tents",
];

function relativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

function getZoneName(id: string): string {
  const zone = ZONES.find((z) => z.id === id);
  return zone ? zone.nameEn : id;
}

export default function CapacityEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [card, setCard] = useState<CapacityCard | null>(null);
  const [changes, setChanges] = useState<CapacityChange[]>([]);
  const [loading, setLoading] = useState(true);

  // Local edit state
  const [services, setServices] = useState<
    { serviceId: string; label: string; active: boolean }[]
  >([]);
  const [resources, setResources] = useState<
    { resourceId: string; label: string; count: number }[]
  >([]);
  const [stockLevels, setStockLevels] = useState<Record<string, StockLevel>>({});
  const [urgentNeeds, setUrgentNeeds] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [showNeedSelector, setShowNeedSelector] = useState(false);

  useEffect(() => {
    Promise.all([getCapacityCard(id), getCapacityChanges("")])
      .then(([c, _allChanges]) => {
        if (c) {
          setCard(c);
          setServices(
            c.services.map((s) => ({
              serviceId: s.serviceId,
              label: s.label,
              active: s.active,
            }))
          );
          setResources(
            c.resources.map((r) => ({
              resourceId: r.resourceId,
              label: r.label,
              count: r.count,
            }))
          );
          setStockLevels({ ...c.stockLevels });
          setUrgentNeeds([...c.urgentNeeds]);
          setNote(c.note);
          // Fetch changes for the actual card
          getCapacityChanges(c.id).then(setChanges);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const toggleService = (serviceId: string) => {
    setServices((prev) =>
      prev.map((s) =>
        s.serviceId === serviceId ? { ...s, active: !s.active } : s
      )
    );
  };

  const updateResourceCount = (resourceId: string, delta: number) => {
    setResources((prev) =>
      prev.map((r) =>
        r.resourceId === resourceId
          ? { ...r, count: Math.max(0, r.count + delta) }
          : r
      )
    );
  };

  const updateStockLevel = (item: string, level: StockLevel) => {
    setStockLevels((prev) => ({ ...prev, [item]: level }));
  };

  const toggleNeed = (need: string) => {
    setUrgentNeeds((prev) =>
      prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need]
    );
  };

  const removeNeed = (need: string) => {
    setUrgentNeeds((prev) => prev.filter((n) => n !== need));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="sticky top-0 z-40 bg-[#1e3a5f] text-white">
          <div className="max-w-lg mx-auto md:max-w-4xl px-4 h-14 flex items-center">
            <div className="h-5 bg-white/20 rounded w-40 animate-pulse" />
          </div>
        </header>
        <main className="max-w-lg mx-auto md:max-w-4xl px-4 py-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse shadow-lg"
            >
              <div className="h-5 bg-slate-200 rounded w-1/2 mb-3" />
              <div className="h-4 bg-slate-100 rounded w-full mb-2" />
              <div className="h-4 bg-slate-100 rounded w-2/3" />
            </div>
          ))}
        </main>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="sticky top-0 z-40 bg-[#1e3a5f] text-white">
          <div className="max-w-lg mx-auto md:max-w-4xl px-4 h-14 flex items-center">
            <Link href="/capacity" className="flex items-center gap-2 text-sm">
              <ArrowLeft className="w-4 h-4" />
              Back to Capacity
            </Link>
          </div>
        </header>
        <main className="max-w-lg mx-auto md:max-w-4xl px-4 py-12 text-center">
          <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-lg font-medium text-slate-700">
            No capacity card found
          </p>
          <p className="text-sm text-slate-500 mt-1">
            This actor may not have a capacity card yet.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#1e3a5f] text-white">
        <div className="max-w-lg mx-auto md:max-w-4xl px-4 h-14 flex items-center justify-between">
          <Link href="/capacity" className="flex items-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" />
            Capacity
          </Link>
          <span className="text-sm text-white/70">{card.actorName}</span>
        </div>
      </header>

      <main className="max-w-lg mx-auto md:max-w-4xl px-4 py-4 space-y-4">
        {/* Auto-save notice */}
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-2.5">
          <Info className="w-4 h-4 text-blue-500 shrink-0" />
          <p className="text-xs text-blue-700">
            All changes save instantly. Your capacity card is visible to other
            platform actors.
          </p>
        </div>

        {/* Card header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-lg font-bold text-slate-900">{card.actorName}</h1>
              {card.actorNameAr && (
                <p className="text-sm text-slate-500" dir="rtl">
                  {card.actorNameAr}
                </p>
              )}
            </div>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {getZoneName(card.zone)}
            </span>
          </div>
        </div>

        {/* Service toggles */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-lg">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Services</h2>
          <div className="space-y-3">
            {services.map((svc) => (
              <div
                key={svc.serviceId}
                className="flex items-center justify-between"
              >
                <span
                  className={`text-sm ${
                    svc.active ? "text-slate-800" : "text-slate-400"
                  }`}
                >
                  {svc.label}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={svc.active}
                    onChange={() => toggleService(svc.serviceId)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-[#1e3a5f]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#22c55e]" />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Resource quantities */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-lg">
          <h2 className="text-sm font-bold text-slate-900 mb-4">
            Resource Quantities
          </h2>
          <div className="space-y-3">
            {resources.map((r) => (
              <div
                key={r.resourceId}
                className="flex items-center justify-between"
              >
                <span className="text-sm text-slate-700">{r.label}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateResourceCount(r.resourceId, -1)}
                    className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-slate-900">
                    {r.count}
                  </span>
                  <button
                    onClick={() => updateResourceCount(r.resourceId, 1)}
                    className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stock levels */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-lg">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Stock Levels</h2>
          <div className="space-y-3">
            {Object.entries(stockLevels).map(([item, currentLevel]) => (
              <div key={item}>
                <p className="text-sm text-slate-700 mb-1.5 capitalize">
                  {item.replace(/_/g, " ")}
                </p>
                <div className="flex gap-2">
                  {STOCK_LEVELS.map((level) => (
                    <button
                      key={level}
                      onClick={() => updateStockLevel(item, level)}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                        currentLevel === level
                          ? STOCK_COLORS[level].active
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {STOCK_COLORS[level].label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Urgent needs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900">Urgent Needs</h2>
            <button
              onClick={() => setShowNeedSelector(!showNeedSelector)}
              className="text-xs text-[#1e3a5f] font-medium hover:underline"
            >
              {showNeedSelector ? "Done" : "+ Add Need"}
            </button>
          </div>

          {/* Current needs */}
          {urgentNeeds.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-3">
              {urgentNeeds.map((need) => (
                <span
                  key={need}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                >
                  {need.replace(/_/g, " ")}
                  <button
                    onClick={() => removeNeed(need)}
                    className="hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 mb-3">No urgent needs flagged</p>
          )}

          {/* Need selector */}
          {showNeedSelector && (
            <div className="border border-slate-200 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-2">
                Tap to toggle urgent needs
              </p>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_NEEDS.map((need) => (
                  <button
                    key={need}
                    onClick={() => toggleNeed(need)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      urgentNeeds.includes(need)
                        ? "bg-red-100 text-red-800"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {need.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-lg">
          <h2 className="text-sm font-bold text-slate-900 mb-3">Notes</h2>
          <textarea
            value={note}
            onChange={(e) => {
              if (e.target.value.length <= 140) setNote(e.target.value);
            }}
            placeholder="Add a short note about your current capacity..."
            rows={3}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]"
          />
          <div className="flex justify-end mt-1">
            <span
              className={`text-xs ${
                note.length > 120 ? "text-[#e8913a]" : "text-slate-400"
              }`}
            >
              {note.length}/140
            </span>
          </div>
        </div>

        {/* Recent changes timeline */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-lg">
          <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            Recent Changes
          </h2>
          {changes.length > 0 ? (
            <div className="space-y-0">
              {changes.map((change, idx) => (
                <div key={change.id} className="flex gap-3">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#1e3a5f] shrink-0 mt-1" />
                    {idx < changes.length - 1 && (
                      <div className="w-0.5 flex-1 bg-slate-200" />
                    )}
                  </div>
                  {/* Content */}
                  <div className="pb-4 min-w-0">
                    <p className="text-sm font-medium text-slate-800">
                      {change.field}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      <span className="line-through text-slate-400">
                        {change.oldValue}
                      </span>{" "}
                      &rarr; {change.newValue}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {relativeTime(change.changedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No recent changes recorded</p>
          )}
        </div>
      </main>
    </div>
  );
}
