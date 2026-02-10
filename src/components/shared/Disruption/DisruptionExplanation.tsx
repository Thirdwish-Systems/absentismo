import React, { useState } from "react";
import { Info, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

export default function DisruptionExplanation() {
    const [showDetails, setShowDetails] = useState(false);

    return (
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden mb-8">
            {/* Header Simple - Siempre visible */}
            <div className="p-6 bg-gradient-to-r from-zinc-50 to-white">
                <h3 className="text-lg font-bold text-zinc-900 mb-2 flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-violet-500" />
                    ¿Qué estamos midiendo aquí?
                </h3>
                <p className="text-sm text-zinc-500 max-w-3xl">
                    Para entender la salud de su operación, utilizamos dos indicadores.
                    Uno mira al pasado (Frecuencia) y otro mira al futuro (Impacto Real).
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-100 border-t border-zinc-100">

                {/* BRADFORD - Explicación Simple */}
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">B</div>
                        <div>
                            <h4 className="font-bold text-zinc-900">Factor Bradford</h4>
                            <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">La "Repetitividad"</span>
                        </div>
                    </div>
                    <p className="text-sm text-zinc-600 mb-4">
                        <strong>¿Qué pregunta responde?</strong><br />
                        "¿Con qué frecuencia se rompe la rutina de trabajo?"
                    </p>
                    <div className="bg-zinc-50 rounded-xl p-3 text-xs text-zinc-500 border border-zinc-100">
                        <p>
                            <span className="font-semibold text-zinc-900">Ejemplo claro:</span><br />
                            Es peor para la organización que alguien falte 10 veces (1 día cada vez) a que falte una sola vez durante 10 días seguidos. La interrupción constante es lo que daña la operación.
                        </p>
                    </div>
                </div>

                {/* ODI - Explicación Simple */}
                <div className="p-6 bg-violet-50/10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-sm">ODI</div>
                        <div>
                            <h4 className="font-bold text-zinc-900">Índice ODI</h4>
                            <span className="text-[10px] uppercase font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">El "Dolor de Negocio"</span>
                        </div>
                    </div>
                    <p className="text-sm text-zinc-600 mb-4">
                        <strong>¿Qué pregunta responde?</strong><br />
                        "¿Cuánto dinero y productividad perdemos realmente por estas ausencias?"
                    </p>
                    <div className="bg-white rounded-xl p-3 text-xs text-zinc-500 border border-violet-100 shadow-sm">
                        <p>
                            <span className="font-semibold text-zinc-900">Más allá de la ausencia:</span><br />
                            No es lo mismo que falte un administrativo un martes flojo, a que falte el Jefe de Turno el día de mayor producción. El ODI calcula ese coste real.
                        </p>
                    </div>
                </div>
            </div>

            {/* Toggle para Expertos */}
            <div
                onClick={() => setShowDetails(!showDetails)}
                className="w-full bg-zinc-50 border-t border-zinc-100 p-2 flex items-center justify-center gap-2 cursor-pointer hover:bg-zinc-100 transition-colors"
            >
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    {showDetails ? "Ocultar Fórmulas y Detalles Técnicos" : "Ver Fórmulas (Modo Experto)"}
                </span>
                {showDetails ? <ChevronUp className="h-3 w-3 text-zinc-400" /> : <ChevronDown className="h-3 w-3 text-zinc-400" />}
            </div>

            {/* Detalles Técnicos (Ocultos por defecto) */}
            {showDetails && (
                <div className="p-6 bg-zinc-50 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-zinc-200 animate-in slide-in-from-top-2 duration-200">
                    <div>
                        <h5 className="text-xs font-bold text-zinc-900 uppercase mb-2">Fórmula Bradford</h5>
                        <code className="text-xs bg-white border border-zinc-200 px-2 py-1 rounded">B = S² × D</code>
                        <ul className="mt-2 text-xs text-zinc-500 space-y-1 list-disc pl-4">
                            <li><strong>S (Spells):</strong> Número de episodios (bajas distintas).</li>
                            <li><strong>D (Days):</strong> Días totales de ausencia.</li>
                            <li>Penaliza exponencialmente la frecuencia (S).</li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="text-xs font-bold text-zinc-900 uppercase mb-2">Composición del ODI</h5>
                        <ul className="mt-2 text-xs text-zinc-500 space-y-1 list-disc pl-4">
                            <li><strong>Impacto Financiero:</strong> Coste directo + Coste de sustitución.</li>
                            <li><strong>Criticidad:</strong> Peso del rol en la cadena de valor.</li>
                            <li><strong>Fatiga:</strong> Horas extra generadas en el equipo restante.</li>
                            <li><strong>Predictivo IA:</strong> Probabilidad de repetición del patrón.</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
