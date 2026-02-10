import React, { useState, useEffect } from "react";
import {
    X,
    ShieldAlert,
    CheckCircle2,
    ChevronRight,
    Clock,
    Users,
    ArrowRight,
    FileText,
    Brain
} from "lucide-react";
import { ReturnCase } from "./mockData";

interface Props {
    open: boolean;
    onClose: () => void;
    employee: ReturnCase | null;
}

export default function ReturnPIRModal({ open, onClose, employee }: Props) {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

    // Reset state when opening new employee
    useEffect(() => {
        if (open) {
            setStep(1);
            setSelectedTemplate(null);
        }
    }, [open, employee]);

    if (!open || !employee) return null;

    const TEMPLATES = [
        {
            id: "progressive",
            title: "Retorno Progresivo",
            desc: "Reducción de horas/turno durante 2 semanas",
            impact: "Alto",
            icon: Clock
        },
        {
            id: "light_duty",
            title: "Adecuación de Cargas",
            desc: "Limitación temporal de pesos >10kg",
            impact: "Medio",
            icon: ShieldAlert
        },
        {
            id: "shift_change",
            title: "Cambio de Turno (Tarde)",
            desc: "Evitar turno de noche por 1 mes",
            impact: "Muy Alto",
            icon: Users
        }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

                {/* Header */}
                <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-lg font-bold text-zinc-900">Plan Individualizado (PIR)</h2>
                            {employee.riskScore > 50 && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 uppercase tracking-wide">
                                    Riesgo Alto
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-zinc-500 font-medium">
                            {employee.employeeName} · {employee.role} · {employee.unit}
                        </p>
                    </div>
                    <button onClick={onClose} className="h-8 w-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Aptitude Block (Critical) */}
                    <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50">
                        <div className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                <FileText size={16} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-blue-900 mb-1">Condiciones de Aptitud</h3>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    <span className="px-2 py-1 rounded-md bg-white border border-blue-200 text-xs font-bold text-blue-700">
                                        {employee.aptitude}
                                    </span>
                                    {employee.limitations?.map((l, i) => (
                                        <span key={i} className="px-2 py-1 rounded-md bg-white border border-zinc-200 text-xs text-zinc-600">
                                            {l}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-[10px] text-blue-800/70 leading-relaxed">
                                    Recuerda: No utilizar diagnósticos médicos. Solo traducir limitaciones funcionales a ajustes operativos.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stepper Content */}
                    <div className="space-y-6">
                        {/* Step Indicator */}
                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 mb-4">
                            <span className={`px-2 py-1 rounded ${step === 1 ? "bg-violet-600 text-white" : "bg-zinc-100"}`}>1. Plantilla</span>
                            <div className="h-px w-4 bg-zinc-200"></div>
                            <span className={`px-2 py-1 rounded ${step === 2 ? "bg-violet-600 text-white" : "bg-zinc-100"}`}>2. Ajustes</span>
                            <div className="h-px w-4 bg-zinc-200"></div>
                            <span className={`px-2 py-1 rounded ${step === 3 ? "bg-violet-600 text-white" : "bg-zinc-100"}`}>3. Activar</span>
                        </div>

                        {step === 1 && (
                            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                <h3 className="text-sm font-bold text-zinc-900">Selecciona una plantilla base</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {TEMPLATES.map(t => (
                                        <div
                                            key={t.id}
                                            onClick={() => setSelectedTemplate(t.id)}
                                            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-4 ${selectedTemplate === t.id
                                                    ? "bg-violet-50 border-violet-500 ring-1 ring-violet-500"
                                                    : "bg-white border-zinc-200 hover:border-zinc-300"
                                                }`}
                                        >
                                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${selectedTemplate === t.id ? "bg-violet-100 text-violet-600" : "bg-zinc-50 text-zinc-400"}`}>
                                                <t.icon size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-zinc-900 text-sm">{t.title}</div>
                                                <div className="text-xs text-zinc-500">{t.desc}</div>
                                            </div>
                                            <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded uppercase tracking-wide">
                                                Impacto {t.impact}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                <h3 className="text-sm font-bold text-zinc-900">Personalizar Ajustes</h3>
                                <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 space-y-4">
                                    <label className="flex items-center gap-3 bg-white p-3 rounded-xl border border-zinc-200 shadow-sm">
                                        <input type="checkbox" className="h-4 w-4 text-violet-600 rounded" defaultChecked />
                                        <div className="text-sm font-medium text-zinc-700">Asignar "Buddy" de acompañamiento</div>
                                    </label>
                                    <label className="flex items-center gap-3 bg-white p-3 rounded-xl border border-zinc-200 shadow-sm">
                                        <input type="checkbox" className="h-4 w-4 text-violet-600 rounded" defaultChecked />
                                        <div className="text-sm font-medium text-zinc-700">Entrevista de bienvenida (Día 0)</div>
                                    </label>
                                    <label className="flex items-center gap-3 bg-white p-3 rounded-xl border border-zinc-200 shadow-sm">
                                        <input type="checkbox" className="h-4 w-4 text-violet-600 rounded" />
                                        <div className="text-sm font-medium text-zinc-700">Solicitar revisión ergonómica PRL</div>
                                    </label>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                <div className="bg-emerald-50 p-6 rounded-[24px] border border-emerald-100 text-center">
                                    <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-emerald-600">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold text-emerald-900 mb-1">Todo listo para activar</h3>
                                    <p className="text-sm text-emerald-800/80 mb-6 max-w-sm mx-auto">
                                        Se notificará al mando directo y se crearán 3 tareas de seguimiento en el calendario.
                                    </p>

                                    <div className="text-left bg-white p-4 rounded-xl border border-emerald-100 shadow-sm text-xs space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500">Plantilla:</span>
                                            <span className="font-bold text-zinc-900">Retorno Progresivo</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500">Inicio:</span>
                                            <span className="font-bold text-zinc-900">{new Date().toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500">Coste estimado PIR:</span>
                                            <span className="font-bold text-zinc-900">0€ (Ajuste interno)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-6 border-t border-zinc-100 bg-white flex justify-between items-center sticky bottom-0">
                    <button
                        onClick={() => step > 1 ? setStep(s => s - 1 as 1 | 2 | 3) : onClose()}
                        className="px-6 py-3 rounded-xl text-xs font-bold text-zinc-500 hover:bg-zinc-50 transition-colors"
                    >
                        {step === 1 ? "Cancelar" : "Atrás"}
                    </button>

                    <button
                        onClick={() => {
                            if (step < 3) setStep(s => s + 1 as 1 | 2 | 3);
                            else onClose(); // Activate logic here
                        }}
                        disabled={step === 1 && !selectedTemplate}
                        className="px-8 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all shadow-lg shadow-violet-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {step === 3 ? "ACTIVAR PLAN" : (
                            <>
                                Siguiente <ChevronRight size={14} />
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}
