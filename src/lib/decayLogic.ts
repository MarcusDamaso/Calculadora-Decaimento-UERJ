// src/lib/decayLogic.ts
// Lógica de Cálculo do Decaimento

export const AVOGADRO_NUMBER = 6.02214076e23; // mol^-1

export const CONVERSIONS_TO_YEARS: Record<string, number> = {
    "segundos": 1 / (365.25 * 24 * 60 * 60),
    "minutos": 1 / (365.25 * 24 * 60),
    "horas": 1 / (365.25 * 24),
    "dias": 1 / 365.25,
    "anos": 1,
};

export function calculateDecay(N0: number, lambda: number, timeValue: number, timeUnit: string): number {
    const t_in_years = timeValue * (CONVERSIONS_TO_YEARS[timeUnit] || 1);
    // Math.exp() é o equivalente a np.exp()
    return N0 * Math.exp(-lambda * t_in_years);
}

interface N0Input {
    useMass: boolean;
    initialMassG: number;
    initialN0: number;
    atomicWeight: number | undefined;
}

export function getN0ForCalculation(input: N0Input): number {
    if (input.useMass) {
        if (!input.atomicWeight || input.atomicWeight <= 0) {
            throw new Error("Peso atômico inválido ou não definido para o cálculo com massa.");
        }
        if (input.initialMassG < 0) {
            throw new Error("Massa inicial não pode ser negativa.");
        }
        return (input.initialMassG / input.atomicWeight) * AVOGADRO_NUMBER;
    } else {
        if (input.initialN0 < 0) {
            throw new Error("N0 (quantidade inicial) não pode ser negativo.");
        }
        return input.initialN0;
    }
}