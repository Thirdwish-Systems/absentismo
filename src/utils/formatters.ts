export function fmtEUR(n: number): string {
    return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
    }).format(n);
}

export function fmtPct(n: number): string {
    return `${n.toFixed(1)}%`;
}

export function fmtInt(n: number): string {
    return new Intl.NumberFormat("es-ES", {
        maximumFractionDigits: 0,
    }).format(n);
}

export function fmtDate(d: Date): string {
    return new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(d);
}
