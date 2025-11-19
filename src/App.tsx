import React, { useState, useEffect } from 'react';
// Gráficos
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
// Ícones
import { Calculator, Download, Activity, FileText, Settings, HelpCircle, X } from 'lucide-react';

import { DEFAULT_ISOTOPES } from './data/isotopes';
import { calculateDecay, getN0ForCalculation, generateDecayPoints, downloadCSV, AVOGADRO_NUMBER } from './lib/decayLogic';

const isotopeOptions = Object.keys(DEFAULT_ISOTOPES);
const timeUnits = ["segundos", "minutos", "horas", "dias", "anos"];

export default function App() {
    // --- ESTADOS (Inputs) ---
    const [selectedIsotope, setSelectedIsotope] = useState<string>("Césio-137");
    const [customLambda, setCustomLambda] = useState<number>(DEFAULT_ISOTOPES["Césio-137"].lambda);
    
    const [timeValueStr, setTimeValueStr] = useState<string>("100");
    const [timeUnit, setTimeUnit] = useState<string>("anos");
    const [n0Str, setN0Str] = useState<string>(String(AVOGADRO_NUMBER));
    const [massStr, setMassStr] = useState<string>("0");
    const [useMass, setUseMass] = useState<boolean>(false);
    const [logScale, setLogScale] = useState<boolean>(true);

    // Estado para o número de passos e ajuda
    const [stepsStr, setStepsStr] = useState<string>("20"); 
    const [showHelp, setShowHelp] = useState<boolean>(false);

    // --- ESTADOS (Resultados) ---
    const [resultText, setResultText] = useState<string>("Preencha os dados e clique em CALCULAR.");
    const [halfLifeInfo, setHalfLifeInfo] = useState<string>("");
    
    // Dados agora prontos para o Gráfico e para a Tabela visual
    const [chartData, setChartData] = useState<any[]>([]);
    const [tableData, setTableData] = useState<any[]>([]); // Novo estado específico para a tabela visual

    useEffect(() => {
        const data = DEFAULT_ISOTOPES[selectedIsotope];
        if (data) {
            setCustomLambda(data.lambda);
            setHalfLifeInfo(`Meia-vida: ${data.half_life} ${data.unit}`);
            if (!data.atomic_weight_g_mol && selectedIsotope !== "Personalizado") {
                setUseMass(false);
            }
        }
    }, [selectedIsotope]);

    const handleCalculate = (e?: React.FormEvent) => {
        if(e) e.preventDefault();
        
        try {
            const isoData = DEFAULT_ISOTOPES[selectedIsotope];
            const tVal = parseFloat(timeValueStr) || 0;
            const mVal = parseFloat(massStr) || 0;
            const n0Val = parseFloat(n0Str) || 0;
            
            const stepsVal = parseInt(stepsStr) || 20; 

            if (customLambda <= 0) throw new Error("Lambda deve ser positivo.");
            if (stepsVal <= 1) throw new Error("O número de passos deve ser maior que 1.");

            // 1. Define N0
            const N0_real = getN0ForCalculation(useMass, mVal, n0Val, isoData.atomic_weight_g_mol);

            // 2. Calcula Resultado Pontual
            const resNuclei = calculateDecay(N0_real, customLambda, tVal, timeUnit);
            const halfLifeCalc = (Math.log(2) / customLambda);

            // 3. Monta Texto do Resultado
            let out = `=== RESULTADO ===\n\n`;
            out += `Isótopo: ${selectedIsotope}\n`;
            
            if (useMass) {
                 out += `Entrada: ${mVal.toExponential(4)} g\n`;
            } else {
                 out += `Entrada: ${n0Val.toExponential(4)} núcleos\n`;
            }

            out += `Constante (λ): ${customLambda.toExponential(4)} ano⁻¹\n`;
            out += `Tempo Final: ${tVal.toExponential(4)} ${timeUnit}\n`;
            out += `Meia-vida (Calc): ${halfLifeCalc.toExponential(4)} anos\n\n`;
            
            if (useMass && isoData.atomic_weight_g_mol) {
                const resMass = (resNuclei / AVOGADRO_NUMBER) * isoData.atomic_weight_g_mol;
                out += `Massa Restante: ${resMass.toExponential(4)} g\n`;
            } else {
                out += `Núcleos Restantes: ${resNuclei.toExponential(4)}\n`;
            }
            setResultText(out);

            // 4. Gera Dados (Usado tanto no Gráfico quanto na Tabela)
            const points = generateDecayPoints(N0_real, customLambda, tVal, timeUnit, stepsVal, useMass, isoData.atomic_weight_g_mol);
            setChartData(points);
            setTableData(points); // Salva os dados para desenhar a tabela HTML

        } catch (error) {
            setResultText(`Erro: ${(error as Error).message}`);
        }
    };

    const handleExport = () => {
        if (chartData.length > 0) {
            downloadCSV(chartData, useMass, timeUnit);
        } else {
            alert("Calcule primeiro para gerar dados.");
        }
    };

    const chartLabel = useMass ? "Massa Restante (g)" : "Núcleos Restantes";

    return (
        <div className="app-container">
            
            {/* MODAL DE AJUDA */}
            {showHelp && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Ajuda: Notação Científica</h3>
                            <button onClick={() => setShowHelp(false)} className="btn-close"><X size={20}/></button>
                        </div>
                        <div className="modal-body">
                            <p>Para inserir números muito grandes ou muito pequenos, use a notação 'e'.</p>
                            <p>O <strong>'e'</strong> significa <em>"...vezes 10 elevado a..."</em>.</p>
                            <hr/>
                            <h4>EXEMPLOS:</h4>
                            <ul>
                                <li>1 milhão: <strong>1e6</strong></li>
                                <li>2,5 bilhões: <strong>2.5e9</strong></li>
                                <li>0,00012: <strong>1.2e-4</strong></li>
                            </ul>
                            <p className="note">Use ponto (.) como decimal.</p>
                        </div>
                        <button onClick={() => setShowHelp(false)} className="btn-ok">OK</button>
                    </div>
                </div>
            )}

            <header className="app-header">
                <div className="logo-wrapper">
                    <img src="/logo-uerj.png" alt="Logo UERJ" onError={(e) => e.currentTarget.style.display = 'none'} />
                </div>
                <div>
                    <h1>Calculadora de Decaimento</h1>
                    <p>Instituto de Matematica e Estatística - UERJ</p>
                </div>
            </header>

            <div className="content-wrapper">
                
                {/* CONTROLES (Sidebar) */}
                <aside className="sidebar">
                    <div className="sidebar-title">
                        <Settings size={20} /> Parâmetros
                    </div>

                    <form onSubmit={handleCalculate}>
                        <label>Isótopo</label>
                        <select value={selectedIsotope} onChange={e => setSelectedIsotope(e.target.value)}>
                            {isotopeOptions.map(iso => <option key={iso} value={iso}>{iso}</option>)}
                        </select>

                        <label>Constante (λ, ano⁻¹)</label>
                        <input type="number" step="any" value={customLambda} onChange={e => setCustomLambda(parseFloat(e.target.value))} />
                        <small className="hint">{halfLifeInfo}</small>

                        <label>Tempo Final</label>
                        <div className="input-row">
                            <input type="number" value={timeValueStr} onChange={e => setTimeValueStr(e.target.value)} />
                            <select value={timeUnit} onChange={e => setTimeUnit(e.target.value)}>
                                {timeUnits.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>

                        <div className="divider"></div>

                        <label>Passos da Tabela/Gráfico</label>
                        <input type="number" value={stepsStr} onChange={e => setStepsStr(e.target.value)} placeholder="Ex: 20" />
                        <small className="hint" style={{marginBottom: '10px'}}>Linhas da tabela / Pontos do gráfico</small>

                        <div className="divider"></div>

                        <div className="checkbox-wrapper">
                            <input 
                                type="checkbox" 
                                checked={useMass} 
                                onChange={e => setUseMass(e.target.checked)}
                                disabled={!DEFAULT_ISOTOPES[selectedIsotope]?.atomic_weight_g_mol}
                            />
                            <label>Usar Massa (g)</label>
                        </div>

                        {useMass ? (
                            <>
                                <label>Massa Inicial (g)</label>
                                <input type="number" step="any" value={massStr} onChange={e => setMassStr(e.target.value)} placeholder="Ex: 1.0" />
                            </>
                        ) : (
                            <>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <label style={{marginBottom: 0}}>Núcleos (N0)</label>
                                    <button type="button" className="btn-help" onClick={() => setShowHelp(true)} title="Ajuda"><HelpCircle size={16} /></button>
                                </div>
                                <input type="number" step="any" value={n0Str} onChange={e => setN0Str(e.target.value)} placeholder="Ex: 6.02e23" />
                            </>
                        )}

                        <button type="submit" className="btn-calc">
                            <Calculator size={18} /> CALCULAR
                        </button>
                    </form>

                    <div className="extra-controls">
                        <div className="checkbox-wrapper">
                            <input type="checkbox" checked={logScale} onChange={e => setLogScale(e.target.checked)} />
                            <label>Escala Log (Gráfico)</label>
                        </div>
                        <button onClick={handleExport} className="btn-export">
                            <Download size={18} /> Exportar CSV
                        </button>
                    </div>
                </aside>

                {/* ÁREA PRINCIPAL */}
                <main className="main-display">
                    
                    <div className="panel result-panel">
                        <h3><FileText size={18}/> Resultado</h3>
                        <textarea readOnly value={resultText} />
                    </div>

                    <div className="panel chart-panel">
                        <h3><Activity size={18}/> Curva de Decaimento</h3>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                {/* Margem bottom aumentada para garantir espaço */}
                                <LineChart data={chartData} margin={{top: 5, right: 30, left: 20, bottom: 10}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                    
                                    <XAxis 
                                        dataKey="time" 
                                        stroke="#888"
                                        tickFormatter={(v) => v.toExponential(1)}
                                        label={{ value: `Tempo (${timeUnit})`, position: 'insideBottom', offset: -5, fill: '#ccc' }} 
                                        height={50}
                                    />
                                    
                                    <YAxis 
                                        stroke="#888"
                                        scale={logScale ? 'log' : 'auto'} 
                                        domain={['auto', 'auto']}
                                        tickFormatter={(v) => v.toExponential(1)}
                                        width={80}
                                        label={{ value: chartLabel, angle: -90, position: 'insideLeft', fill: '#888', style: {textAnchor: 'middle'} }}
                                    />
                                    
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#222', border: '1px solid #555' }}
                                        labelFormatter={(v) => `Tempo: ${Number(v).toExponential(2)}`}
                                        formatter={(value: number) => [value.toExponential(4), chartLabel]}
                                    />
                                    
                                    {/* CORREÇÃO DO GRÁFICO: Legenda movida para o TOPO */}
                                    <Legend verticalAlign="top" height={36}/>
                                    
                                    <Line 
                                        type="monotone" 
                                        dataKey="value" 
                                        name={chartLabel} 
                                        stroke="#00bcd4" 
                                        strokeWidth={2} 
                                        dot={true} 
                                        activeDot={{ r: 6 }} 
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="panel table-panel">
                        <h3>Tabela de Dados ({tableData.length > 0 ? tableData.length : 0} linhas)</h3>
                        
                        {/* CORREÇÃO DA TABELA: Usando HTML Table centralizada */}
                        <div className="table-scroll">
                            {tableData.length > 0 ? (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Tempo ({timeUnit})</th>
                                            <th>{useMass ? "Massa (g)" : "Núcleos Restantes"}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tableData.map((row, index) => (
                                            <tr key={index}>
                                                <td>{row.formattedTime}</td>
                                                <td>{row.formattedValue}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="no-data">Clique em Calcular para ver a tabela.</p>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}