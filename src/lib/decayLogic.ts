export const AVOGADRO_NUMBER = 6.02214076e23;

// Fatores de conversão para ANOS
export const CONVERSIONS_TO_YEARS: Record<string, number> = {
    "segundos": 1 / (365.25 * 24 * 60 * 60),
    "minutos": 1 / (365.25 * 24 * 60),
    "horas": 1 / (365.25 * 24),
    "dias": 1 / 365.25,
    "anos": 1
};

// Cálculo de N0 baseado em massa ou número direto
export function getN0ForCalculation(useMass: boolean, massG: number, n0: number, atomicWeight: number | null | undefined): number {
    if (useMass && atomicWeight) {
        return (massG / atomicWeight) * AVOGADRO_NUMBER;
    }
    return n0;
}

// Fórmula N(t) = N0 * e^(-λt)
export function calculateDecay(N0: number, lambda: number, timeVal: number, timeUnit: string): number {
    const factor = CONVERSIONS_TO_YEARS[timeUnit] || 1;
    const timeInYears = timeVal * factor;
    return N0 * Math.exp(-lambda * timeInYears);
}

// Gera pontos para o gráfico (Substituto do np.linspace do Python)
export function generateDecayPoints(
    N0: number, 
    lambda: number, 
    timeVal: number, 
    timeUnit: string, 
    steps: number = 50,
    useMass: boolean,
    atomicWeight: number | null
) {
    const factorToYears = CONVERSIONS_TO_YEARS[timeUnit] || 1;
    
    // Lógica para determinar até onde o gráfico vai (igual ao Python)
    let maxTime = timeVal;
    if (maxTime <= 0) {
        const halfLifeYears = Math.log(2) / lambda;
        maxTime = (halfLifeYears * 5) / factorToYears;
        if (!maxTime || maxTime === Infinity) maxTime = 100;
    } else {
        maxTime = timeVal * 2.5;
    }

    const dataPoints = [];
    const stepSize = maxTime / steps;

    for (let i = 0; i <= steps; i++) {
        const t = i * stepSize;
        const t_years = t * factorToYears;
        const nuclei = N0 * Math.exp(-lambda * t_years);
        
        let value = nuclei;
        // Se usar massa, converte de volta para gramas
        if (useMass && atomicWeight) {
            value = (nuclei / AVOGADRO_NUMBER) * atomicWeight;
        }

        dataPoints.push({
            time: t,
            value: value,
            formattedTime: t.toExponential(2),
            formattedValue: value.toExponential(2)
        });
    }
    return dataPoints;
}

// Função para baixar CSV (Substituto do botão Exportar)
export function downloadCSV(data: any[], useMass: boolean, unit: string) {
    const header = useMass ? `Tempo (${unit}),Massa Restante (g)` : `Tempo (${unit}),Núcleos Restantes`;
    const rows = data.map(row => `${row.time},${row.value}`).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + header + "\n" + rows;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "decaimento_dados.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}