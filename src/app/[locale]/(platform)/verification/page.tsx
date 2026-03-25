"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Shield,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  Star,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { getActors, getVouchesForActor } from "@/lib/data/platform-api";
import type { Actor, Vouch } from "@/lib/types/platform";

const ACTOR_TYPE_LABELS: Record<string, string> = {
  ngo: "NGO",
  municipality: "Municipality",
  grassroots: "Grassroots",
  shelter_org: "Shelter Org",
};

// Founding cohort: the first verified actors (created >60 days ago with verification)
const FOUNDING_THRESHOLD_DAYS = 60;

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

function isFoundingCohort(actor: Actor): boolean {
  const daysSinceCreation = (Date.now() - actor.createdAt) / 86400000;
  return (
    actor.verificationStatus === "verified" &&
    daysSinceCreation >= FOUNDING_THRESHOLD_DAYS
  );
}

interface ActorWithVouches {
  actor: Actor;
  vouches: Vouch[];
}

export default function VerificationPage() {
  const [actors, setActors] = useState<Actor[]>([]);
  const [vouchMap, setVouchMap] = useState<Record<string, Vouch[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    verified: true,
    provisional: true,
    pending: true,
  });

  useEffect(() => {
    getActors()
      .then(async (actorsList) => {
        setActors(actorsList);
        // Load vouches for all actors
        const vouchResults = await Promise.all(
          actorsList.map(async (a) => ({
            actorId: a.id,
            vouches: await getVouchesForActor(a.id),
          }))
        );
        const map: Record<string, Vouch[]> = {};
        vouchResults.forEach((r) => {
          map[r.actorId] = r.vouches;
        });
        setVouchMap(map);
      })
      .finally(() => setLoading(false));
  }, []);

  const { verified, provisional, pending } = useMemo(() => {
    const verified: ActorWithVouches[] = [];
    const provisional: ActorWithVouches[] = [];
    const pending: ActorWithVouches[] = [];

    actors.forEach((actor) => {
      const item = { actor, vouches: vouchMap[actor.id] || [] };
      switch (actor.verificationStatus) {
        case "verified":
          verified.push(item);
          break;
        case "provisional":
          provisional.push(item);
          break;
        case "pending":
          pending.push(item);
          break;
      }
    });

    return { verified, provisional, pending };
  }, [actors, vouchMap]);

  const toggleSection = (section: "verified" | "provisional" | "pending") => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-primary text-white">
        <div className="max-w-lg mx-auto md:max-w-4xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent" />
            <h1 className="text-base font-bold">Peer Verification</h1>
          </div>
          <span className="text-sm text-white/70">Trust Network</span>
        </div>
      </header>

      <main className="max-w-lg mx-auto md:max-w-4xl px-4 py-4 space-y-4">
        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <CheckCircle2 className="w-4 h-4 text-success" />
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {verified.length}
              </p>
              <p className="text-xs text-slate-500">Verified</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Clock className="w-4 h-4 text-accent" />
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {provisional.length}
              </p>
              <p className="text-xs text-slate-500">Provisional</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <AlertCircle className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {pending.length}
              </p>
              <p className="text-xs text-slate-500">Pending</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-slate-200 p-5 animate-pulse"
              >
                <div className="h-5 bg-slate-200 rounded w-1/3 mb-3" />
                <div className="h-4 bg-slate-100 rounded w-full mb-2" />
                <div className="h-4 bg-slate-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Verified section */}
            <div className="bg-white rounded-lg border border-green-200 overflow-hidden">
              <button
                onClick={() => toggleSection("verified")}
                className="w-full flex items-center justify-between p-5"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <h2 className="text-sm font-bold text-slate-900">
                    Verified Organizations
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {verified.length}
                  </span>
                </div>
                {expandedSections.verified ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>
              {expandedSections.verified && (
                <div className="px-5 pb-5 space-y-3 border-t border-green-100 pt-3">
                  <p className="text-xs text-slate-500">
                    3+ vouches from verified peers
                  </p>
                  {verified.map(({ actor, vouches }) => (
                    <div
                      key={actor.id}
                      className="bg-slate-50 rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900 text-sm truncate">
                              {actor.name}
                            </h3>
                            {isFoundingCohort(actor) && (
                              <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                <Star className="w-3 h-3" />
                                Founding Cohort
                              </span>
                            )}
                          </div>
                          {actor.nameAr && (
                            <p
                              className="text-xs text-slate-500 truncate"
                              dir="rtl"
                            >
                              {actor.nameAr}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {ACTOR_TYPE_LABELS[actor.type]}
                        </span>
                      </div>

                      {/* Vouch count */}
                      <div className="flex items-center gap-1.5 mb-2">
                        <Users className="w-3.5 h-3.5 text-success" />
                        <span className="text-xs font-medium text-slate-700">
                          {actor.vouchCount} vouches
                        </span>
                      </div>

                      {/* Vouch chain */}
                      {vouches.length > 0 && (
                        <div className="flex items-start gap-1.5">
                          <span className="text-xs text-slate-500 shrink-0 mt-0.5">
                            Vouched for by:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {vouches.map((v) => (
                              <span
                                key={v.id}
                                className="px-2 py-0.5 rounded-full text-xs bg-green-50 text-green-700 font-medium"
                              >
                                {v.voucherName}
                              </span>
                            ))}
                            {actor.vouchCount > vouches.length && (
                              <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-500">
                                +{actor.vouchCount - vouches.length} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Provisional section */}
            <div className="bg-white rounded-lg border border-amber-200 overflow-hidden">
              <button
                onClick={() => toggleSection("provisional")}
                className="w-full flex items-center justify-between p-5"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent" />
                  <h2 className="text-sm font-bold text-slate-900">
                    Provisional
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    {provisional.length}
                  </span>
                </div>
                {expandedSections.provisional ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>
              {expandedSections.provisional && (
                <div className="px-5 pb-5 space-y-3 border-t border-amber-100 pt-3">
                  <p className="text-xs text-slate-500">
                    1 vouch received &mdash; needs 2 more for full verification
                  </p>
                  {provisional.length === 0 ? (
                    <p className="text-sm text-slate-400">
                      No provisional actors
                    </p>
                  ) : (
                    provisional.map(({ actor, vouches }) => (
                      <div
                        key={actor.id}
                        className="bg-slate-50 rounded-xl p-4"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-slate-900 text-sm truncate">
                              {actor.name}
                            </h3>
                            {actor.nameAr && (
                              <p
                                className="text-xs text-slate-500 truncate"
                                dir="rtl"
                              >
                                {actor.nameAr}
                              </p>
                            )}
                          </div>
                          <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {ACTOR_TYPE_LABELS[actor.type]}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 mb-2">
                          <Users className="w-3.5 h-3.5 text-accent" />
                          <span className="text-xs font-medium text-slate-700">
                            {actor.vouchCount} vouch
                          </span>
                        </div>

                        {/* Vouch chain */}
                        {vouches.length > 0 && (
                          <div className="flex items-start gap-1.5">
                            <span className="text-xs text-slate-500 shrink-0 mt-0.5">
                              Vouched for by:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {vouches.map((v) => (
                                <span
                                  key={v.id}
                                  className="px-2 py-0.5 rounded-full text-xs bg-amber-50 text-amber-700 font-medium"
                                >
                                  {v.voucherName}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Progress bar */}
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>{actor.vouchCount}/3 vouches</span>
                            <span>
                              {3 - actor.vouchCount} more needed
                            </span>
                          </div>
                          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent rounded-full"
                              style={{
                                width: `${(actor.vouchCount / 3) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Pending section */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <button
                onClick={() => toggleSection("pending")}
                className="w-full flex items-center justify-between p-5"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-slate-400" />
                  <h2 className="text-sm font-bold text-slate-900">Pending</h2>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                    {pending.length}
                  </span>
                </div>
                {expandedSections.pending ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>
              {expandedSections.pending && (
                <div className="px-5 pb-5 space-y-3 border-t border-slate-100 pt-3">
                  <p className="text-xs text-slate-500">
                    0 vouches &mdash; awaiting first peer verification
                  </p>
                  {pending.length === 0 ? (
                    <p className="text-sm text-slate-400">
                      No pending actors
                    </p>
                  ) : (
                    pending.map(({ actor }) => (
                      <div
                        key={actor.id}
                        className="bg-slate-50 rounded-xl p-4"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-slate-900 text-sm truncate">
                              {actor.name}
                            </h3>
                            {actor.nameAr && (
                              <p
                                className="text-xs text-slate-500 truncate"
                                dir="rtl"
                              >
                                {actor.nameAr}
                              </p>
                            )}
                          </div>
                          <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {ACTOR_TYPE_LABELS[actor.type]}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs text-slate-500">
                            No vouches yet &mdash; awaiting peer verification
                          </span>
                        </div>

                        {/* Empty progress bar */}
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>0/3 vouches</span>
                            <span>3 needed</span>
                          </div>
                          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-slate-400 rounded-full"
                              style={{ width: "0%" }}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
