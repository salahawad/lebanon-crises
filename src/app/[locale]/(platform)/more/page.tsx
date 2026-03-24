"use client";

import { useLocale } from "next-intl";
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
import { Link } from "@/i18n/navigation";

interface NavItem {
  title: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  href: string;
  icon: LucideIcon;
}

interface NavCategory {
  label: {
    en: string;
    ar: string;
  };
  items: NavItem[];
}

const copyByLocale = {
  en: {
    heading: "More",
    subheading: "All platform features",
  },
  ar: {
    heading: "المزيد",
    subheading: "كل ميزات المنصة",
  },
} as const;

const NAV_CATEGORIES: NavCategory[] = [
  {
    label: { en: "Visibility", ar: "الرؤية" },
    items: [
      {
        title: { en: "Capacity Cards", ar: "بطاقات القدرة" },
        description: { en: "View and manage service capacity", ar: "عرض وإدارة قدرة الخدمات" },
        href: "/capacity",
        icon: Activity,
      },
      {
        title: { en: "Resource Tracker", ar: "متابعة الموارد" },
        description: { en: "Track supplies and resource levels", ar: "متابعة الإمدادات ومستويات الموارد" },
        href: "/resources",
        icon: Package,
      },
      {
        title: { en: "Urgency Alerts", ar: "تنبيهات الاستعجال" },
        description: { en: "Active alerts and escalations", ar: "التنبيهات النشطة وحالات التصعيد" },
        href: "/alerts",
        icon: AlertTriangle,
      },
      {
        title: { en: "Timeline", ar: "الخط الزمني" },
        description: { en: "Recent activity and changes", ar: "أحدث الأنشطة والتغييرات" },
        href: "/timeline",
        icon: Clock,
      },
      {
        title: { en: "Flash Assessment", ar: "التقييم السريع" },
        description: { en: "Rapid zone-level assessments", ar: "تقييمات سريعة على مستوى المناطق" },
        href: "/assessment",
        icon: ClipboardCheck,
      },
    ],
  },
  {
    label: { en: "Coordination", ar: "التنسيق" },
    items: [
      {
        title: { en: "Collaboration", ar: "التعاون" },
        description: { en: "Requests and joint operations", ar: "الطلبات والعمليات المشتركة" },
        href: "/collaborate",
        icon: Handshake,
      },
      {
        title: { en: "Messaging", ar: "الرسائل" },
        description: { en: "Secure peer-to-peer messaging", ar: "مراسلة آمنة بين الجهات" },
        href: "/messages",
        icon: MessageCircle,
      },
      {
        title: { en: "Sector Planning", ar: "تخطيط القطاعات" },
        description: { en: "Coverage plans and gap analysis", ar: "خطط التغطية وتحليل الفجوات" },
        href: "/planning",
        icon: Target,
      },
      {
        title: { en: "Community Feedback", ar: "ملاحظات المجتمع" },
        description: { en: "Anonymous community reports", ar: "بلاغات مجتمعية مجهولة الهوية" },
        href: "/feedback",
        icon: MessageSquare,
      },
      {
        title: { en: "Outcomes", ar: "النتائج" },
        description: { en: "Network outcome monitoring", ar: "متابعة نتائج الشبكة" },
        href: "/outcomes",
        icon: BarChart3,
      },
      {
        title: { en: "Verification", ar: "التحقق" },
        description: { en: "Peer vouching and trust", ar: "التزكية بين الجهات وبناء الثقة" },
        href: "/verification",
        icon: Shield,
      },
    ],
  },
  {
    label: { en: "Infrastructure", ar: "البنية التحتية" },
    items: [
      {
        title: { en: "Register Organization", ar: "تسجيل منظمة" },
        description: { en: "Submit new actor intake form", ar: "إرسال استمارة انضمام جهة جديدة" },
        href: "/intake",
        icon: PlusCircle,
      },
      {
        title: { en: "Platform Login", ar: "تسجيل الدخول إلى شبكة" },
        description: { en: "Sign in as an organization or Shabaka admin", ar: "الدخول كمنظمة أو كمدير لمنصة شبكة" },
        href: "/platform/login",
        icon: LogIn,
      },
      {
        title: { en: "My Organization", ar: "منظمتي" },
        description: { en: "Open your org workspace and account summary", ar: "فتح مساحة منظمتك وملخص الحساب" },
        href: "/platform/me",
        icon: Building2,
      },
      {
        title: { en: "Review Queue", ar: "طابور المراجعة" },
        description: { en: "Review pending intake submissions", ar: "مراجعة طلبات الانضمام المعلّقة" },
        href: "/platform/review",
        icon: ClipboardList,
      },
      {
        title: { en: "API Documentation", ar: "توثيق الواجهة البرمجية" },
        description: { en: "Public and authenticated endpoints", ar: "المسارات العامة والمسارات المحمية" },
        href: "/api",
        icon: Code,
      },
      {
        title: { en: "Privacy & Settings", ar: "الخصوصية والإعدادات" },
        description: { en: "Visibility controls and preferences", ar: "خيارات الظهور والتفضيلات" },
        href: "/settings",
        icon: Settings,
      },
    ],
  },
];

export default function MorePage() {
  const locale = useLocale() === "ar" ? "ar" : "en";
  const copy = copyByLocale[locale];

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#1e3a5f] flex items-center justify-center">
          <MoreHorizontal className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900" data-testid="platform-more-heading">
            {copy.heading}
          </h1>
          <p className="text-sm text-slate-500">{copy.subheading}</p>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {NAV_CATEGORIES.map((category) => (
          <div key={category.label.en}>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
              {category.label[locale]}
            </h2>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
              {category.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#1e3a5f]/5 flex items-center justify-center shrink-0 group-hover:bg-[#1e3a5f]/10 transition-colors">
                      <Icon className="w-[18px] h-[18px] text-[#1e3a5f]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        {item.title[locale]}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.description[locale]}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 group-hover:text-slate-500 transition-colors rtl:-scale-x-100" />
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
