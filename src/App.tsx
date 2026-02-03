import React, { useMemo, useState } from "react";
import {
  LayoutDashboard,
  Activity,
  Euro,
  Brain,
  CheckSquare,
  Search,
  Bell,
  Settings,
  Menu,
  ChevronRight,
  AlertTriangle,
  ArrowRight,
  Calendar,
} from "lucide-react";
import Module2Container from "./components/Module2/Module2Container";
import Module3Container from "./components/Module3/Module3Container";
import Module4 from "./components/Module4/Module4";
import HomeKPIs from "./components/HomeKPIs";
import GlobalCopilot from "./components/GlobalCopilot";
import ConfigSettings from "./components/ConfigWizard/ConfigSettings";
import AlertSystem from "./components/Home/AlertSystem";
import HomeAbsenceDetailSection from "./components/Home/HomeAbsenceDetailSection";
import { ConfigProvider, useConfig, computeTotalAbsence } from "./stores/configStore";
import { CopilotProvider } from "./stores/copilotStore";
import { fmtEUR, fmtPct } from "./utils/formatters";


// --- UI KIT (Apple-ish / Soft Zinc) ---
const Card = ({ children, className = "", title, right }: any) => (
  <div className={`bg-white rounded-3xl border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 ${className}`}>
    {(title || right) && (
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-zinc-900 flex items-center gap-2 tracking-tight">{title}</h3>
        {right}
      </div>
    )}
    {children}
  </div>
);

