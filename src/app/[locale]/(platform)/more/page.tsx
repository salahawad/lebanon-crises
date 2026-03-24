"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Package,
  AlertTriangle,
  Handshake,
  MessageCircle,
  ClipboardCheck,
  Target,
  Clock,
  Shield,
  MessageSquare,
  BarChart3,
  PlusCircle,
  Code,
  Settings,
  LogIn,
  Building2,
  ClipboardList,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

interface NavCategory {
  label: string;
  items: NavItem[];
}

const NAV_CATEGORIES: NavCategory[] = [
  {
    label: "Visibility",
    items: [
      {
        title: "Capacity Cards",
        description: "View and manage service capacity",
        href: "/capacity",
        icon: Activity,
      },
      {
        title: "Resource Tracker",
        description: "Track supplies and resource levels",
        href: "/resources",
        icon: Package,
      },
      {
        title: "Urgency Alerts",
        description: "Active alerts and escalations",
        href: "/alerts",
        icon: AlertTriangle,
      },
      {
        title: "Timeline",
        description: "Recent activity and changes",
        href: "/timeline",
        icon: Clock,
      },
      {
        title: "Flash Assessment",
        description: "Rapid zone-level assessments",
        href: "/assessment",
        icon: ClipboardCheck,
      },
    ],
  },
  {
    label: "Coordination",
    items: [
      {
        title: "Collaboration",
        description: "Requests and joint operations",
        href: "/collaborate",
        icon: Handshake,
      },
      {
        title: "Messaging",
        description: "Secure peer-to-peer messaging",
        href: "/messages",
        icon: MessageCircle,
      },
      {
        title: "Sector Planning",
        description: "Coverage plans and gap analysis",
        href: "/planning",
        icon: Target,
      },
      {
        title: "Community Feedback",
        description: "Anonymous community reports",
        href: "/feedback",
        icon: MessageSquare,
      },
      {
        title: "Outcomes",
        description: "Network outcome monitoring",
        href: "/outcomes",
        icon: BarChart3,
      },
      {
        title: "Verification",
        description: "Peer vouching and trust",
        href: "/verification",
        icon: Shield,
      },
    ],
  },
  {
    label: "Infrastructure",
    items: [
      {
        title: "Register Organization",
        description: "Submit new actor intake form",
        href: "/intake",
        icon: PlusCircle,
      },
      {
        title: "Platform Login",
        description: "Sign in as an organization or Shabaka admin",
        href: "/platform/login",
        icon: LogIn,
      },
      {
        title: "My Organization",
        description: "Open your org workspace and account summary",
        href: "/platform/me",
        icon: Building2,
      },
      {
        title: "Review Queue",
        description: "Review pending intake submissions",
        href: "/platform/review",
        icon: ClipboardList,
      },
      {
        title: "API Documentation",
        description: "Public and authenticated endpoints",
        href: "/api",
        icon: Code,
      },
      {
        title: "Privacy & Settings",
        description: "Visibility controls and preferences",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
];

export default function MorePage() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#1e3a5f] flex items-center justify-center">
          <MoreHorizontal className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">More</h1>
          <p className="text-sm text-slate-500">All platform features</p>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {NAV_CATEGORIES.map((category) => (
          <div key={category.label}>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
              {category.label}
            </h2>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
              {category.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={`/${locale}${item.href}`}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#1e3a5f]/5 flex items-center justify-center shrink-0 group-hover:bg-[#1e3a5f]/10 transition-colors">
                      <Icon className="w-[18px] h-[18px] text-[#1e3a5f]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 group-hover:text-slate-500 transition-colors" />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
