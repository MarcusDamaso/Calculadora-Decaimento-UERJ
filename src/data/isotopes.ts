export interface IsotopeData {
    lambda: number;
    half_life: number;
    unit: string;
    atomic_weight_g_mol: number | null;
}

export const DEFAULT_ISOTOPES: Record<string, IsotopeData> = {
    "Césio-137": { lambda: 0.02298, half_life: 30.17, unit: "anos", atomic_weight_g_mol: 136.907 },
    "Carbono-14": { lambda: 1.21e-4, half_life: 5730, unit: "anos", atomic_weight_g_mol: 14.003 },
    "Cobalto-60": { lambda: 0.1315, half_life: 5.27, unit: "anos", atomic_weight_g_mol: 59.933 },
    "Iodo-131": { lambda: 31.55, half_life: 8.02, unit: "dias", atomic_weight_g_mol: 130.906 },
    "Urânio-238": { lambda: 1.55e-10, half_life: 4.468e9, unit: "anos", atomic_weight_g_mol: 238.051 },
    "Técnecio-99m": { lambda: 1010.3, half_life: 6.01, unit: "horas", atomic_weight_g_mol: 98.906 },
    "Polônio-210": { lambda: 1.828, half_life: 138.376, unit: "dias", atomic_weight_g_mol: 209.98 },
    "Rádio-226": { lambda: 4.33e-4, half_life: 1600, unit: "anos", atomic_weight_g_mol: 226.025 },
    "Trítio (H-3)": { lambda: 0.056, half_life: 12.32, unit: "anos", atomic_weight_g_mol: 3.016 },
    "Personalizado": { lambda: 0.1, half_life: 0, unit: "anos", atomic_weight_g_mol: null }
};