"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  Send,
  CheckCircle,
  AlertTriangle,
  Clock,
  ChevronDown,
  UserX,
} from "lucide-react";
import { getCommunityFeedback } from "@/lib/data/platform-api";
import type { CommunityFeedback, FeedbackType } from "@/lib/types/platform";
import { getZoneName, ZONES } from "@/lib/data/zones";

const SERVICE_TYPES: { value: FeedbackType; label: string }[] = [
  { value: "food", label: "Food" },
  { value: "medical", label: "Medical" },
  { value: "shelter", label: "Shelter" },
  { value: "psychosocial", label: "Psychosocial" },
  { value: "other", label: "Other" },
];

const MAX_CHARS = 300;

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return "Just now";
}

export default function FeedbackPage() {
  const [feedbackList, setFeedbackList] = useState<CommunityFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [serviceType, setServiceType] = useState<FeedbackType | "">("");
  const [zone, setZone] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getCommunityFeedback()
      .then(setFeedbackList)
      .finally(() => setLoading(false));
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!serviceType || !zone || !feedbackText.trim()) return;
    setSubmitting(true);
    // Simulate submission delay
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      // Reset form after showing success
      setTimeout(() => {
        setSubmitted(false);
        setServiceType("");
        setZone("");
        setFeedbackText("");
      }, 3000);
    }, 800);
  }

  const charCount = feedbackText.length;
  const isValid = serviceType !== "" && zone !== "" && feedbackText.trim().length > 0;

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#1e3a5f] flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Community Feedback</h1>
          <p className="text-sm text-slate-500">Share your experience anonymously</p>
        </div>
      </div>

      {/* Anonymous badge */}
      <div className="flex items-center gap-2 mb-6 px-3 py-2 bg-slate-100 rounded-xl w-fit">
        <UserX className="w-4 h-4 text-slate-500" />
        <span className="text-sm font-medium text-slate-600">
          Anonymous
        </span>
        <span className="text-xs text-slate-400">|</span>
        <span className="text-sm text-slate-500" dir="rtl">
          لا حاجة لحساب
        </span>
      </div>

      {/* Submission form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-8">
        {submitted ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full bg-[#22c55e]/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-[#22c55e]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Thank you!</h3>
            <p className="text-sm text-slate-500">
              Your feedback has been submitted anonymously and will be reviewed.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-base font-semibold text-slate-800 mb-1">Submit Feedback</h2>

            {/* Service type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Service Type
              </label>
              <div className="relative">
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value as FeedbackType)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-base appearance-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f] focus:outline-none transition-colors"
                >
                  <option value="" disabled>
                    Select service type...
                  </option>
                  {SERVICE_TYPES.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Zone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Zone
              </label>
              <div className="relative">
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-base appearance-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f] focus:outline-none transition-colors"
                >
                  <option value="" disabled>
                    Select zone...
                  </option>
                  {ZONES.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.nameEn}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Feedback text */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Your Feedback
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_CHARS) {
                    setFeedbackText(e.target.value);
                  }
                }}
                placeholder="Describe your experience or concern..."
                rows={4}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-base placeholder:text-slate-400 focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f] focus:outline-none transition-colors resize-none"
              />
              <div className="flex justify-end mt-1">
                <span
                  className={`text-xs ${
                    charCount > MAX_CHARS * 0.9
                      ? "text-[#e8913a] font-medium"
                      : "text-slate-400"
                  }`}
                >
                  {charCount}/{MAX_CHARS}
                </span>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={!isValid || submitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#1e3a5f] text-white font-medium text-base hover:bg-[#2a4d7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Feedback
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Received feedback (demo admin view) */}
      <div className="mb-2">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Received Feedback</h2>
        <p className="text-xs text-slate-400 mb-4">Admin view — for demonstration</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/3 mb-3" />
              <div className="h-3 bg-slate-200 rounded w-full mb-2" />
              <div className="h-3 bg-slate-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {feedbackList.map((fb) => (
            <div
              key={fb.id}
              className={`bg-white rounded-2xl border shadow-sm p-4 ${
                fb.discrepancyFlagged
                  ? "border-[#e8913a]/40"
                  : "border-slate-200"
              }`}
            >
              {/* Header row */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#1e3a5f]/10 text-[#1e3a5f] capitalize">
                  {fb.serviceType}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                  {getZoneName(fb.zone, "en")}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1 ms-auto">
                  <Clock className="w-3 h-3" />
                  {timeAgo(fb.createdAt)}
                </span>
              </div>

              {/* Feedback text */}
              <p className="text-sm text-slate-700 leading-relaxed" dir={fb.language === "ar" ? "rtl" : "ltr"}>
                {fb.feedback}
              </p>

              {/* Discrepancy flag */}
              {fb.discrepancyFlagged && (
                <div className="mt-3 flex items-start gap-2 bg-[#e8913a]/10 rounded-xl px-3 py-2">
                  <AlertTriangle className="w-4 h-4 text-[#e8913a] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-[#e8913a]">
                      Discrepancy flagged
                    </p>
                    <p className="text-xs text-[#e8913a]/80 mt-0.5">
                      Reported service status conflicts with actor&apos;s capacity card data. Requires review.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
