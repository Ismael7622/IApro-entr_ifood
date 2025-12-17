"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Phone, PhoneOff, ShieldAlert, Fingerprint } from "lucide-react";

export default function CallInterface() {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<"incoming" | "active" | "ended">("incoming");
  const [timer, setTimer] = useState(0);
  const [showFingerprint, setShowFingerprint] = useState(false);
  const [statusText, setStatusText] = useState("Ligação segura recebida");

  // Hold interaction state
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Audio refs
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);
  const audio1Ref = useRef<HTMLAudioElement | null>(null);
  const audio2Ref = useRef<HTMLAudioElement | null>(null);

  // Initialize Audio Objects
  useEffect(() => {
    ringtoneRef.current = new Audio("/sounds/ringtone.mp3");
    ringtoneRef.current.loop = true;

    audio1Ref.current = new Audio("/sounds/mirna audio 1.mp3");
    audio2Ref.current = new Audio("/sounds/mirna audio 2.mp3");

    // Only play ringtone initially
    if (callStatus === "incoming") {
      ringtoneRef.current.play().catch(e => console.log("Auto-play ringtone blocked:", e));
    }

    return () => {
      ringtoneRef.current?.pause();
      audio1Ref.current?.pause();
      audio2Ref.current?.pause();
    };
  }, []); // Run once on mount

  // Watch Call Status changes
  useEffect(() => {
    if (callStatus === "active") {
      setStatusText("Conexão Segura Estabelecida");
      // Stop ringtone
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
      }

      // Start Audio Sequence
      const playSequence = async () => {
        if (audio1Ref.current) {
          try {
            await audio1Ref.current.play();
            audio1Ref.current.onended = () => {
              // 1.5s Delay
              setTimeout(() => {
                if (audio2Ref.current) audio2Ref.current.play();
              }, 1500);
            };
          } catch (e) {
            console.error("Audio play failed:", e);
          }
        }
      };
      playSequence();
    } else if (callStatus === "ended") {
      ringtoneRef.current?.pause();
      audio1Ref.current?.pause();
      audio2Ref.current?.pause();
    }
  }, [callStatus]);


  // Timer logic for active call
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStatus === "active") {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  // Monitor Audio 2 for Fingerprint Trigger
  useEffect(() => {
    const checkAudioTime = () => {
      if (audio2Ref.current && !audio2Ref.current.paused) {
        if (audio2Ref.current.currentTime >= 12 && !showFingerprint) {
          setShowFingerprint(true);
          // Optional: Change status text if desired, but user didn't explicitly ask to change it here, 
          // keeping it consistent or updating to instruction.
          setStatusText("Validação Biométrica Solicitada");
        }
      }
      requestAnimationFrame(checkAudioTime);
    };

    // Only run if active and not showing yet
    if (callStatus === "active" && !showFingerprint) {
      const animationId = requestAnimationFrame(checkAudioTime);
      return () => cancelAnimationFrame(animationId);
    }
  }, [callStatus, showFingerprint]);

  // Hold Interaction Logic
  const startHold = () => {
    setIsHolding(true);
    setHoldProgress(0);

    const startTime = Date.now();
    const duration = 2000; // 2 seconds

    holdIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setHoldProgress(progress);

      if (progress >= 100) {
        clearInterval(holdIntervalRef.current!);
        router.push("/scanner");
      }
    }, 16); // ~60fps
  };

  const endHold = () => {
    setIsHolding(false);
    setHoldProgress(0);
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
    }
  };

  const handleAnswer = () => {
    setCallStatus("active");
  };

  const handleDecline = () => {
    setCallStatus("ended");
    setStatusText("Chamada Recusada");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4 overflow-hidden select-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-800/50 via-neutral-950 to-neutral-950 pointer-events-none" />

      <Card className="relative z-10 w-full max-w-md bg-transparent border-none shadow-none flex flex-col items-center gap-8">
        {/* Avatar / Shield Area */}
        <div className="flex flex-col items-center text-center gap-4">
          <div className="relative">
            {callStatus === "incoming" && (
              <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping" />
            )}
            <Avatar className="h-32 w-32 border-4 border-neutral-800 shadow-2xl">
              <AvatarImage src="/avatar-placeholder.png" alt="Centro Integrado" />
              <AvatarFallback className="bg-neutral-800 text-white">
                <ShieldAlert className="h-16 w-16" />
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
              Centro Integrado de Monitoramento
            </h1>
            <p className="text-sm font-medium text-emerald-400 uppercase tracking-widest animate-pulse">
              {statusText}
            </p>
          </div>
        </div>

        {/* Timer & Status Area */}
        <div className="min-h-[3rem] flex items-center justify-center w-full">
          {callStatus === "active" ? (
            <div className="flex flex-col items-center">
              <span className="text-lg font-mono text-white tracking-widest">{formatTime(timer)}</span>
              <span className="text-xs text-white/50">{showFingerprint ? "Identifique-se" : "Analisando..."}</span>
            </div>
          ) : callStatus === "incoming" ? (
            <span className="text-white/50 animate-pulse text-sm">Chamando...</span>
          ) : (
            <span className="text-red-500 font-bold">Encerrado</span>
          )}
        </div>

        {/* Incoming Call Buttons */}
        {callStatus === "incoming" && (
          <div className="flex w-full items-center justify-between px-8 mt-8">
            <div className="flex flex-col items-center gap-2">
              <Button
                variant="destructive"
                size="icon"
                className="h-20 w-20 rounded-full bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20"
                onClick={handleDecline}
              >
                <PhoneOff className="h-8 w-8 text-white" />
              </Button>
              <span className="text-xs text-white/50">Recusar</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <Button
                variant="default"
                size="icon"
                className="h-20 w-20 rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 animate-bounce"
                onClick={handleAnswer}
              >
                <Phone className="h-8 w-8 text-white" />
              </Button>
              <span className="text-xs text-white/50">Atender</span>
            </div>
          </div>
        )}

        {/* Fingerprint Hold Button (Appears below timer) */}
        {showFingerprint && callStatus === "active" && (
          <div className="flex flex-col items-center gap-2 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div
              className="relative cursor-pointer group"
              onMouseDown={startHold}
              onMouseUp={endHold}
              onMouseLeave={endHold}
              onTouchStart={startHold}
              onTouchEnd={endHold}
            >
              {/* Ring Progress */}
              <svg className="h-24 w-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="46"
                  className="stroke-neutral-800"
                  strokeWidth="4"
                  fill="transparent"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="46"
                  className={`stroke-emerald-500 transition-all duration-100`}
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={289}
                  strokeDashoffset={289 - (289 * holdProgress) / 100}
                />
              </svg>

              {/* Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Fingerprint className={`h-12 w-12 transition-colors duration-300 ${isHolding ? "text-emerald-400 scale-110" : "text-white/50 group-hover:text-emerald-500"}`} />
              </div>
            </div>
            <span className="text-xs text-emerald-500/80 font-mono tracking-wider animate-pulse">
              SEGURE PARA DESBLOQUEAR
            </span>
          </div>
        )}
      </Card>
    </div>
  );
}
