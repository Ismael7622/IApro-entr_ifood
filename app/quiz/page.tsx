"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MoreVertical, Phone, Video, Send, ShieldAlert } from "lucide-react";

type Message = {
    id: number;
    text: string;
    sender: "ia" | "user";
    time: string;
};

type QuizStep = {
    id: number;
    question?: string; // If null, it's just a statement
    options?: string[]; // If present, show these buttons
    nextDelay?: number; // Delay before next step
};

// Simplified flow configuration
// We'll manage flow via a simple step index in a useEffect
export default function QuizPage() {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [showOptions, setShowOptions] = useState<string[] | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const mounted = useRef(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        if (mounted.current) return;
        mounted.current = true;

        startQuiz();
    }, []);

    const addMessage = (text: string, sender: "ia" | "user") => {
        const time = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        setMessages((prev) => [...prev, { id: Date.now(), text, sender, time }]);
    };

    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

    const startQuiz = async () => {
        // 1. "Precisamos confirmar seu padrão..."
        setIsTyping(true);
        await delay(1500);
        setIsTyping(false);
        addMessage("Precisamos confirmar seu padrão de rotina para fechar sua análise.", "ia");

        // 2. "Quantas horas...?"
        await delay(1000);
        setIsTyping(true);
        await delay(1500);
        setIsTyping(false);
        addMessage("Quantas horas por dia você roda de moto?", "ia");

        setShowOptions(["Menos de 4h", "4h a 8h", "Mais de 10h"]);
    };

    const handleOptionClick = async (option: string) => {
        setShowOptions(null);
        addMessage(option, "user");

        // Logic based on current step could be here, but for linear demo we just advance
        const currentMsgCount = messages.length; // Approximate step tracking

        // Determine next step based on how many messages we have (User answers trigger next IA q)
        // We can just run a sequence function based on context

        // We need to know WHICH question was just answered. 
        // Let's use a step counter or just switch case based on last IA message? 
        // Simpler: Just chain the next steps here.
        // Ideally we'd have a state machine, but this is a scripted demo.

        // Check if we just answered "Quantas horas..."
        // Next: "Você passa por bairros 'zona vermelha'?"
        // Next: "Ultima: já perdeu moto...?"

        // Let's use a simple counter for "User Answers"
        // But since handleOptionClick is async and disconnected from scope, let's use a centralized sequencer or just quick hacks for the demo.

        // Actually, checking messages content is reliable enough for a linear script
        // Or just a simplistic state if we had one.
        // Let's assume the order is fixed.

        await delay(1000); // Wait a bit after user reply

        // Determine next question
        if (messages.some(m => m.text.includes("Quantas horas"))) {
            // Next: Zona Vermelha
            setIsTyping(true);
            await delay(2000);
            setIsTyping(false);
            addMessage("Você passa por bairros considerados 'zona vermelha' no seu trajeto?", "ia");
            setShowOptions(["Sim, frequentemente", "Às vezes", "Evito ao máximo"]);
            return;
        }

        if (messages.some(m => m.text.includes("zona vermelha"))) {
            // Next: Perdeu moto
            setIsTyping(true);
            await delay(2000);
            setIsTyping(false);
            addMessage("Última: já perdeu moto, peça ou sofreu tentativa?", "ia");
            setShowOptions(["Sim, infelizmente", "Tentativa", "Nunca"]);
            return;
        }

        if (messages.some(m => m.text.includes("sofreu tentativa"))) {
            // End sequence
            setIsTyping(true);
            await delay(2000); // Processing...
            setIsTyping(false);
            addMessage("Processando... aguarde.", "ia");

            await delay(2000);
            setIsTyping(true);
            await delay(1500);
            setIsTyping(false);
            addMessage("Seu nível combinado de exposição ficou em: ALTO.", "ia");

            // Redirect
            await delay(3000);
            router.push("/feed");
        }
    };

    // Bug fix: The logic above "some(m => includes)" will be true for ALL previous messages too.
    // We need to pick the LAST question logic.
    // Or simpler: count user answers.
    // Let's refactor handleOptionClick to just call `nextStep(stepIndex)` or similar.
    // Implemented below with a ref tracking "progress".

    const quizProgress = useRef(0);

    const handleOptionClickRobust = async (option: string) => {
        setShowOptions(null);
        addMessage(option, "user");
        await delay(800);

        const step = quizProgress.current;
        quizProgress.current += 1;

        if (step === 0) { // Answered "Quantas horas"
            setIsTyping(true);
            await delay(2000);
            setIsTyping(false);
            addMessage("Você passa por bairros considerados 'zona vermelha' no seu trajeto?", "ia");
            setShowOptions(["Sim, frequentemente", "Às vezes", "Evito ao máximo"]);
        } else if (step === 1) { // Answered "Zona vermelha"
            setIsTyping(true);
            await delay(2000);
            setIsTyping(false);
            addMessage("Última: já perdeu moto, peça ou sofreu tentativa?", "ia");
            setShowOptions(["Sim, infelizmente", "Tentativa", "Nunca"]);
        } else if (step === 2) { // Answered "Perdeu moto"
            // Process
            setIsTyping(true);
            await delay(2000);
            setIsTyping(false);
            addMessage("Processando... aguarde.", "ia");

            await delay(2000);
            setIsTyping(true);
            await delay(1500);
            setIsTyping(false);
            addMessage("Seu nível combinado de exposição ficou em: ALTO.", "ia");

            await delay(3000);
            router.push("/feed");
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#0b141a] text-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-[#202c33] px-4 py-3 flex items-center gap-4 shadow-sm z-10">
                <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-emerald-500"><ShieldAlert className="text-white h-6 w-6" /></AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <h1 className="font-semibold text-white">Sistema IA — Verificação</h1>
                    <p className="text-xs text-emerald-400">online</p>
                </div>
                <div className="flex gap-4 text-gray-400">
                    <Video className="h-5 w-5" />
                    <Phone className="h-5 w-5" />
                    <MoreVertical className="h-5 w-5" />
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://camo.githubusercontent.com/850e932918848d2870c91834168019e0b8e2333b2a2103f6f393845c4779836f/68747470733a2f2f7765622e77686174736170702e636f6d2f696d672f62672d636861742d74696c652d6461726b5f61346265353132653731393562366237333364393131306234303866303735642e706e67')] bg-repeat bg-fixed">
                {/* Encryption notice */}
                <div className="flex justify-center my-4">
                    <span className="bg-[#1f2c33] text-[#8696a0] text-xs px-3 py-1 rounded-lg text-center shadow-sm">
                        As mensagens são protegidas com criptografia de ponta-a-ponta.
                    </span>
                </div>

                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] rounded-lg px-3 py-1.5 shadow-sm text-sm ${msg.sender === "user" ? "bg-[#005c4b] text-white rounded-tr-none" : "bg-[#202c33] text-white rounded-tl-none"}`}>
                            <p className="break-words">{msg.text}</p>
                            <span className="text-[10px] text-gray-400 float-right ml-2 mt-1 block">{msg.time}</span>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
                        <div className="bg-[#202c33] p-3 rounded-lg rounded-tl-none shadow-sm flex gap-1">
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input / Options Area */}
            <div className="bg-[#202c33] p-4 min-h-[60px] flex items-center justify-center">
                {showOptions ? (
                    <div className="grid grid-cols-1 w-full gap-2">
                        {showOptions.map((opt) => (
                            <Button
                                key={opt}
                                onClick={() => handleOptionClickRobust(opt)}
                                className="bg-[#2a3942] hover:bg-[#374248] text-emerald-400 border border-[#374248] w-full justify-start text-left h-auto py-3"
                            >
                                {opt}
                            </Button>
                        ))}
                    </div>
                ) : (
                    <div className="text-gray-500 text-sm italic">
                        {isTyping ? "IA está digitando..." : "Aguardando resposta..."}
                    </div>
                )}
            </div>
        </div>
    );
}
