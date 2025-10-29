// src/data/isotopes.ts
// Dados dos isótopos (Seu banco de dados)

interface IsotopeData {
    lambda: number;
    half_life: number | string;
    unit: string;
    atomic_weight_g_mol?: number;
}

export const DEFAULT_ISOTOPES: Record<string, IsotopeData> = {
    "Césio-137": { "lambda": 0.02298, "half_life": 30.17, "unit": "anos", "atomic_weight_g_mol": 136.907089 },
    "Carbono-14": { "lambda": 1.20968e-4, "half_life": 5730, "unit": "anos", "atomic_weight_g_mol": 14.0032417 },
    "Tório-232": { "lambda": 4.95105e-11, "half_life": 1.4e10, "unit": "anos", "atomic_weight_g_mol": 232.038055 },
    "Cobalto-60": { "lambda": 0.1315, "half_life": 5.27, "unit": "anos", "atomic_weight_g_mol": 59.933822 },
    "Iodo-131": { "lambda": 31.55, "half_life": 8.02, "unit": "dias", "atomic_weight_g_mol": 130.906124 },
    "Urânio-238": { "lambda": 1.551e-10, "half_life": 4.468e9, "unit": "anos", "atomic_weight_g_mol": 238.050788 }
};