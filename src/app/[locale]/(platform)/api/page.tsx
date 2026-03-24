"use client";

import { useState } from "react";
import {
  Code,
  Globe,
  Lock,
  ChevronDown,
  ChevronUp,
  Zap,
  Copy,
  Check,
} from "lucide-react";

interface Endpoint {
  method: "GET";
  path: string;
  description: string;
  example: string;
}

const V0_ENDPOINTS: Endpoint[] = [
  {
    method: "GET",
    path: "/api/v0/shelters",
    description: "List all active shelters with capacity and location data. Returns shelters grouped by governorate.",
    example: JSON.stringify(
      {
        data: [
          {
            id: "s1",
            nameEn: "Al-Iman School",
            nameAr: "مدرسة الإيمان",
            governorate: "beirut",
            district: "Tarik Jdide",
            area: "Beirut",
            phone: "+961 1 234 567",
            classrooms: 12,
          },
        ],
        total: 247,
        updatedAt: "2026-03-23T10:00:00Z",
      },
      null,
      2
    ),
  },
  {
    method: "GET",
    path: "/api/v0/needs",
    description: "Active needs board entries sorted by urgency (red > amber > gray). Includes zone, category, and response status.",
    example: JSON.stringify(
      {
        data: [
          {
            id: "n1",
            actorName: "Amel Association",
            category: "medical",
            description: "Urgent need for insulin supplies",
            zone: "bourj_hammoud",
            urgency: "red",
            respondedCount: 0,
            status: "open",
            createdAt: "2026-03-21T08:00:00Z",
          },
        ],
        total: 8,
      },
      null,
      2
    ),
  },
  {
    method: "GET",
    path: "/api/v0/stats",
    description: "Platform-wide statistics including actor counts, coverage gaps, and weekly metrics.",
    example: JSON.stringify(
      {
        totalActors: 12,
        verifiedActors: 8,
        coverageGaps: 6,
        activeNeeds: 8,
        activeAlerts: 3,
        activeCollaborations: 4,
        familiesReachedThisWeek: 1200,
        gapsClosedThisWeek: 12,
        lastUpdated: "2026-03-23T10:00:00Z",
      },
      null,
      2
    ),
  },
];

const V1_ENDPOINTS: Endpoint[] = [
  {
    method: "GET",
    path: "/api/v1/gaps",
    description: "Gap analysis data per zone showing sector coverage, persistent needs, collective shortfalls, and surplus resources.",
    example: JSON.stringify(
      {
        data: [
          {
            zone: "bourj_hammoud",
            sectorCoverage: [
              { sector: "food", actorCount: 3 },
              { sector: "medical", actorCount: 1 },
              { sector: "shelter", actorCount: 0 },
            ],
            persistentNeeds: [
              { sector: "shelter", daysFlagged: 14 },
            ],
            collectiveShortfalls: [
              { resource: "Blankets", actorsFlagged: 2 },
            ],
          },
        ],
      },
      null,
      2
    ),
  },
  {
    method: "GET",
    path: "/api/v1/actors",
    description: "Full actor registry with verification status, sectors, operational zones, and contact details. Respects field-level privacy settings.",
    example: JSON.stringify(
      {
        data: [
          {
            id: "a1",
            name: "Amel Association",
            type: "ngo",
            sectors: ["medical", "psychosocial"],
            operationalZones: ["bourj_hammoud", "sin_el_fil"],
            verificationStatus: "verified",
            vouchCount: 3,
            region: "beirut_suburbs",
          },
        ],
        total: 12,
      },
      null,
      2
    ),
  },
  {
    method: "GET",
    path: "/api/v1/resources",
    description: "Aggregated resource counts per zone and category, with per-actor breakdown and freshness timestamps.",
    example: JSON.stringify(
      {
        data: [
          {
            zone: "bourj_hammoud",
            category: "Meal Kits",
            totalCount: 890,
            actorBreakdown: [
              { actorName: "Amel Association", count: 500, updatedAt: "2026-03-22T14:00:00Z" },
              { actorName: "Bourj Hammoud Municipality", count: 390, updatedAt: "2026-03-21T09:00:00Z" },
            ],
          },
        ],
      },
      null,
      2
    ),
  },
  {
    method: "GET",
    path: "/api/v1/export",
    description: "Export full dataset as CSV or JSON for offline analysis. Supports filters: ?format=csv&zone=bourj_hammoud&sector=food",
    example: JSON.stringify(
      {
        format: "json",
        exportedAt: "2026-03-23T10:00:00Z",
        records: 156,
        downloadUrl: "/api/v1/export/download/exp_abc123",
        expiresAt: "2026-03-23T11:00:00Z",
      },
      null,
      2
    ),
  },
];

