"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Globe, 
  Calendar, 
  Key, 
  Clock, 
  Hourglass, 
  QrCode, 
  Gamepad2, 
  Hash, 
  Timer, 
  ShieldCheck,
  ChevronRight,
  Zap,
  Shield,
  Activity,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const tools = [
  { title: "Timezones", url: "/timezones", icon: Globe, color: "text-blue-500", bg: "bg-blue-500/10", desc: "Global temporal mapping" },
  { title: "Daily Planner", url: "/daily-planner", icon: Calendar, color: "text-emerald-500", bg: "bg-emerald-500/10", desc: "Tactical task management" },
  { title: "Password Gen", url: "/password-generator", icon: Key, color: "text-amber-500", bg: "bg-amber-500/10", desc: "Cryptographic vault" },
  { title: "Pomodoro", url: "/pomodoro", icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10", desc: "Neural focus cycles" },
  { title: "Timer", url: "/timer", icon: Hourglass, color: "text-teal-500", bg: "bg-teal-500/10", desc: "Precision intervals" },
  { title: "QR Hub", url: "/qrcode", icon: QrCode, color: "text-purple-500", bg: "bg-purple-500/10", desc: "Encoded data matrix" },
  { title: "Stopwatch", url: "/stopwatch", icon: Timer, color: "text-indigo-500", bg: "bg-indigo-500/10", desc: "Sub-millisecond logs" },
  { title: "JWT Tool", url: "/jwt", icon: ShieldCheck, color: "text-rose-500", bg: "bg-rose-500/10", desc: "Token architecture" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-blue-500/30">
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32 space-y-32">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center space-y-8">
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl"
            >
                <Zap className="w-3.5 h-3.5 text-blue-500" />
                V 2.0 Architectural Core
            </motion.div>
            <div className="space-y-4">
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.9]">
                    BYTE <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600">TOOLS</span>
                </h1>
                <p className="text-muted-foreground text-sm font-medium uppercase tracking-[0.4em] opacity-40">Tactical Utility OS for High-Fidelity Logic</p>
            </div>
            <div className="flex items-center gap-4 pt-8">
                <Link href="/daily-planner">
                    <Button className="h-16 px-10 rounded-2xl bg-zinc-50 text-zinc-950 font-black uppercase tracking-widest text-xs hover:bg-white shadow-2xl transition-all active:scale-95 group">
                        Initialize Session
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </Link>
                <Link href="/jwt">
                    <Button variant="ghost" className="h-16 px-10 rounded-2xl font-black uppercase tracking-widest text-xs border border-zinc-800 hover:bg-zinc-800/50 transition-all">
                        Tool Matrix
                    </Button>
                </Link>
            </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((tool, i) => (
                <Link href={tool.url} key={i}>
                    <motion.div
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="group h-full p-10 rounded-[2.5rem] bg-card/40 border border-border/50 hover:border-blue-500/30 hover:bg-card transition-all shadow-xl relative overflow-hidden"
                    >
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110", tool.bg)}>
                            <tool.icon className={cn("w-7 h-7", tool.color)} />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest mb-2 group-hover:text-blue-500 transition-colors">{tool.title}</h3>
                        <p className="text-[11px] font-bold uppercase tracking-widest opacity-30 leading-relaxed mb-8">{tool.desc}</p>
                        <div className="flex items-center text-[9px] font-black uppercase tracking-[0.2em] text-blue-500 opacity-0 group-hover:opacity-100 transition-all">
                            Access Node <ChevronRight className="w-3 h-3 ml-1" />
                        </div>
                    </motion.div>
                </Link>
            ))}
        </div>

        {/* Info Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-24 border-t border-border/10">
            {[
                { icon: Shield, title: "Zero Drift Security", desc: "All cryptographic operations and tactical data are processed with edge-level encryption.", color: "text-blue-500", bg: "bg-blue-500/10" },
                { icon: Zap, title: "Neural Latency", desc: "Sub-millisecond feedback loops across the entire tool matrix architecture.", color: "text-amber-500", bg: "bg-amber-500/10" },
                { icon: Activity, title: "Cloud Mesh Sync", desc: "Your configuration and logs are synchronized across your local and cloud infrastructure.", color: "text-emerald-500", bg: "bg-emerald-500/10" }
            ].map((item, i) => (
                <div key={i} className="space-y-6">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", item.bg)}>
                        <item.icon className={cn("w-6 h-6", item.color)} />
                    </div>
                    <h4 className="text-xs font-black uppercase tracking-[0.2em]">{item.title}</h4>
                    <p className="text-[11px] text-muted-foreground/60 leading-relaxed font-bold uppercase tracking-tight">{item.desc}</p>
                </div>
            ))}
        </div>

        {/* Footer */}
        <div className="pt-32 pb-12 flex flex-col items-center gap-8 text-center border-t border-border/10">
            <h2 className="text-4xl font-black tracking-tighter uppercase opacity-10">BYTE TOOLS SYSTEM</h2>
            <div className="flex items-center gap-12">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30">Open Source Protocol</span>
                <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30">Secured Architecture</span>
                <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30">v2.0.4-Stable</span>
            </div>
        </div>
      </main>
    </div>
  );
}
