import React from "react";
import { MOCK_CASES, ReturnCase } from "./mockData";
import { User, Clock, CheckCircle2 } from "lucide-react";

const COLUMNS = [
    { id: "identified", label: "Identificado", color: "bg-zinc-100 border-zinc-200" },
    { id: "preparing", label: "En Preparación", color: "bg-blue-50 border-blue-100" },
    { id: "day0", label: "Día 0 (Hoy)", color: "bg-violet-50 border-violet-100" },
    { id: "tracking", label: "Seguimiento", color: "bg-emerald-50 border-emerald-100" },
    { id: "closed", label: "Cerrado", color: "bg-zinc-50 border-zinc-100" }
];

export default function ReturnPipeline({ onOpenCase }: { onOpenCase: (c: any) => void }) {

    const getCasesByStatus = (status: string) => MOCK_CASES.filter(c => c.status === status);

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-200px)] min-h-[500px]">
            {COLUMNS.map(col => (
                <div key={col.id} className="min-w-[300px] w-[300px] flex flex-col gap-3">
                    <div className={`p-3 rounded-xl border ${col.color} text-sm font-bold text-zinc-700 flex justify-between items-center`}>
                        {col.label}
                        <span className="bg-white px-2 py-0.5 rounded-md text-xs border border-zinc-100 shadow-sm">
                            {getCasesByStatus(col.id).length}
                        </span>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto">
                        {getCasesByStatus(col.id).map(c => (
                            <div
                                key={c.id}
                                onClick={() => onOpenCase(c)}
                                className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md hover:border-violet-300 cursor-pointer transition-all group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-semibold text-zinc-900 text-sm">{c.employeeName}</div>
                                    <div className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${c.riskScore > 50 ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-zinc-50 text-zinc-500 border-zinc-100"}`}>
                                        Riesgo {c.riskScore}
                                    </div>
                                </div>
                                <div className="text-xs text-zinc-500 mb-3">{c.role} · {c.unit}</div>

                                {c.aptitude === "Apto con limitaciones" && (
                                    <div className="mb-3 flex flex-wrap gap-1">
                                        {c.limitations?.slice(0, 2).map((l, i) => (
                                            <span key={i} className="text-[10px] bg-red-50 text-red-700 border border-red-100 px-1.5 py-0.5 rounded font-medium truncate max-w-full">
                                                {l}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="pt-3 border-t border-zinc-50 flex items-center justify-between text-xs text-zinc-400 font-medium">
                                    <div className="flex items-center gap-1">
                                        <Clock size={12} /> {new Date(c.returnDate).toLocaleDateString("es-ES")}
                                    </div>
                                    <div className="group-hover:text-violet-600 transition-colors">Ver caso &rarr;</div>
                                </div>
                            </div>
                        ))}
                        {getCasesByStatus(col.id).length === 0 && (
                            <div className="p-4 border-2 border-dashed border-zinc-100 rounded-2xl text-center text-xs text-zinc-300 font-medium">
                                Sin casos activos
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
