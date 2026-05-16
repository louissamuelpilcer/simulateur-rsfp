import { Users, Building2, Hospital, MapPin, TrendingUp, TrendingDown } from "lucide-react";
import MetricCard from "@/components/ui/MetricCard";
import PageHeader from "@/components/ui/PageHeader";
import { NATIONAL_TOTALS, DEPARTMENTS } from "@/lib/mock-data";
import Link from "next/link";

const fmtM = (v: number) => `${(v / 1_000_000).toFixed(2)} M`;
const fmtK = (v: number) => `${Math.round(v / 1000)} k`;

export default function DashboardPage() {
  const total = NATIONAL_TOTALS;
  const totalAgents = total.agents_etat + total.agents_territoriale + total.agents_hospitaliere;
  const agentsPourMille = (totalAgents / total.population) * 1000;

  // Top 5 by agent density
  const top5Density = [...DEPARTMENTS]
    .sort((a, b) => {
      const vA = ((a.agents_etat + a.agents_territoriale + a.agents_hospitaliere) / a.population) * 1000;
      const vB = ((b.agents_etat + b.agents_territoriale + b.agents_hospitaliere) / b.population) * 1000;
      return vB - vA;
    })
    .slice(0, 5);

  // Most aged departments
  const top5Aged = [...DEPARTMENTS]
    .sort((a, b) => b.indice_vieillissement - a.indice_vieillissement)
    .slice(0, 5);

  return (
    <div>
      <PageHeader
        title="Tableau de bord national"
        description="Vue d'ensemble des indicateurs de la fonction publique française"
        badge="DGAFP · Données 2022"
      />

      <div className="p-8 space-y-8">
        {/* KPIs */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-4">Effectifs nationaux</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Total agents FP"
              value={fmtM(totalAgents)}
              sub={`${agentsPourMille.toFixed(1)} agents pour 1 000 hab.`}
              icon={Users}
              color="blue"
              trend={{ value: 0.4, label: "vs 2021" }}
            />
            <MetricCard
              label="FP État"
              value={fmtM(total.agents_etat)}
              sub={`${((total.agents_etat / totalAgents) * 100).toFixed(0)} % du total`}
              icon={Building2}
              color="blue"
            />
            <MetricCard
              label="FP Territoriale"
              value={fmtM(total.agents_territoriale)}
              sub={`${((total.agents_territoriale / totalAgents) * 100).toFixed(0)} % du total`}
              icon={MapPin}
              color="green"
            />
            <MetricCard
              label="FP Hospitalière"
              value={fmtM(total.agents_hospitaliere)}
              sub={`${((total.agents_hospitaliere / totalAgents) * 100).toFixed(0)} % du total`}
              icon={Hospital}
              color="red"
            />
          </div>
        </section>

        {/* Two columns */}
        <div className="grid grid-cols-2 gap-6">
          {/* Top departments by density */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Départements avec la plus forte densité FP</h3>
              <Link href="/carte" className="text-xs text-[#003189] hover:underline">Voir la carte →</Link>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-gray-400 font-medium pb-2">Département</th>
                  <th className="text-right text-gray-400 font-medium pb-2">Agents / 1 000 hab.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {top5Density.map((d) => {
                  const density = ((d.agents_etat + d.agents_territoriale + d.agents_hospitaliere) / d.population) * 1000;
                  return (
                    <tr key={d.code}>
                      <td className="py-2.5 text-gray-700">{d.code} – {d.name}</td>
                      <td className="py-2.5 text-right font-semibold text-[#003189]">{density.toFixed(1)} ‰</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Most aged departments */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Départements les plus vieillissants</h3>
              <Link href="/projections" className="text-xs text-[#003189] hover:underline">Voir projections →</Link>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-gray-400 font-medium pb-2">Département</th>
                  <th className="text-right text-gray-400 font-medium pb-2">Population 60+ (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {top5Aged.map((d) => (
                  <tr key={d.code}>
                    <td className="py-2.5 text-gray-700">{d.code} – {d.name}</td>
                    <td className="py-2.5 text-right">
                      <span className="font-semibold text-purple-700">
                        {(d.indice_vieillissement * 100).toFixed(1)} %
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick links */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-4">Accès rapide</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { href: "/carte", title: "Carte des indicateurs", desc: "9 indicateurs par département", color: "from-blue-50 to-blue-100 border-blue-200" },
              { href: "/projections", title: "Projections démographiques", desc: "Pyramide des âges 1991–2026", color: "from-purple-50 to-purple-100 border-purple-200" },
              { href: "/scenarios", title: "Simulateur de scénarios", desc: "5 leviers d'action paramétrables", color: "from-orange-50 to-orange-100 border-orange-200" },
            ].map(({ href, title, desc, color }) => (
              <Link
                key={href}
                href={href}
                className={`bg-gradient-to-br ${color} border rounded-xl p-5 hover:shadow-md transition-shadow`}
              >
                <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
                <p className="text-sm text-gray-600">{desc}</p>
                <span className="mt-3 inline-block text-xs font-medium text-[#003189]">Accéder →</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Data footnote */}
        <p className="text-xs text-gray-400">
          Sources : DGAFP – Rapport annuel sur l'état de la fonction publique 2022 · INSEE – Recensement de la population 2022 ·
          Ces données sont à titre indicatif et basées sur des estimations.
        </p>
      </div>
    </div>
  );
}
