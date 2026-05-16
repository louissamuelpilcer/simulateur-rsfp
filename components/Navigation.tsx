"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  TrendingUp,
  Users,
  Sliders,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", icon: LayoutDashboard, label: "Tableau de bord" },
  { href: "/carte", icon: Map, label: "Carte des indicateurs" },
  { href: "/projections", icon: TrendingUp, label: "Projections démographiques" },
  { href: "/rh", icon: Users, label: "Indicateurs RH" },
  { href: "/scenarios", icon: Sliders, label: "Simulateur de scénarios" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="w-64 flex-shrink-0 bg-[#003189] text-white flex flex-col h-full shadow-xl">
      {/* Header */}
      <div className="px-5 py-6 border-b border-blue-700">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-8 bg-[#E1000F] rounded-full" />
          <span className="text-xs font-semibold uppercase tracking-widest text-blue-200">
            DGAFP
          </span>
        </div>
        <h1 className="text-base font-bold leading-tight mt-2">
          Simulateur<br />
          <span className="text-blue-200 font-normal text-sm">Rapport sur la Fonction Publique</span>
        </h1>
      </div>

      {/* Links */}
      <ul className="flex-1 py-4 space-y-1 px-3 overflow-y-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-white/15 text-white"
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={18} className={active ? "text-white" : "text-blue-300"} />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight size={14} className="text-blue-300" />}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-blue-700 text-xs text-blue-300">
        <p>Données : INSEE · DGAFP</p>
        <p className="mt-0.5">Version 2025 · Bêta</p>
      </div>
    </nav>
  );
}