function EndpointCard({ endpoint }: { endpoint: Endpoint }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(endpoint.example).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="shrink-0 px-2 py-0.5 rounded-md bg-[#22c55e]/10 text-[#22c55e] text-xs font-bold font-mono">
          {endpoint.method}
        </span>
        <code className="text-sm font-mono text-slate-800 flex-1 truncate">
          {endpoint.path}
        </code>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-slate-100 px-4 py-4">
          <p className="text-sm text-slate-600 mb-3">{endpoint.description}</p>
          <div className="relative">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-slate-400">Example Response</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-100 rounded-xl p-4 overflow-x-auto text-xs leading-relaxed font-mono">
              {endpoint.example}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApiDocsPage() {
  return (
    <div>
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#1e3a5f] flex items-center justify-center">
          <Code className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">API Documentation</h1>
          <p className="text-sm text-slate-500">Programmatic access to platform data</p>
        </div>
      </div>

      {/* Rate limit info */}
      <div className="bg-[#e8913a]/5 border border-[#e8913a]/20 rounded-2xl p-4 mb-6 flex items-start gap-3">
        <Zap className="w-5 h-5 text-[#e8913a] shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-[#e8913a]">Rate Limits</p>
          <div className="text-xs text-slate-600 mt-1 space-y-0.5">
            <p>
              <span className="font-medium">v0 (Public):</span> 100 requests/hour per IP
            </p>
            <p>
              <span className="font-medium">v1 (Authenticated):</span> 1,000 requests/hour per API key
            </p>
          </div>
        </div>
      </div>

      {/* v0 Public Endpoints */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-[#22c55e]" />
          <h2 className="text-base font-bold text-slate-900">v0 — Public API</h2>
        </div>
        <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-[#22c55e]/5 rounded-xl w-fit">
          <Globe className="w-4 h-4 text-[#22c55e]" />
          <span className="text-sm font-medium text-[#22c55e]">
            Public API — No Authentication Required
          </span>
        </div>
        <div className="space-y-3">
          {V0_ENDPOINTS.map((ep) => (
            <EndpointCard key={ep.path} endpoint={ep} />
          ))}
        </div>
      </div>

      {/* v1 Authenticated Endpoints */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-[#1e3a5f]" />
          <h2 className="text-base font-bold text-slate-900">v1 — Authenticated API</h2>
        </div>
        <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-[#1e3a5f]/5 rounded-xl w-fit">
          <Lock className="w-4 h-4 text-[#1e3a5f]" />
          <span className="text-sm font-medium text-[#1e3a5f]">
            Authenticated — API Key Required
          </span>
        </div>

        {/* Auth usage */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-4">
          <p className="text-sm font-semibold text-slate-800 mb-2">Authentication</p>
          <p className="text-xs text-slate-600 mb-2">
            Include your API key in the request header:
          </p>
          <pre className="bg-slate-900 text-slate-100 rounded-xl p-3 overflow-x-auto text-xs font-mono">
{`Authorization: Bearer YOUR_API_KEY`}
          </pre>
        </div>

        <div className="space-y-3">
          {V1_ENDPOINTS.map((ep) => (
            <EndpointCard key={ep.path} endpoint={ep} />
          ))}
        </div>
      </div>

      {/* Base URL */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
        <p className="text-xs text-slate-500">
          <span className="font-semibold">Base URL:</span>{" "}
          <code className="text-[#1e3a5f] font-mono">https://shabaka.app</code>
        </p>
        <p className="text-xs text-slate-400 mt-1">
          All endpoints return JSON. Timestamps are in ISO 8601 format.
        </p>
      </div>
    </div>
  );
}
