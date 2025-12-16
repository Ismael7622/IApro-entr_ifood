"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Phone, PhoneOff, ShieldAlert } from "lucide-react";

export default function CallInterface() {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<"incoming" | "active" | "ended">("incoming");
  const [timer, setTimer] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio("/sounds/ringtone.mp3");
    audioRef.current.loop = true;

    // Attempt play
    audioRef.current.play().catch(e => console.log("Autoplay blocked:", e));

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Timer effect when active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStatus === "active") {
      // Stop ringtone when active
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else if (callStatus === "ended") {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  // Auto-transition effect after 4s active
  useEffect(() => {
    if (callStatus === "active" && timer >= 4) {
      router.push("/scanner");
    }
  }, [callStatus, timer, router]);

  const handleAnswer = () => {
    setCallStatus("active");
  };

  const handleDecline = () => {
    setCallStatus("ended");
    // Optional: reset or show ended state
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Background blur/glow effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-800/50 via-neutral-950 to-neutral-950 pointer-events-none" />

      <Card className="relative z-10 w-full max-w-md bg-transparent border-none shadow-none flex flex-col items-center gap-8">
        {/* Avatar / Caller Info */}
        <div className="flex flex-col items-center text-center gap-4">
          <div className="relative">
            {/* Pulse ring for incoming */}
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
            <p className="text-sm font-medium text-emerald-400 uppercase tracking-widest">
              {callStatus === "incoming" ? "Ligação segura recebida" : "Conexão Segura Estabelecida"}
            </p>
          </div>
        </div>

        {/* Status / Timer */}
        <div className="h-12 flex items-center justify-center">
          {callStatus === "active" ? (
            <div className="flex flex-col items-center animate-pulse">
              <span className="text-lg font-mono text-white">{formatTime(timer)}</span>
              <span className="text-xs text-white/50">Analisando...</span>
            </div>
          ) : callStatus === "incoming" ? (
            <span className="text-white/50 animate-pulse text-sm">Chamando...</span>
          ) : (
            <span className="text-red-500 font-bold">Chamada Encerrada</span>
          )}
        </div>

        {/* Buttons */}
        {callStatus === "incoming" && (
          <div className="flex w-full items-center justify-between px-8 mt-8">
            {/* Text labels for accessibility/clarity if needed, but style calls for simple buttons */}
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
                variant="default" // Will style with green manually
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
      </Card>
    </div>
  );
}
