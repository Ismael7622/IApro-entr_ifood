"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { ShieldAlert, Cpu, Lock, MapPin } from "lucide-react";

export default function ScannerPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [stage, setStage] = useState(0);

  // Typewriter effect helper (simplified: just adds full lines for now, or character by character if needed.
  // Prompt asked for "Linhas de texto digitando (typewriter)". I will simulate by adding lines with delay.
  // For true char-by-char, I'd need a more complex hook, but line-by-line is often enough for "hacker" feel + css blinking cursor.

  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    const runSequence = async () => {
      // Stage 0: Initial
      await delay(500);
      addLog("Inicializando análise de território...");
      setStage(1);

      // Stage 1: Crossing Data
      await delay(2000);
      addLog("Cruzando dados: horário + modelo da moto + taxa de roubo na região...");
      setStage(2);

      // Animate progress to 42% slowly
      animateProgress(0, 42, 1500);
      await delay(2000);

      // Stage 2: 42%
      addLog("[███░░░░░░] 42% — Risco moderado detectado");
      setStage(3);
      await delay(1500);

      // Stage 3: Unusual Increase
      addLog("Detectado: aumento incomum de ocorrências próximas ao seu raio atual.");
      setStage(4);
      await delay(2000);

      // Stage 4: 78%
      animateProgress(42, 78, 1500);
      await delay(2000);
      addLog("[███████░░] 78% — Exposição acima do normal");
      setStage(5);

      // Finish
      await delay(3000);
      router.push("/quiz");
    };

    runSequence();
  }, [router]);

  const addLog = (text: string) => {
    setLogs((prev) => [...prev, text]);
  };

  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  // Simple linear interpolation for progress for smooth visual
  const animateProgress = (start: number, end: number, duration: number) => {
    const startTime = Date.now();
    const tick = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);
      const current = start + (end - start) * progressRatio;
      setProgress(current);
      if (progressRatio < 1) {
        requestAnimationFrame(tick);
      }
    };
    tick();
  };

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col justify-between overflow-hidden relative">
      {/* Background Grid / Hacker Vibes */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,50,0,0.1)_1px,_transparent_1px),linear-gradient(90deg,rgba(0,50,0,0.1)_1px,_transparent_1px)] bg-[size:20px_20px]" />
      <div className="absolute inset-0 bg-black/80" />

      <div className="relative z-10 flex flex-col h-full max-w-md mx-auto w-full pt-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-8 uppercase tracking-widest text-xs text-green-700 border-b border-green-900 pb-2">
          <Cpu className="h-4 w-4 animate-spin-slow" />
          <span>Sistema de Monitoramento v4.0</span>
        </div>

        {/* Main Logs Area */}
        <div className="flex-1 space-y-4 overflow-y-auto mb-8 pr-2 scrollbar-hide">
          {logs.map((log, i) => (
            <div key={i} className="border-l-2 border-green-600 pl-3 leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-500">
              <span className="text-green-400 opacity-80 text-sm">
                {">"} {log}
              </span>
            </div>
          ))}
          {/* Cursor effect */}
          <div className="animate-pulse text-green-500">_</div>
        </div>

        {/* Progress Section */}
        <div className="mb-12 space-y-2">
          <div className="flex justify-between text-xs uppercase text-green-700 font-bold tracking-widest">
            <span>Análise de Risco</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-4 bg-green-900/20 border border-green-800 [&>[data-slot=progress-indicator]]:bg-green-500 [&>[data-slot=progress-indicator]]:shadow-[0_0_10px_2px_rgba(34,197,94,0.5)]" />

          {/* Danger indicators - flashing based on progress */}
          {progress > 50 && (
            <div className="mt-4 p-3 border border-red-500/50 bg-red-900/10 text-red-500 text-center animate-pulse rounded">
              <div className="flex items-center justify-center gap-2">
                <ShieldAlert className="h-5 w-5" />
                <span className="font-bold">ALERTA DE RISCO ELEVADO</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
