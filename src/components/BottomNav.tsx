"use client";
import { usePathname, useRouter } from "next/navigation";

const TABS = [
  { id: "home",    label: "홈",    icon: "⏱",  href: "/home"   },
  { id: "groups",  label: "그룹",  icon: "👥",  href: "/groups" },
  { id: "ranking", label: "랭킹",  icon: "🏆",  href: "/ranking"},
  { id: "profile", label: "더보기",icon: "👤",  href: "/profile"},
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const activeTab = TABS.find(t => pathname.startsWith(t.href))?.id || "home";

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-white/80 backdrop-blur-2xl border-t border-[var(--pochita-border)] px-4"
      style={{
        paddingTop: "8px",
        paddingBottom: "calc(env(safe-area-inset-bottom, 16px) + 6px)",
        height: "calc(82px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      {TABS.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => router.push(tab.href)}
            className="flex flex-col items-center justify-center gap-1.5 flex-1 h-full transition-all group active:scale-90"
          >
            <div className={`
              w-12 h-1.5 rounded-full mb-1 transition-all duration-300
              ${isActive ? "bg-[var(--pochita-orange)] scale-x-100" : "bg-transparent scale-x-0"}
            `} />
            <span className={`text-[22px] transition-all duration-300 ${isActive ? "scale-110" : "grayscale opacity-30"}`}>
              {tab.icon}
            </span>
            <span
              className={`text-[10px] uppercase tracking-widest transition-colors duration-300 ${isActive ? "text-[var(--pochita-text)] font-semibold" : "text-gray-300 font-medium"}`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
