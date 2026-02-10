import React from 'react';
import { Brain, FileText, Download, Zap, MessageSquare } from 'lucide-react';

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "violet" }) {
    const cls = tone === "violet" ? "bg-violet-50 text-violet-700 border-violet-200" : "bg-zinc-50 text-zinc-700 border-zinc-200";
    return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${cls}`}>{children}</span>;
}

interface PredictionCopilotProps {
    mode?: 'general' | 'detail';
    riskContext?: any;
}

export default function PredictionCopilot({ mode = 'general', riskContext }: PredictionCopilotProps) {
    return (
        <div className="flex h-full flex-col rounded-[32px] border border-zinc-200 bg-white shadow-sm overflow-hidden sticky top-6 max-h-[calc(100vh-140px)]">
            <div className="flex items-center justify-between gap-3 p-5 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-200">
                        <Brain className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-zinc-900">Copiloto IA</div>
                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                            {mode === 'detail' ? 'Análisis de Riesgo' : 'Mesa de Análisis'}
                        </div>
                    </div>
                </div>
                <Badge tone="violet">Activo</Badge>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {mode === 'general' ? (
                    // GENERAL MODE CONTENT
                    <>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-5 rounded-full bg-violet-100 flex items-center justify-center text-[10px] font-bold text-violet-600">IA</div>
                                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Resumen del día</span>
                            </div>
                            <div className="bg-zinc-50 p-4 rounded-3xl border border-zinc-100 text-sm text-zinc-700 leading-relaxed shadow-sm">
                                He detectado <strong>3 riesgos nuevos</strong> de alta probabilidad esta mañana. La tensión operativa subirá al 85% el día 15 de febrero si no intervenimos en Alcorcón.
                            </div>
                        </div>
                    </>
                ) : (
                    // DETAIL MODE CONTENT (Expert Advice & Recommendations)
                    <>
                        {/* EXPERT ADVICE */}
                        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">EX</div>
                                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">Consejo Experto</span>
                            </div>
                            <div className="bg-indigo-50 p-4 rounded-3xl border border-indigo-100 text-sm text-indigo-900 leading-relaxed shadow-sm">
                                Este centro ha tenido picos similares en las últimas 3 semanas. <br /><br />
                                <strong>No se recomienda</strong> usar horas extra del mismo equipo; mejor reasignar personal de un centro cercano para evitar bajas por agotamiento.
                            </div>
                        </div>

                        {/* AI RECOMMENDATION */}
                        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-5 rounded-full bg-violet-100 flex items-center justify-center text-[10px] font-bold text-violet-600">IA</div>
                                <span className="text-[11px] font-bold text-violet-500 uppercase tracking-widest">Recomendación</span>
                            </div>
                            <div className="bg-violet-600 p-4 rounded-3xl text-sm text-white leading-relaxed shadow-xl shadow-violet-100">
                                La fiabilidad del 85% indica una señal fuerte. Hemos cruzado esta predicción con el calendario de eventos locales.
                                <br /><br />
                                <strong>Acción Sugerida:</strong> Activar protocolo de "Cobertura Cruzada" con tienda {riskContext?.location.split('-')[0]} Oeste (+2km).

                                <div className="mt-4 flex gap-2">
                                    <button className="flex-1 py-2 bg-white text-violet-700 rounded-xl text-xs font-bold shadow-sm whitespace-nowrap">
                                        Activar Auto
                                    </button>
                                    <button className="flex-1 py-2 bg-violet-700 border border-violet-500 text-white rounded-xl text-xs font-bold shadow-sm whitespace-nowrap">
                                        + Crear Nuevo
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="p-5 border-t border-zinc-100 bg-zinc-50/50">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Pregunta sobre este riesgo..."
                        className="w-full h-12 pl-4 pr-12 bg-white border border-zinc-200 rounded-2xl text-sm shadow-inner outline-none focus:border-violet-300 transition-colors"
                    />
                    <div className="absolute right-2 top-2 h-8 w-8 bg-violet-600 rounded-xl flex items-center justify-center text-white shadow-md">
                        <Zap className="h-4 w-4" />
                    </div>
                </div>
            </div>
        </div>
    );
}