const Badge = ({ t, children }: any) => {
  const s =
    t === "crit"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : t === "warn"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : t === "good"
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-zinc-100 text-zinc-600 border-zinc-200";
  return <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${s}`}>{children}</span>;
};

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700">
    {children}
  </span>
);

const Select = ({ label, value, onChange, options }: any) => (
  <label className="flex flex-col gap-1">
    <span className="text-[11px] font-semibold text-zinc-500">{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-2xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none focus:ring-2 focus:ring-violet-200"
    >
      {options.map((o: any) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </label>
);




const ModuleSlot = ({ t }: { t: string }) => (
  <div className="h-full min-h-[520px] flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-3xl bg-zinc-50/50 text-zinc-400">
    <div>Módulo cargado:</div>
    <div className="font-semibold text-zinc-600 text-xl">{t}</div>
  </div>
);

function AppContent() {
  const { config } = useConfig();
  const [view, setView] = useState("home");
  const [sb, setSb] = useState(true);
  const [showConfig, setShowConfig] = useState(false);

  return (
    <div className="flex h-screen bg-[#F7F7F8] font-sans text-zinc-900 overflow-hidden relative">
      {/* CONFIG SETTINGS MODAL */}
      <ConfigSettings open={showConfig} onClose={() => setShowConfig(false)} />

      {/* GLOBAL COPILOT (Only on Home) */}
      {view === "home" && <GlobalCopilot />}

      {/* SIDEBAR */}
      <aside className={`bg-white border-r border-zinc-200 flex flex-col transition-all duration-300 relative ${sb ? "w-64" : "w-20"}`}>
        {/* Toggle Button - Float style */}
        <button
          onClick={() => setSb(!sb)}
          className="absolute -right-3 top-20 bg-white border border-zinc-200 rounded-full p-1.5 shadow-sm text-zinc-400 hover:text-violet-600 z-50 transition-colors"
        >
          {sb ? <ChevronRight className="h-3 w-3 rotate-180" /> : <ChevronRight className="h-3 w-3" />}
        </button>

        <div className="h-24 flex items-center px-6 border-b border-zinc-50 overflow-hidden">
          {sb ? (
            <img src="thirdwish-logo.png" alt="ThirdWish" className="max-w-[150px] h-auto object-contain mx-auto opacity-95" />
          ) : (
            <div className="mx-auto h-10 w-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-200">
              <Brain className="h-6 w-6 text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 px-3 py-6 space-y-6 overflow-y-auto">
          {/* Main Navigation */}
          <div>
            {sb && <div className="px-4 mb-3 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] opacity-80">Dashboard</div>}
            <nav className="space-y-1">
              {[
                { id: "home", l: "Inicio", i: LayoutDashboard },
                { id: "cost", l: "Analytics", i: Euro },
                { id: "pred", l: "Predicción", i: Brain },
                { id: "work", l: "Gestión", i: CheckSquare },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setView(m.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${view === m.id
                    ? "bg-violet-50 text-violet-700 font-bold shadow-sm"
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                    }`}
                >
                  <m.i className={`h-5 w-5 transition-colors ${view === m.id ? "text-violet-600" : "text-zinc-400 group-hover:text-zinc-600"
                    }`} />
                  {sb && <span className="text-sm tracking-tight">{m.l}</span>}
                  {view === m.id && sb && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-600 shadow-[0_0_8px_rgba(124,58,237,0.5)]" />}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* BOTTOM SECTION: User Profile */}
        <div className="p-4 border-t border-zinc-100 bg-zinc-50/30">
          <div className={`flex items-center gap-3 ${sb ? "px-2" : "justify-center"}`}>
            <div className="relative">
              <div className="h-9 w-9 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full text-white flex items-center justify-center text-xs font-bold ring-2 ring-white shadow-md">
                AD
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>
            {sb && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-zinc-900 truncate tracking-tight">Alex Doe</div>
                <div className="text-[10px] font-bold text-zinc-400 truncate tracking-wider uppercase">Admin HQ</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-zinc-200 px-8 flex items-center justify-between z-10">
          <div className="flex items-center gap-3 text-sm font-medium text-zinc-500">
            Organización <ChevronRight className="h-4 w-4" />
            <span className="text-zinc-900 font-semibold">{view === "home" ? "Vista General" : view.toUpperCase()}</span>
          </div>
          <div className="flex gap-4 items-center">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
              <input
                className="pl-10 pr-4 py-2 bg-zinc-100 rounded-full text-sm outline-none focus:ring-2 ring-violet-200 transition-all w-72"
                placeholder="Buscar empleado, centro..."
              />
            </div>
            <button
              onClick={() => setShowConfig(true)}
              className="h-9 w-9 rounded-xl bg-zinc-100 hover:bg-violet-100 flex items-center justify-center text-zinc-500 hover:text-violet-600 transition-colors"
              title="Configuración"
            >
              <Settings className="h-5 w-5" />
            </button>
            <Bell className="h-5 w-5 text-zinc-500 hover:text-violet-600 cursor-pointer transition-colors" />
            <div className="h-9 w-9 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full text-white flex items-center justify-center text-xs font-black ring-4 ring-zinc-50 shadow-sm">AD</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[1600px] mx-auto w-full">
            {view === "home" ? (
              <div className="space-y-12 animate-in fade-in duration-500 pb-20">
                {/* SECTION 1: ACTUALIDAD */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]"></div>
                    <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Actualidad: Qué está pasando hoy</h2>
                  </div>
                  <div className="space-y-6">
                    <HomeKPIs />
                    <HomeAbsenceDetailSection />
                  </div>
                </section>

                {/* VISUAL SEPARATOR / TRANSITION */}
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-zinc-200/60"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-[#F7F7F8] px-4 text-[10px] font-bold text-zinc-300 uppercase tracking-[0.3em]">IA Predictiva · Escenarios Futuros</span>
                  </div>
                </div>

                {/* SECTION 2: PREDICCIÓN */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-2 w-2 rounded-full bg-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.4)]"></div>
                    <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Predicción: Lo que viene</h2>
                  </div>
                  <AlertSystem onViewDetail={() => setView("pred")} />
                </section>
              </div>
            ) : (
              view === "cost" ? <Module2Container /> : view === "pred" ? <Module3Container /> : <Module4 />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
