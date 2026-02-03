import React, { useState, useEffect } from 'react';
import {
    X, Building2, MapPin, Users2, CreditCard,
    RefreshCcw, AlertTriangle, ChevronRight, Check,
    Info, ExternalLink, Sparkles, Database, ArrowRightLeft,
    Brain
} from 'lucide-react';
import { useCopilotStore, ConfigSection } from '../../stores/copilotStore';
import ConfigCopilot from './ConfigCopilot';
import { useConfig, SECTORS } from '../../stores/configStore';

// Section Components
import Step2Company from './Step2Company';
import Step3Structure from './Step3Structure';
import Step4Org from './Step4Org';
import PayrollSettings from './PayrollSettings';
import SubstitutionPolicies from './SubstitutionPolicies';
import Step6Risks from './Step6Risks';
import AvailableData from './AvailableData';
import RiskSettingsMirrors from './RiskSettingsMirrors';

interface ConfigSettingsProps {
    open: boolean;
    onClose: () => void;
}

interface MenuItem {
    id: string;
    label: string;
    icon: any;
    comingSoon?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
    { id: 'company', label: 'Datos de la empresa', icon: Building2 },
    { id: 'structure', label: 'Estructura', icon: MapPin },
    { id: 'org', label: 'Organigrama', icon: Users2 },
    { id: 'payroll', label: 'Motores de Impacto & Costes', icon: CreditCard },
    { id: 'substitutions', label: 'Políticas de sustituciones', icon: RefreshCcw },
    { id: 'risks', label: 'Configuración de riesgos', icon: AlertTriangle },
    { id: 'mirrors', label: 'Centros Espejo (IA)', icon: ArrowRightLeft },
    { id: 'available_data', label: 'Datos disponibles', icon: Database },
];

export default function ConfigSettings({ open, onClose }: ConfigSettingsProps) {
    const [activeSection, setActiveSection] = useState('company');
    const { config } = useConfig();
    const { setSection, completeness, setUserData } = useCopilotStore();

    // Set user data when opening
    useEffect(() => {
        if (open) {
            setUserData({ name: 'María' });
        }
    }, [open, setUserData]);

    // Helper to check if section has warnings
    const hasWarnings = (sectionId: string) => {
        const mapping: Record<string, ConfigSection> = {
            'payroll': 'impact-engines',
            'substitutions': 'substitutions',
            'risks': 'risk-settings',
            'mirrors': 'mirror-centers',
            'available_data': 'available-data',
        };
        const copilotSection = mapping[sectionId];
        return copilotSection && completeness[copilotSection]?.percentage < 100;
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-zinc-900/40 backdrop-blur-xl p-0 md:p-8 animate-in fade-in duration-700">
            <div className="w-full h-full max-w-7xl bg-white md:rounded-[48px] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-zinc-200/50">

                {/* SIDEBAR */}
                <aside className="w-full md:w-80 bg-zinc-50/80 border-r border-zinc-100 flex flex-col">
                    <div className="p-10 border-b border-zinc-200/50">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="h-11 w-11 rounded-[1.25rem] bg-zinc-100 border border-zinc-200 flex items-center justify-center shadow-sm">
                                <Sparkles className="h-5 w-5 text-zinc-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-zinc-900 tracking-tight leading-none">Ajustes</h2>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Configuración</p>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 p-6 space-y-1.5 overflow-y-auto">
                        {MENU_ITEMS.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeSection === item.id;
                            const showWarning = hasWarnings(item.id);

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveSection(item.id)}
                                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative ${isActive
                                        ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/50 font-bold'
                                        : 'text-zinc-400 hover:bg-zinc-100/80 hover:text-zinc-600 font-medium'
                                        }`}
                                >
                                    {showWarning && (
                                        <div className="absolute -top-1 -right-1 h-5 w-5 bg-amber-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                            <AlertTriangle size={12} className="text-white" />
                                        </div>
                                    )}
                                    <Icon className={`h-5 w-5 transition-all duration-300 ${isActive ? 'text-zinc-900 scale-110' : 'text-zinc-400 group-hover:text-zinc-500'}`} />
                                    <span className="text-sm tracking-tight flex-1 text-left">{item.label}</span>
                                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 shadow-[0_0_8px_rgba(0,0,0,0.1)]" />}
                                    {item.comingSoon && (
                                        <span className="text-[8px] font-black bg-zinc-200 text-zinc-500 px-1.5 py-0.5 rounded-md uppercase tracking-tighter">Soon</span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    <div className="p-8 mt-auto border-t border-zinc-100 bg-white/50 backdrop-blur-sm">
                        <button
                            onClick={onClose}
                            className="w-full h-12 flex items-center justify-center gap-3 bg-white border border-zinc-200 text-zinc-900 rounded-[1.25rem] font-bold text-sm shadow-sm hover:bg-zinc-50 transition-all active:scale-[0.98]"
                        >
                            Finalizar cambios
                        </button>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="flex-1 flex flex-col min-w-0 bg-white relative">
                    <div className="h-24 flex items-center justify-between px-12 border-b border-zinc-50 sticky top-0 bg-white/90 backdrop-blur-md z-10">
                        <div className="flex items-center gap-3 text-sm text-zinc-400 font-medium">
                            Configuración <ChevronRight className="h-4 w-4 text-zinc-300" />
                            <span className="text-zinc-900 font-bold tracking-tight">{MENU_ITEMS.find(m => m.id === activeSection)?.label}</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="h-11 w-11 rounded-2xl hover:bg-zinc-50 flex items-center justify-center text-zinc-300 hover:text-zinc-900 transition-all"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-12">
                        <div className="max-w-3xl mx-auto pb-20">
                            {activeSection === 'company' && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="flex items-start gap-5 p-10 bg-zinc-50 rounded-[40px] border border-zinc-100 mb-12">
                                        <div className="h-14 w-14 rounded-[1.25rem] bg-white border border-zinc-100 flex items-center justify-center shadow-sm flex-shrink-0">
                                            <Building2 className="h-7 w-7 text-zinc-900" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-zinc-900 mb-1.5">Identidad Corporativa</h3>
                                            <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                                                Establece la base operativa de tu organización. Estos datos permiten que la inteligencia artificial personalice el análisis y los benchmarks por sector.
                                            </p>
                                        </div>
                                    </div>
                                    <Step2Company />
                                </div>
                            )}

                            {activeSection === 'structure' && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <Step3Structure />
                                </div>
                            )}

                            {activeSection === 'org' && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <Step4Org />
                                </div>
                            )}

                            {activeSection === 'substitutions' && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <SubstitutionPolicies />
                                </div>
                            )}

                            {activeSection === 'risks' && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <Step6Risks />
                                </div>
                            )}

                            {activeSection === 'mirrors' && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <RiskSettingsMirrors />
                                </div>
                            )}

                            {activeSection === 'available_data' && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="flex items-start gap-5 p-10 bg-zinc-50 rounded-[40px] border border-zinc-100 mb-12">
                                        <div className="h-14 w-14 rounded-[1.25rem] bg-white border border-zinc-100 flex items-center justify-center shadow-sm flex-shrink-0">
                                            <Database className="h-7 w-7 text-zinc-900" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-zinc-900 mb-1.5">Diccionario de Integración</h3>
                                            <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                                                Visualiza la profundidad de la integración con tus sistemas de RRHH.
                                            </p>
                                        </div>
                                    </div>
                                    <AvailableData />
                                </div>
                            )}

                            {activeSection === 'payroll' && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <PayrollSettings />
                                </div>
                            )}
                        </div>
                    </div>
                </main>
                <ConfigCopilot />
            </div>
        </div>
    );
}
