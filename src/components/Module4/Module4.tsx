import React, { useState, useMemo } from 'react';
import {
  Zap, Activity, LayoutGrid,
  ArrowRightLeft, Sparkles, Brain,
  Target, Search, ShieldCheck,
  Layers, Plus, History, ArrowRight
} from 'lucide-react';
import AutomationsHub from './AutomationsHub';
import AutomationDetailDrawer from './AutomationDetailDrawer';
import CreateAutomation from './CreateAutomation';
import AlternativeSolution from './AlternativeSolution';
import PredictionMirrorCenters from '../Module3/PredictionMirrorCenters';
import { Risk, Workflow } from './automationTypes';
import { MOCK_RISKS, MOCK_AUTOMATIONS } from './mockAutomations';

const cn = (...xs: (string | boolean | undefined)[]) => xs.filter(Boolean).join(' ');

function Badge({ children, t = "neutral" }: { children: React.ReactNode; t?: "neutral" | "good" | "bad" | "violet" }) {
  const cls =
    t === "violet"
      ? "bg-violet-50 text-violet-700 border-violet-200"
      : t === "good"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : t === "bad"
          ? "bg-rose-50 text-rose-700 border-rose-200"
          : "bg-zinc-50 text-zinc-700 border-zinc-200";
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${cls}`}>{children}</span>;
}

function CopilotPanel({ text }: { text: string }) {
  return (
    <div className="flex h-full flex-col rounded-[28px] border border-zinc-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-3 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-100">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-zinc-900 tracking-tight">Copiloto IA</div>
            <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">Protocolos · Insights</div>
          </div>
        </div>
        <Badge t="violet">Visible</Badge>
      </div>
      <div className="h-px w-full bg-zinc-100" />
      <div className="flex-1 space-y-4 overflow-auto p-5">
        <div className="rounded-[24px] border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-[10px] font-bold text-violet-700 uppercase tracking-widest">
            <Sparkles className="h-4 w-4" /> Recomendación IA
          </div>
          <div className="mt-3 text-sm leading-relaxed text-zinc-700">{text}</div>
          <button
            className="mt-4 w-full rounded-xl bg-violet-600 px-4 py-2.5 text-[11px] font-bold text-white uppercase tracking-widest hover:bg-violet-700 transition-colors shadow-md shadow-violet-100"
          >
            Configurar Flujo Sugerido
          </button>
        </div>

        <div className="rounded-2xl border border-zinc-100 bg-zinc-50/50 p-4 space-y-3">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Consultas rápidas</div>
          <div className="grid gap-2">
            {[
              "¿Qué impacto tiene el seguimiento de protocolos?",
              "¿Qué unidades necesitan más flujos de acción?",
              "Analiza tasa de éxito de protocolos activos"
            ].map((s) => (
              <button key={s} className="text-left rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-[11px] text-zinc-600 hover:border-violet-300 hover:text-violet-700 transition-all font-medium">
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="text-[10px] leading-relaxed text-zinc-400 font-medium italic">
          IA operativa analizando patrones de flujos y reincorporaciones en tiempo real.
        </div>
      </div>
    </div>
  );
}

export default function Module4() {
  const [view, setView] = useState<'HUB' | 'MIRROR'>('HUB');

  // UI State
  const [selectedAutomation, setSelectedAutomation] = useState<Workflow | null>(null);
  const [riskToAutomate, setRiskToAutomate] = useState<Risk | null>(null);
  const [riskToManual, setRiskToManual] = useState<Risk | null>(null);

  // Derived State
  const activeAutomationsCount = MOCK_AUTOMATIONS.length;
  const pendingRisksCount = MOCK_RISKS.filter(r => r.status === 'AUTOMATION_NOT_CREATED').length;

  const copilotText = "He detectado que el 40% de las bajas en 'Centro Logístico Madrid' no tienen un flujo de reincorporación activo. Automatizar el contacto previo al alta podría reducir la incertidumbre operativa en un 15%.";

  return (
    <div className="min-h-screen bg-zinc-50/50">
      {/* Module Top Navigation / Tabs */}
      {/* Module Top Navigation / Tabs */}
      <div className="bg-white border-b border-zinc-100 px-4 md:px-8 py-4 md:py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sticky top-0 z-40 backdrop-blur-xl bg-white/80">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-100">
              <Zap size={18} />
            </div>
            <h1 className="text-sm font-bold text-zinc-900 tracking-tight uppercase tracking-[0.15em]">Protocolos Hub</h1>
          </div>

          <div className="flex items-center p-1 bg-zinc-100/50 rounded-2xl w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setView('HUB')}
              className={cn(
                "flex-1 md:flex-none h-9 px-4 md:px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 whitespace-nowrap",
                view === 'HUB' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              <LayoutGrid size={14} />
              Riesgos y Flujos
            </button>
            <button
              onClick={() => setView('MIRROR')}
              className={cn(
                "flex-1 md:flex-none h-9 px-4 md:px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 whitespace-nowrap",
                view === 'MIRROR' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              <ArrowRightLeft size={14} />
              Análisis Espejo
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Activos</div>
              <div className="text-sm font-bold text-zinc-900">{activeAutomationsCount} Flujos</div>
            </div>
            <div className="h-8 w-px bg-zinc-100" />
            <div className="text-right">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Pendientes</div>
              <div className="text-sm font-bold text-rose-500">{pendingRisksCount} Riesgos</div>
            </div>
          </div>
          {/* Copilot Mini Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-violet-50 rounded-full border border-violet-100">
            <div className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
            <span className="text-[9px] font-bold text-violet-600 uppercase tracking-widest">Copilot Activo</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-8 max-w-[1700px] mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8">
          <div className="space-y-8">
            {view === 'HUB' ? (
              <AutomationsHub
                onCreateAutomation={(risk) => setRiskToAutomate(risk)}
                onViewDetail={(id) => setSelectedAutomation(MOCK_AUTOMATIONS.find(a => a.id === id) || null)}
                onAddAlternative={(risk) => setRiskToManual(risk)}
              />
            ) : (
              <PredictionMirrorCenters
                onLaunchAutomation={(finding) => {
                  // Map finding to a pseudo-risk for the wizard
                  const mirrorRisk: Risk = {
                    id: `mirror-${Date.now()}`,
                    name: finding.findingType,
                    source: 'CENTROS_ESPEJO',
                    scope: { center: 'Red de Espejos' },
                    severity: 'ALTA',
                    status: 'AUTOMATION_NOT_CREATED',
                    impactEur: 0,
                    alternativeSolutionCount: 0,
                    window: 'Vigilancia continua'
                  };
                  setRiskToAutomate(mirrorRisk);
                }}
              />
            )}
          </div>

          <aside className="hidden xl:block">
            <div className="sticky top-[108px] h-[calc(100vh-140px)]">
              <CopilotPanel text={copilotText} />
            </div>
          </aside>

          <div className="xl:hidden">
            <CopilotPanel text={copilotText} />
          </div>
        </div>
      </div>

      {/* Modals & Drawers */}
      <AutomationDetailDrawer
        automation={selectedAutomation}
        onClose={() => setSelectedAutomation(null)}
      />

      {riskToAutomate && (
        <CreateAutomation
          risk={riskToAutomate}
          onClose={() => setRiskToAutomate(null)}
          onSave={(data) => {
            console.log('Saving automation:', data);
            setRiskToAutomate(null);
            // In a real app, this would refresh the data
          }}
        />
      )}

      {riskToManual && (
        <AlternativeSolution
          risk={riskToManual}
          onClose={() => setRiskToManual(null)}
          onSave={(data) => {
            console.log('Saving manual solution:', data);
            setRiskToManual(null);
          }}
        />
      )}
    </div>
  );
}
