import PageHeader from "@/components/ui/PageHeader";
import ScenarioPanel from "@/components/scenarios/ScenarioPanel";

export default function ScenariosPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Simulateur de scénarios"
        description="Modifiez les curseurs pour estimer l'impact de différentes politiques RH sur les effectifs et le budget"
        badge="Modèle simplifié – à des fins d'illustration"
      />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
          <strong>Avertissement :</strong> Ce simulateur utilise un modèle macroéconomique simplifié.
          Les impacts calculés sont des estimations indicatives et ne constituent pas des prévisions officielles.
          Les données sont issues des rapports DGAFP 2022 et des projections INSEE.
        </div>
        <ScenarioPanel />
      </div>
    </div>
  );
}
