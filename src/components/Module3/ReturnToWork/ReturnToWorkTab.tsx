import React, { useState } from "react";
import {
    LayoutDashboard,
    GitPullRequest,
    BookOpen,
    BarChart3,
    Plus
} from "lucide-react";
import ReturnControlRoom from "./ReturnControlRoom";
import ReturnPipeline from "./ReturnPipeline";
import ReturnAnalytics from "./ReturnAnalytics";
import ReturnPIRModal from "./ReturnPIRModal";

export default function ReturnToWorkTab() {
    const [view, setView] = useState<"control" | "pipeline" | "analytics">("control");
    const [showPIR, setShowPIR] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

    const handleOpenPIR = (employee: any = null) => {
        setSelectedEmployee(employee);
        setShowPIR(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Sub-navigation Header */}
            <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-zinc-200 shadow-sm">
                <div className="flex gap-1">
                    <button
                        onClick={() => setView("control")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${view === "control"
                                ? "bg-zinc-100 text-zinc-900"
                                : "text-zinc-500 hover:bg-zinc-50"
                            }`}
                    >
                        <LayoutDashboard size={14} />
                        Vista General
                    </button>
                    <button
                        onClick={() => setView("pipeline")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${view === "pipeline"
                                ? "bg-zinc-100 text-zinc-900"
                                : "text-zinc-500 hover:bg-zinc-50"
                            }`}
                    >
                        <GitPullRequest size={14} />
                        Casos (Pipeline)
                    </button>
                    <button
                        onClick={() => setView("analytics")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${view === "analytics"
                                ? "bg-zinc-100 text-zinc-900"
                                : "text-zinc-500 hover:bg-zinc-50"
                            }`}
                    >
                        <BarChart3 size={14} />
                        Analytics
                    </button>
                </div>

                <div className="flex items-center gap-2 pr-2">
                    <button
                        onClick={() => handleOpenPIR(null)}
                        className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm shadow-violet-200"
                    >
                        <Plus size={14} />
                        Nuevo Plan Manual
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="min-h-[500px]">
                {view === "control" && <ReturnControlRoom onOpenCase={handleOpenPIR} />}
                {view === "pipeline" && <ReturnPipeline onOpenCase={handleOpenPIR} />}
                {view === "analytics" && <ReturnAnalytics />}
            </div>

            {/* PIR Drawer / Modal */}
            <ReturnPIRModal
                open={showPIR}
                onClose={() => setShowPIR(false)}
                employee={selectedEmployee}
            />
        </div>
    );
}
