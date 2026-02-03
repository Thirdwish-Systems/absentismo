import React, { createContext, useContext, useState, useMemo } from "react";

// --- Global State Types ---
interface CompanyData {
    name: string;
    employees: number;
    salary: number;
    hours: number;
    revenue: number;
}

interface AbsenceRates {
    total: number;
    at: number;
    it_corta: number;
    it_media: number;
    it_larga: number;
}

interface AppContextType {
    company: CompanyData;
    setCompany: React.Dispatch<React.SetStateAction<CompanyData>>;
    absence: AbsenceRates;
    setAbsence: React.Dispatch<React.SetStateAction<AbsenceRates>>;
    // Shared calculations
    payrollYear: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [company, setCompany] = useState<CompanyData>({
        name: "NovaLogística S.L.",
        employees: 320,
        salary: 31500,
        hours: 1780,
        revenue: 18000000,
    });

    const [absence, setAbsence] = useState<AbsenceRates>({
        total: 10.0, // % total
        at: 1.2,
        it_corta: 2.5,
        it_media: 3.4,
        it_larga: 2.9,
    });

    const payrollYear = useMemo(() => company.employees * company.salary, [company]);

    const value = {
        company,
        setCompany,
        absence,
        setAbsence,
        payrollYear,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error("useApp must be used within an AppProvider");
    }
    return context;
}
