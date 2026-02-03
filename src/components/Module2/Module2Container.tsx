import React, { useState, createContext, useContext } from "react";
import SituacionActual from "./SituacionActual";
import Benchmark from "./Benchmark";
import EconomicPredictions from "./EconomicPredictions";
import Historico from "./Historico";

// ─────────────────────────────────────────────────────────────────────────────
// Tipos y contexto compartido
// ─────────────────────────────────────────────────────────────────────────────

export interface SubData {
    substitutedPct: number;
    extraCostPct: number;
}

export interface AbsenceData {
    AT: number;
    IT_CORTA: number;
    IT_MEDIA: number;
    IT_LARGA: number;
    [key: string]: number;
}

export interface SubsData {
    [key: string]: SubData;
}

export interface Group {
    id: string;
    name: string;
    employees: number;
    salary: number;
    absence: AbsenceData;
    subs: SubsData;
}

export interface CompanyData {
    name: string;
    employees: number;
    salary: number;
    hours: number;
    cnae: string;
    ssFixed: number;
    ssVar: number;
    brDiv: number;
    revenue: number;
    includeOpp: boolean;
    subEff: number;
    comp13: number;
    comp420: number;
    comp21: number;
    provisionEur: number;
    provisionPct: number;
    avgDur: Record<string, number>;
}

export interface CompanyContextType {
    company: CompanyData;
    setCompany: React.Dispatch<React.SetStateAction<CompanyData>>;
    absence: AbsenceData;
    setAbsence: React.Dispatch<React.SetStateAction<AbsenceData>>;
    subs: SubsData;
    setSubs: React.Dispatch<React.SetStateAction<SubsData>>;
    groups: Group[];
    setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
}

export const CompanyContext = createContext<CompanyContextType | null>(null);

export function useCompanyData() {
    const ctx = useContext(CompanyContext);
    if (!ctx) throw new Error("useCompanyData must be used within CompanyContext");
    return ctx;
}

// ─────────────────────────────────────────────────────────────────────────────
// Valores por defecto (demo)
// ─────────────────────────────────────────────────────────────────────────────

const defaultCompany: CompanyData = {
    name: "NovaLogística S.L.",
    employees: 320,
    salary: 31500,
    hours: 1780,
    cnae: "52",
    ssFixed: 29.9,
    ssVar: 3.4,
    brDiv: 360,
    revenue: 18000000,
    includeOpp: true,
    subEff: 70,
    comp13: 0,
    comp420: 0,
    comp21: 0,
    provisionEur: 0,
    provisionPct: 0,
    avgDur: { IT_CORTA: 2, IT_MEDIA: 10, IT_LARGA: 60, AT: 5 },
};

const defaultAbsence: AbsenceData = {
    AT: 1.2,
    IT_CORTA: 2.5,
    IT_MEDIA: 3.4,
    IT_LARGA: 2.9,
};

const defaultSubs: SubsData = {
    AT: { substitutedPct: 30, extraCostPct: 25 },
    IT_CORTA: { substitutedPct: 10, extraCostPct: 20 },
    IT_MEDIA: { substitutedPct: 40, extraCostPct: 30 },
    IT_LARGA: { substitutedPct: 55, extraCostPct: 35 },
};

const defaultGroups: Group[] = [
    {
        id: "g-bcn",
        name: "Barcelona · Plataforma",
        employees: 140,
        salary: 33000,
        absence: { AT: 1.4, IT_CORTA: 2.6, IT_MEDIA: 3.6, IT_LARGA: 3.0 },
        subs: {
            AT: { substitutedPct: 35, extraCostPct: 25 },
            IT_CORTA: { substitutedPct: 12, extraCostPct: 20 },
            IT_MEDIA: { substitutedPct: 45, extraCostPct: 30 },
            IT_LARGA: { substitutedPct: 60, extraCostPct: 35 },
        },
    },
    {
        id: "g-mad",
        name: "Madrid · Oficinas",
        employees: 60,
        salary: 42000,
        absence: { AT: 0.6, IT_CORTA: 2.1, IT_MEDIA: 3.0, IT_LARGA: 2.3 },
        subs: {
            AT: { substitutedPct: 10, extraCostPct: 30 },
            IT_CORTA: { substitutedPct: 0, extraCostPct: 0 },
            IT_MEDIA: { substitutedPct: 15, extraCostPct: 35 },
            IT_LARGA: { substitutedPct: 25, extraCostPct: 40 },
        },
    },
    {
        id: "g-cad",
        name: "Cádiz · Fábrica",
        employees: 80,
        salary: 28500,
        absence: { AT: 1.8, IT_CORTA: 2.9, IT_MEDIA: 3.7, IT_LARGA: 3.1 },
        subs: {
            AT: { substitutedPct: 40, extraCostPct: 20 },
            IT_CORTA: { substitutedPct: 15, extraCostPct: 20 },
            IT_MEDIA: { substitutedPct: 50, extraCostPct: 28 },
            IT_LARGA: { substitutedPct: 65, extraCostPct: 33 },
        },
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// Container principal
// ─────────────────────────────────────────────────────────────────────────────

export default function Module2Container() {
    const [activeTab, setActiveTab] = useState("actual");

    // Estado compartido
    const [company, setCompany] = useState<CompanyData>(defaultCompany);
    const [absence, setAbsence] = useState<AbsenceData>(defaultAbsence);
    const [subs, setSubs] = useState<SubsData>(defaultSubs);
    const [groups, setGroups] = useState<Group[]>(defaultGroups);

    const tabs = [
        { id: "actual", label: "Situación Actual", component: SituacionActual },
        { id: "benchmark", label: "Benchmark", component: Benchmark },
        { id: "pred", label: "Predicciones Económicas", component: EconomicPredictions },
        { id: "historico", label: "Histórico", component: Historico },
    ];

    const ActiveComponent = tabs.find((t) => t.id === activeTab)?.component || SituacionActual;

    return (
        <CompanyContext.Provider value={{ company, setCompany, absence, setAbsence, subs, setSubs, groups, setGroups }}>
            <div className="space-y-6">
                <div className="flex gap-2 bg-zinc-100 p-1 rounded-2xl w-fit flex-wrap">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${activeTab === tab.id
                                ? "bg-white shadow-sm text-zinc-900"
                                : "text-zinc-500 hover:text-zinc-700"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <ActiveComponent />
            </div>
        </CompanyContext.Provider>
    );
}
