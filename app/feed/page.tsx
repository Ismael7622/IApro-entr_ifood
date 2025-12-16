"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Share2, Play, Pause } from "lucide-react";

export default function FeedPage() {
    const router = useRouter();
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const videoDuration = 8000; // 8 seconds fake video length

    const mounted = useRef(false);

    useEffect(() => {
        // Auto-redirect timer
        const redirectTimer = setTimeout(() => {
            router.push("/dashboard");
        }, videoDuration + 500);

        return () => clearTimeout(redirectTimer);
    }, [router]);

    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) return 100;
                return prev + (100 / (videoDuration / 100)); // Update every 100ms
            });
        }, 100);

        return () => clearInterval(interval);
    }, [isPlaying]);

    return (
        <div className="relative h-screen bg-black text-white flex flex-col justify-between overflow-hidden">
            {/* Background Image / Placeholder for Video */}
            {/* Using a dark grainy background to simulate video content */}
            <div className="absolute inset-0 bg-[#1a1a1a] flex items-center justify-center">
                {/* Simulated Video Content */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1596484552882-628a7e02df59?q=80&w=1887&auto=format&fit=crop')] bg-cover bg-center grayscale brightness-50 contrast-125 animate-in zoom-in-105 duration-[10s]"></div>
                <div className="z-10 text-center p-8 bg-black/40 backdrop-blur-sm rounded-xl">
                    <Play className="h-12 w-12 text-white/80 mx-auto mb-4 animate-pulse" />
                    <p className="text-xl font-bold tracking-wider uppercase">Reproduzindo Prova...</p>
                </div>
            </div>

            {/* Overlay UI */}
            <div className="relative z-20 flex flex-col h-full justify-end p-4 pb-12 bg-gradient-to-t from-black via-black/40 to-transparent">

                {/* Sidebar Actions */}
                <div className="absolute right-4 bottom-24 flex flex-col gap-6 items-center">
                    <div className="flex flex-col items-center gap-1">
                        <div className="bg-neutral-800/50 p-2 rounded-full cursor-pointer hover:bg-neutral-700/50">
                            <Heart className="h-8 w-8 text-white stroke-[2px]" />
                        </div>
                        <span className="text-xs font-bold shadow-black drop-shadow-md">12.4K</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <div className="bg-neutral-800/50 p-2 rounded-full cursor-pointer hover:bg-neutral-700/50">
                            <MessageCircle className="h-8 w-8 text-white stroke-[2px]" />
                        </div>
                        <span className="text-xs font-bold shadow-black drop-shadow-md">842</span>
                    </div>
                    <div className="bg-neutral-800/50 p-2 rounded-full cursor-pointer hover:bg-neutral-700/50">
                        <Share2 className="h-8 w-8 text-white stroke-[2px]" />
                    </div>
                </div>

                {/* Text Details */}
                <div className="mb-4 pr-16 space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 bg-red-600 rounded-full flex items-center justify-center font-bold text-xs shadow-lg">doc</div>
                        <span className="font-semibold text-sm shadow-black drop-shadow-md">Documentário Realidade Urbana</span>
                    </div>

                    <h1 className="text-xl font-bold leading-tight break-words shadow-black drop-shadow-md">
                        "Isso acontece todos os dias."
                    </h1>
                    <p className="text-sm font-medium opacity-90 shadow-black drop-shadow-md">
                        Eles não mostram isso no noticiário… mas você vive isso na pele.
                    </p>
                    <div className="flex flex-wrap gap-2 text-sm font-bold opacity-80 mt-2">
                        <span>#documentario</span>
                        <span>#ruaperigosa</span>
                        <span>#entregadores</span>
                    </div>
                </div>

                {/* Scrolling Text (Marquee) */}
                <div className="flex items-center gap-2 mb-4 opacity-70">
                    <Play className="h-3 w-3 fill-current" />
                    <span className="text-xs marquee whitespace-nowrap overflow-hidden">
                        Som original - Documentário Realidade Urbana • Visualizações: 2.1M
                    </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-white transition-all duration-100 ease-linear rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                </div>

            </div>
        </div>
    );
}
