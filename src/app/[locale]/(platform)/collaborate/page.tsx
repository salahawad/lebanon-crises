"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Handshake,
  ArrowRight,
  Check,
  X,
  Clock,
  Truck,
  Users,
  Lightbulb,
  ArrowRightLeft,
  Calendar,
} from "lucide-react";
import { getCollaborations, getJointOperations } from "@/lib/data/platform-api";
import type {
  CollaborationRequest,
  JointOperation,
  CollabStatus,
} from "@/lib/types/platform";
import { getSectorName, getSectorColor } from "@/lib/data/zones";

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

const STATUS_STYLES: Record<
  CollabStatus,
  { bg: string; text: string; label: string }
> = {
  proposed: { bg: "bg-amber-100", text: "text-amber-700", label: "Proposed" },
  accepted: {
    bg: "bg-green-100",
    text: "text-green-700",
    label: "Accepted",
  },
  declined: { bg: "bg-red-100", text: "text-red-700", label: "Declined" },
  completed: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    label: "Completed",
  },
};

const LOGISTICS_LABELS: Record<string, string> = {
  pickup: "Pickup",
  delivery: "Delivery",
  onsite: "On-site",
};

function CollabCard({
  collab,
  onAccept,
  onDecline,
}: {
  collab: CollaborationRequest;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}) {
  const status = STATUS_STYLES[collab.status];
  const sectorColor = getSectorColor(collab.offering);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      {/* From -> To */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-sm font-semibold text-[#1e3a5f]">
          {collab.fromActorName}
        </span>
        <ArrowRightLeft className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <span className="text-sm font-semibold text-[#1e3a5f]">
          {collab.toActorName}
        </span>
      </div>

      {/* Offering detail */}
      <p className="text-sm text-slate-700 mb-3">{collab.offeringDetail}</p>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-3">
        <span
          className="font-medium px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: `${sectorColor}18`,
            color: sectorColor,
          }}
        >
          {getSectorName(collab.offering, "en")}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {collab.timeframe}
        </span>
        <span className="flex items-center gap-1">
          <Truck className="w-3.5 h-3.5" />
          {LOGISTICS_LABELS[collab.logistics]}
        </span>
      </div>

      {/* Status + actions */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}
          >
            {status.label}
          </span>
          <span className="text-xs text-slate-400">
            {timeAgo(collab.createdAt)}
          </span>
        </div>
        {collab.status === "proposed" && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onAccept(collab.id)}
              className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-[#22c55e] text-white hover:bg-green-600 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Accept
            </button>
            <button
              onClick={() => onDecline(collab.id)}
              className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Decline
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function OperationCard({ op }: { op: JointOperation }) {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";

  const statusStyle =
    op.status === "active"
      ? { bg: "bg-green-100", text: "text-green-700", label: "Active" }
      : op.status === "completed"
      ? { bg: "bg-blue-100", text: "text-blue-700", label: "Completed" }
      : { bg: "bg-slate-100", text: "text-slate-500", label: "Cancelled" };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      {/* Title + status */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-bold text-[#1e3a5f]">{op.title}</h3>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${statusStyle.bg} ${statusStyle.text}`}
        >
          {statusStyle.label}
        </span>
      </div>

      {/* Participating actors */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
        <Users className="w-3.5 h-3.5" />
        <span>{op.actorNames.join(", ")}</span>
      </div>

      {/* Created date */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
        <Calendar className="w-3.5 h-3.5" />
        <span>Created {formatDate(op.createdAt)}</span>
      </div>

      {/* View task board link */}
      {op.status === "active" && (
        <Link
          href={`/${locale}/collaborate/${op.id}`}
          className="flex items-center gap-1.5 text-sm font-medium text-[#1e3a5f] hover:text-[#e8913a] transition-colors"
        >
          View Task Board
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

// Suggested matches (hardcoded illustrative examples)
const SUGGESTED_MATCHES = [
  {
    id: "sm1",
    from: "Zahle Medical Relief",
    fromDetail: "has medication surplus",
    to: "Amel Association",
    toDetail: "needs antibiotics",
    sector: "medical" as const,
  },
  {
    id: "sm2",
    from: "Tripoli Aid Hub",
    fromDetail: "has logistics capacity",
    to: "Nabatieh Relief Committee",
    toDetail: "needs food transport",
    sector: "logistics" as const,
  },
  {
    id: "sm3",
    from: "YWCA Lebanon",
    fromDetail: "has counselors available",
    to: "Baalbek Aid Society",
    toDetail: "needs psychosocial support",
    sector: "psychosocial" as const,
  },
];

export default function CollaboratePage() {
  const [tab, setTab] = useState<"matches" | "operations">("matches");
  const [collabs, setCollabs] = useState<CollaborationRequest[]>([]);
  const [operations, setOperations] = useState<JointOperation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [collabData, opData] = await Promise.all([
        getCollaborations(),
        getJointOperations(),
      ]);
      setCollabs(collabData);
      setOperations(opData);
      setLoading(false);
    }
    load();
  }, []);

  function handleAccept(id: string) {
    setCollabs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "accepted" as const } : c))
    );
  }

  function handleDecline(id: string) {
    setCollabs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "declined" as const } : c))
    );
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto md:max-w-4xl">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border p-4 animate-pulse"
            >
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-slate-100 rounded w-full mb-2" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto md:max-w-4xl">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1e3a5f]">
            Collaboration System
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Coordinate joint operations between actors
          </p>
        </div>
        <Handshake className="w-6 h-6 text-[#e8913a]" />
      </div>

      {/* Tab switcher */}
      <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
        <button
          onClick={() => setTab("matches")}
          className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors ${
            tab === "matches"
              ? "bg-white text-[#1e3a5f] shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Matches
        </button>
        <button
          onClick={() => setTab("operations")}
          className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors ${
            tab === "operations"
              ? "bg-white text-[#1e3a5f] shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Active Operations
        </button>
      </div>

      {/* Matches tab */}
      {tab === "matches" && (
        <div>
          {/* Collaboration requests */}
          <h2 className="text-sm font-semibold text-[#1e3a5f] uppercase tracking-wider mb-3">
            Collaboration Requests
          </h2>
          <div className="space-y-3 mb-8">
            {collabs.map((c) => (
              <CollabCard
                key={c.id}
                collab={c}
                onAccept={handleAccept}
                onDecline={handleDecline}
              />
            ))}
          </div>

          {/* Suggested matches */}
          <h2 className="text-sm font-semibold text-[#e8913a] uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4" />
            Suggested Matches
          </h2>
          <div className="space-y-3">
            {SUGGESTED_MATCHES.map((match) => {
              const sectorColor = getSectorColor(match.sector);
              return (
                <div
                  key={match.id}
                  className="rounded-2xl border border-dashed border-[#e8913a]/40 bg-orange-50/50 p-4"
                >
                  <div className="flex items-start gap-2">
                    <ArrowRightLeft className="w-4 h-4 text-[#e8913a] mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-slate-700">
                        <span className="font-semibold text-[#1e3a5f]">
                          {match.from}
                        </span>{" "}
                        <span className="text-slate-500">
                          {match.fromDetail}
                        </span>
                        <span className="mx-1.5 text-[#e8913a]">&rarr;</span>
                        <span className="font-semibold text-[#1e3a5f]">
                          {match.to}
                        </span>{" "}
                        <span className="text-slate-500">
                          {match.toDetail}
                        </span>
                      </p>
                      <span
                        className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-2"
                        style={{
                          backgroundColor: `${sectorColor}18`,
                          color: sectorColor,
                        }}
                      >
                        {getSectorName(match.sector, "en")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Operations tab */}
      {tab === "operations" && (
        <div>
          {operations.length > 0 ? (
            <div className="space-y-3">
              {operations.map((op) => (
                <OperationCard key={op.id} op={op} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <Handshake className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">
                No active operations yet
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
