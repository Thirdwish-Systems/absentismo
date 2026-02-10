import React, { useState } from 'react';
import { AlertTriangle, Fingerprint, LayoutGrid, List } from 'lucide-react';
import RiskManagementView from './RiskManagementView';
import PatternManagementView from './PatternManagementView';

export default function PredictionManager() {
    const [activeTab, setActiveTab] = useState<'risks' | 'patterns'>('risks');
    const [selectedPatternId, setSelectedPatternId] = useState<string | null>(null);

    // Handler to navigate from Risk View -> Pattern View
    const handleNavigateToPattern = (patternId: string) => {
        setSelectedPatternId(patternId);
        setActiveTab('patterns');
    };

    return (
        <div className="space-y-6">
            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-zinc-900">Gestión de Patrones</h2>
                    <p className="text-xs text-zinc-500 font-medium">Monitorización de riesgos y detección de patrones complejos</p>
                </div>

                <div className="flex p-1 bg-zinc-100 rounded-2xl w-fit">
                    <button
                        onClick={() => setActiveTab('risks')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${activeTab === 'risks'
                            ? 'bg-white text-zinc-900 shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-700'
                            }`}
                    >
                        <AlertTriangle className="w-4 h-4" />
                        Gestión de Riesgos
                    </button>
                    <button
                        onClick={() => setActiveTab('patterns')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${activeTab === 'patterns'
                            ? 'bg-white text-zinc-900 shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-700'
                            }`}
                    >
                        <Fingerprint className="w-4 h-4" />
                        Gestión de Patrones
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {activeTab === 'risks' ? (
                    <RiskManagementView onNavigateToPattern={handleNavigateToPattern} />
                ) : (
                    <PatternManagementView
                        initialPatternId={selectedPatternId}
                        onClearSelection={() => setSelectedPatternId(null)}
                    />
                )}
            </div>
        </div>
    );
}
