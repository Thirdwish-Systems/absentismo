import React, { useState } from "react";
import Module3_1 from "./Module3_1";
import PredictionPatternsTab from "./PredictionPatternsTab";
import PredictionMirrorCenters from "./PredictionMirrorCenters";

export default function Module3Container() {
    const [activeTab, setActiveTab] = useState("3.1");

    const tabs = [
        { id: "3.1", label: "Gestión de Riesgos", component: Module3_1 },
        { id: "3.2", label: "Inteligencia de Patrones", component: PredictionPatternsTab },
        { id: "3.3", label: "Centros Espejo", component: PredictionMirrorCenters },
    ];

    const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || Module3_1;

    return (
        <div className="space-y-6">
            <div className="flex gap-2 bg-zinc-100 p-1 rounded-2xl w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === tab.id ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500 hover:text-zinc-700"}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <ActiveComponent />
        </div>
    );
}
