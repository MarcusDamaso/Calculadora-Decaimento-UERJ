// src/App.tsx
import React, { useState, useEffect } from 'react';
// Importamos a lógica e os dados que criamos
import { calculateDecay, getN0ForCalculation, AVOGADRO_NUMBER } from './lib/decayLogic';
import { DEFAULT_ISOTOPES } from './data/isotopes'; 

const isotopeOptions = Object.keys(DEFAULT_ISOTOPES);
const timeUnits = ["segundos", "minutos", "horas", "dias", "anos"];

// O componente Calculator (equivalente ao seu CalculatorFrame)
function Calculator() {
    // --- Estados para Inputs ---
    const [selectedIsotope, setSelectedIsotope] = useState<string>(isotopeOptions[0]);
    const [customLambda, setCustomLambda] = useState<number>(DEFAULT_ISOTOPES[isotopeOptions[0]]?.lambda || 0.0);
    const [timeValue, setTimeValue] = useState<number>(100);
    const [timeUnit, setTimeUnit] = useState<string>("anos");
    const [initialN0, setInitialN0] = useState<number>(AVOGADRO_NUMBER); // 1 mol por padrão
    const [initialMassG, setInitialMassG] = useState<number>(0);
    const [useMass, setUseMass] = useState<boolean>(false);
    
    // --- Estados para Resultados e Infos ---
    const [resultText, setResultText] = useState<string>("Preencha os dados e clique em CALCULAR.");
    const [halfLifeText, setHalfLifeText] = useState<string>("");

    // Atualiza o lambda e meia-vida ao mudar o isótopo
    useEffect(() => {
        const isotope = DEFAULT_ISOTOPES[selectedIsotope];
        if (isotope) {
            setCustomLambda(isotope.lambda);
            setHalfLifeText(`Meia-vida: ${isotope.half_life} ${isotope.unit}`);
            // Se o isótopo não tiver peso atômico, força o uso de N0
            if (!isotope.atomic_weight_g_mol) {
                setUseMass(false);
            }
        }
    }, [selectedIsotope]);

    const handleCalculate = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const isotopeData = DEFAULT_ISOTOPES[selectedIsotope];
            
            // 1. Obtém N0
            const N0_for_calc = getN0ForCalculation({
                useMass: useMass,
                initialMassG: initialMassG,
                initialN0: initialN0,
                atomicWeight: isotopeData?.atomic_weight_g_mol
            });

            if (customLambda <= 0) {
                setResultText("Erro: Constante de decaimento (λ) deve ser positiva.");
                return;
            }

            // 2. Calcula o decaimento
            const resultNuclei = calculateDecay(N0_for_calc, customLambda, timeValue, timeUnit);
            const calculatedHalfLifeYears = (Math.log(2) / customLambda).toExponential(4);

            // 3. Formata o Resultado
            let output = `=== RESULTADO DO CÁLCULO DE DECAIMENTO ===\n\n`;
            output += `Isótopo: ${selectedIsotope}\n`;
            output += `N0 usado no cálculo: ${N0_for_calc.toExponential(4)} núcleos\n`;
            output += `Lambda (λ): ${customLambda.toExponential(4)} (1/anos)\n`;
            output += `Tempo: ${timeValue} ${timeUnit}\n`;
            output += `Meia-vida (de λ): ${calculatedHalfLifeYears} anos\n\n`;

            if (useMass && isotopeData?.atomic_weight_g_mol) {
                const remainingMassG = (resultNuclei / AVOGADRO_NUMBER) * isotopeData.atomic_weight_g_mol;
                output += `Massa restante: ${remainingMassG.toExponential(4)} g\n`;
                output += `(equivale a ${resultNuclei.toExponential(4)} núcleos)\n`;
            } else {
                output += `Quantidade restante (N(t)): ${resultNuclei.toExponential(4)} núcleos\n`;
            }
            setResultText(output);

        } catch (error) {
            setResultText(`Erro na entrada: ${(error as Error).message}. Verifique os valores.`);
        }
    };

    return (
        <div className="main-container">
            {/* Painel de Controle (Sidebar) */}
            <form className="control-panel" onSubmit={handleCalculate}>
                <h2>Calculadora de Decaimento</h2>
                
                <label>Selecionar Isótopo:</label>
                <select value={selectedIsotope} onChange={e => setSelectedIsotope(e.target.value)}>
                    {isotopeOptions.map(iso => <option key={iso} value={iso}>{iso}</option>)}
                </select>
                
                <label>Constante (λ, 1/anos):</label>
                <input type="number" step="any" value={customLambda} onChange={e => setCustomLambda(parseFloat(e.target.value))} />
                <small className="half-life-info">{halfLifeText}</small>

                <label>Tempo:</label>
                <input type="number" step="any" value={timeValue} onChange={e => setTimeValue(parseFloat(e.target.value))} />
                <select value={timeUnit} onChange={e => setTimeUnit(e.target.value)}>
                    {timeUnits.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                </select>

                <hr />
                
                <label className="checkbox-label">
                    <input type="checkbox" checked={useMass} 
                           onChange={e => setUseMass(e.target.checked)}
                           disabled={!DEFAULT_ISOTOPES[selectedIsotope]?.atomic_weight_g_mol} />
                    Calcular usando **Massa** (g)
                </label>

                <label>Massa Inicial (g):</label>
                <input type="number" step="any" value={initialMassG} onChange={e => setInitialMassG(parseFloat(e.target.value))} 
                       disabled={!useMass} placeholder="Massa em gramas (ex: 1.0)" />

                <label>Quantidade Inicial (N0):</label>
                <input type="number" step="any" value={initialN0} onChange={e => setInitialN0(parseFloat(e.target.value))} 
                       disabled={useMass} placeholder="Nº de núcleos (ex: 6.022e23)" />

                <button type="submit">CALCULAR</button>
                <button type="button" className="secondary-btn">Gerar Gráfico (próximo passo!)</button>
                <button type="button" className="secondary-btn">Exportar Tabela (CSV)</button>
            </form>

            {/* Painel de Resultado */}
            <div className="result-panel">
                <h3>Resultado: N(t) e Massa</h3>
                <textarea value={resultText} readOnly />
                
                <h3>Tabela de Decaimento</h3>
                <textarea value="A tabela será exibida aqui." readOnly />
            </div>
        </div>
    );
}

// O App principal que usa o componente Calculator
export default Calculator;