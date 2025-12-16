"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Radar, Target, Map, Activity } from "lucide-react";

export default function DashboardPage() {
    const router = useRouter();
    const [logs, setLogs] = useState<string[]>([]);
    const [accuracy, setAccuracy] = useState(0);

    const mounted = useRef(false);

    useEffect(() => {
        if (mounted.current) return;
        mounted.current = true;

        const runSequence = async () => {
            await delay(500);
            addLog("Conectando à malha urbana...");

            await delay(1500);
            addLog("IA detecta padrões anormais → rota suspeita identificada.");

            // Animate accuracy
            let acc = 0;
            const interval = setInterval(() => {
                acc += 2;
                if (acc >= 91) {
                    acc = 91;
                    clearInterval(interval);
                }
                setAccuracy(acc);
            }, 50);

            await delay(3000);
            addLog("Sistema pronto. Iniciando contra-medidas.");

            await delay(3000);
            router.push("/vsl");
        };

        runSequence();
    }, [router]);

    const addLog = (text: string) => {
        setLogs(prev => [...prev, text]);
    };

    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    return (
        <div className="h-screen bg-black text-cyan-400 font-mono overflow-hidden relative flex flex-col p-4">
            {/* Background Map Effect */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Sao_paulo_night_map.jpg/800px-Sao_paulo_night_map.jpg')] bg-cover bg-center"></div>
            <div className="absolute inset-0 bg-black/60"></div>

            {/* Radar Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[600px] h-[600px] border border-cyan-500/30 rounded-full animate-ping opacity-10"></div>
                <div className="w-[400px] h-[400px] border border-cyan-500/50 rounded-full flex items-center justify-center">
                    <div className="w-full h-[1px] bg-cyan-500/50 animate-spin-slow origin-center absolute"></div>
                </div>
            </div>

            {/* Random Red Dots Simulation */}
            <div className="absolute inset-0">
                <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_red] animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_red] animate-bounce"></div>
                <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_red] animate-ping duration-[3000ms]"></div>
            </div>

            {/* Header */}
            <div className="relative z-10 flex justify-between items-center border-b border-cyan-900 pb-2 mb-4">
                <div className="flex items-center gap-2">
                    <Radar className="h-5 w-5 animate-spin" />
                    <span className="text-sm uppercase tracking-widest">Monitoramento Ativo</span>
                </div>
                <div className="text-xs text-cyan-700">LIVE FEED</div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex-1 flex flex-col justify-end pb-12">
                {/* Logs */}
                <div className="space-y-2 mb-8 h-32 overflow-y-auto">
                    {logs.map((log, i) => (
                        <div key={i} className="flex gap-2 text-sm animate-in fade-in slide-in-from-left duration-500">
                            <span className="text-cyan-700">{">"}</span>
                            <span className="text-white shadow-black drop-shadow-md">{log}</span>
                        </div>
                    ))}
                </div>

                {/* Accuracy Meter */}
                <div className="space-y-1">
                    <div className="flex justify-between text-xs uppercase font-bold">
                        <span>Probabilidade de Risco</span>
                        <span>{accuracy}%</span>
                    </div>
                    <div className="h-2 bg-cyan-900/50 rounded-full overflow-hidden border border-cyan-800">
                        <div className="h-full bg-cyan-500 shadow-[0_0_10px_cyan]" style={{ width: `${accuracy}%`, transition: 'width 0.1s' }}></div>
                    </div>
                    {accuracy >= 90 && (
                        <div className="text-xs text-center text-cyan-300 animate-pulse mt-2">[ ALVO CONFIRMADO ]</div>
                    )}
                </div>
            </div>
        </div>
    );
}
