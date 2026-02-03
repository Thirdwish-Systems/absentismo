// Global company name store using localStorage
// This allows sharing company name between modules without prop drilling

const STORAGE_KEY = "absentismo_company_name";
const DEFAULT_NAME = "ACME";

export function getCompanyName(): string {
    if (typeof window === "undefined") return DEFAULT_NAME;
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_NAME;
}

export function setCompanyName(name: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, name || DEFAULT_NAME);
    // Dispatch custom event so other components can react
    window.dispatchEvent(new CustomEvent("companyNameChanged", { detail: name }));
}

export function useCompanyName(): string {
    // For React components - will update when name changes
    if (typeof window === "undefined") return DEFAULT_NAME;
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_NAME;
}
